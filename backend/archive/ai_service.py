"""
Gemini 멀티모달 API를 이용한 아카이브 자료 이미지 OCR/분류 제안.

austrian-library-hufs의 library/signals.py `_gemini()` REST 호출 패턴을 참고하되,
이미지(inline_data, base64)를 함께 보내는 멀티모달 요청으로 확장했다.

GEMINI_API_KEY가 설정되어 있지 않거나 호출/파싱이 실패하면 데모용 mock 응답
(`"demo": true`)으로 폴백한다 — 키 없이도 데모 시연이 가능해야 하기 때문이다.
"""

import base64
import json
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta"
    "/models/gemini-2.0-flash:generateContent"
)

_PROMPT = (
    "이 이미지는 시인 정진규(1939–2017)의 아카이브 자료다"
    "(육필 원고, 시작 노트, 문헌, 유품, 사진 중 하나). "
    "이미지에서 다음을 추출해 JSON으로만 답하라: "
    "type(MANUSCRIPT|ARTIFACT|DOCUMENT|PHOTO), "
    "title(자료 제목 제안), "
    "date_text(연대 추정, 모르면 빈 문자열), "
    "year(정수 or null), "
    "description(2~3문장 자료 설명), "
    "ocr_text(이미지 속 모든 글자를 가능한 그대로 전사 — 한자 포함, 판독 불가 글자는 □)."
)

_MOCK_RESPONSE = {
    "suggested": {
        "type": "MANUSCRIPT",
        "title": "육필 원고 (예시)",
        "date_text": "1950년대 말~1960년대 초",
        "year": None,
        "description": (
            "정진규 시인의 습작기 육필 원고로 추정되는 자료입니다. "
            "(GEMINI_API_KEY 미설정 — 예시 응답입니다)"
        ),
        "ocr_text": "판독 예시 텍스트 □□□",
    },
    "demo": True,
}


def _build_prompt(hint: str) -> str:
    if hint:
        return f"{_PROMPT}\n\n참고 힌트(등록자 제공): {hint}"
    return _PROMPT


def _call_gemini(api_key: str, image_bytes: bytes, mime_type: str, hint: str) -> dict:
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": _build_prompt(hint)},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64.b64encode(image_bytes).decode("ascii"),
                        }
                    },
                ]
            }
        ],
        "generationConfig": {"response_mime_type": "application/json"},
    }
    resp = requests.post(f"{_GEMINI_URL}?key={api_key}", json=payload, timeout=60)
    resp.raise_for_status()
    text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)


def extract_from_image(image_bytes: bytes, mime_type: str, hint: str = "") -> dict:
    api_key = getattr(settings, "GEMINI_API_KEY", "") or ""

    if not api_key:
        return _MOCK_RESPONSE

    try:
        suggested = _call_gemini(api_key, image_bytes, mime_type, hint)
        return {
            "suggested": {
                "type": suggested.get("type", "DOCUMENT"),
                "title": suggested.get("title", ""),
                "date_text": suggested.get("date_text", ""),
                "year": suggested.get("year"),
                "description": suggested.get("description", ""),
                "ocr_text": suggested.get("ocr_text", ""),
            },
            "demo": False,
        }
    except Exception as exc:
        logger.warning("Gemini 이미지 분석 실패, mock 응답으로 폴백: %s", exc)
        return _MOCK_RESPONSE
