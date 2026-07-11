# Hugging Face Spaces (Docker SDK) 배포용 이미지.
#
# - Backend(Django + DRF + gunicorn)만 담는다. Frontend는 Vercel에 별도 배포한다.
# - DB는 기본적으로 DATABASE_URL(Neon Postgres 등)을 사용하고, 값이 없으면
#   컨테이너 내부 SQLite로 자동 폴백한다(backend/config/settings.py 참고).
#   SQLite 폴백 시 데이터는 컨테이너 재시작마다 소실되지만, 시작 스크립트가
#   매번 migrate + seed_demo(멱등)를 실행하므로 데모 데이터는 다시 채워진다.
# - HF Spaces 컨벤션에 맞춰 uid 1000 non-root 사용자로 실행하고,
#   media/staticfiles/HOME을 모두 쓰기 가능하게 만든 뒤 포트 7860에서 서비스한다.

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_SETTINGS_MODULE=config.settings \
    HOME=/home/user \
    PORT=7860

WORKDIR /app

# HF Spaces는 컨테이너를 uid 1000으로 실행하는 것을 권장한다.
RUN useradd --create-home --uid 1000 user

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# 런타임에 쓰기가 필요한 디렉터리(SQLite 폴백 DB, 업로드 미디어, 정적 수집 결과)를
# 미리 만들고 소유권을 non-root 사용자에게 넘긴다.
RUN mkdir -p ./backend/media ./backend/staticfiles \
    && chmod +x ./docker-entrypoint.sh \
    && chown -R user:user /app /home/user

USER user

EXPOSE 7860

ENTRYPOINT ["./docker-entrypoint.sh"]
