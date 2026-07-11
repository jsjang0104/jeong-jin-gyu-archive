# 정진규 아카이브 (jeong-jin-gyu-archive)

시인 정진규(鄭鎭圭, 호 絅山 경산, 1939–2017)의 문학 아카이브 웹사이트 **데모 버전**입니다.

시인의 아드님이 네이버 블로그(blog.naver.com/dramaturgie)에 아카이빙해 오던 육필 원고·유품·문헌·사진 자료를 정식 웹사이트로 이전하기 위한 프로젝트이며, 이 데모를 먼저 보여드리고 피드백을 받아 이후 버전을 다듬어 나갈 예정입니다.

> 이 저장소는 `austrian-library-hufs` 프로젝트의 구조(레포 레이아웃, Django + DRF 백엔드 패턴, Vercel + Render 배포 방식)를 최대한 그대로 미러링해서 만들었습니다. 유지보수 담당자가 이미 익숙한 구조를 그대로 따르기 위함입니다.

## 스크린샷

_(데모 배포 후 추가 예정)_

## 프로젝트 구조

```
jeong-jin-gyu-archive/
├── README.md
├── requirements.txt        # 백엔드 파이썬 의존성 (루트에 위치, Render buildCommand가 루트에서 pip install)
├── render.yaml             # Render 배포 설정 (백엔드)
├── .gitignore
├── backend/                # Django 5 + DRF REST API
│   ├── manage.py
│   ├── config/              # settings.py, urls.py, wsgi.py, asgi.py
│   ├── archive/             # 메인 앱: models, serializers, views, urls, admin, ai_service.py
│   │   ├── fixtures/                          # 시드용 원본 데이터(JSON)
│   │   └── management/commands/seed_demo.py   # 데모 데이터 시드 (멱등)
│   └── media/
│       └── seed/            # 네이버 블로그 아카이브에서 내려받은 시드 이미지 (git에 커밋됨)
├── frontend/                # Vite + React 19 SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json          # SPA rewrite 설정
│   └── src/
└── docs/
```

## 아키텍처

- **Backend**: Django 5 + Django REST Framework, JWT 인증(`djangorestframework-simplejwt`), SQLite(로컬)/PostgreSQL(배포), Gemini API를 이용한 이미지 OCR 자동 등록 기능.
- **Frontend**: Vite + React 19, react-router-dom(BrowserRouter), axios. Tailwind 없이 순수 CSS로 "Aesop/Diptyque 편집 미니멀리즘 × 한국 문학" 컨셉의 디자인 시스템을 구현.
- **배포**: Backend는 [Render](https://render.com/)(Web Service), Frontend는 [Vercel](https://vercel.com/) — austrian-library-hufs와 동일한 방식입니다.

## 로컬 실행

### 1. Backend (Django)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r ../requirements.txt

python manage.py migrate
python manage.py seed_demo        # 데모 데이터 시드 (Collection 18권, Poem, ArchiveItem, TimelineEvent, 관리자 계정)
python manage.py runserver        # http://127.0.0.1:8000
```

`seed_demo`는 몇 번을 다시 실행해도 안전합니다(멱등). 이미 있는 데이터는 건너뜁니다.

**관리자 계정** (Django admin `/admin/` 및 프론트엔드 `/manage/*` 로그인 공용):

```
아이디: admin
비밀번호: gyeongsan2026
```

배포 전 반드시 비밀번호를 변경하세요.

#### GEMINI_API_KEY 설정 (선택)

`/manage/ai-upload`의 AI 자동 등록 기능(육필 원고 이미지를 업로드하면 Gemini가 유형·제목·연대·설명·판독 텍스트를 제안)은 Google Gemini API 키가 있어야 실제로 동작합니다.

1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료 API 키를 발급받습니다.
2. `backend/.env` 파일을 만들고 아래처럼 작성합니다.

```
GEMINI_API_KEY=your-api-key-here
```

**키를 설정하지 않아도 데모는 정상적으로 동작합니다.** 키가 없거나 호출에 실패하면 서버가 자동으로 그럴듯한 예시 응답(`"demo": true`)을 반환하도록 만들어져 있어, 데모 시연 중 이 기능도 그대로 보여드릴 수 있습니다.

### 2. Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

`frontend/.env`의 `VITE_API_URL`이 백엔드 주소를 가리킵니다(로컬 기본값 `http://127.0.0.1:8000`).

```
VITE_API_URL=http://127.0.0.1:8000
```

## 배포 가이드 (austrian-library-hufs와 동일한 방식)

### Backend → Render

1. Render 대시보드에서 "New Web Service"로 이 저장소를 연결합니다.
2. 루트의 `render.yaml`을 그대로 사용하면(Blueprint) buildCommand/startCommand가 자동 설정됩니다.
   - buildCommand: `pip install -r requirements.txt && cd backend && python manage.py collectstatic --no-input && python manage.py migrate && python manage.py seed_demo`
   - startCommand: `gunicorn --chdir backend config.wsgi:application --bind 0.0.0.0:$PORT`
3. 환경변수 `GEMINI_API_KEY`를 Render 대시보드에서 직접 입력합니다(`sync: false`로 되어 있어 자동 동기화되지 않습니다).
4. `DATABASE_URL`을 Render PostgreSQL 인스턴스와 연결하면 SQLite 대신 PostgreSQL을 사용합니다(연결하지 않으면 SQLite로 동작 — 데모 용도로는 충분하지만 재배포 시 데이터가 초기화될 수 있습니다).

### Frontend → Vercel

1. Vercel에서 이 저장소를 연결하고 Root Directory를 `frontend`로 지정합니다.
2. 환경변수 `VITE_API_URL`을 Render 백엔드 URL로 설정합니다(예: `https://jeong-jin-gyu-archive-backend.onrender.com`).
3. `frontend/vercel.json`의 SPA rewrite 설정이 react-router-dom의 BrowserRouter와 함께 동작하도록 이미 구성되어 있습니다.

## 데모 데이터에 대한 주의사항

이 데모의 콘텐츠는 실제 사이트 오픈 전 레이아웃·기능 검증을 위한 것으로, 다음과 같은 한계가 있습니다.

- **시(詩) 본문은 저작권 문제로 인해 실제 작품이 아닌 플레이스홀더 텍스트**로 채워져 있습니다. 실제 시 본문은 저작권자(유족) 확인 후 정식 등재할 예정입니다.
- **연보(타임라인)와 시집 목록은 한국어 위키백과 등 공개 자료로 1차 검증**했지만, 유족께 재확인이 필요합니다.
- **아카이브 자료(육필/유품/문헌/사진)의 설명 문구는 네이버 블로그 원문 텍스트를 그대로 가져온 것**이며, 이미지 중 일부는 다운로드에 실패해 자리표시 이미지로 대체되어 있을 수 있습니다.
- 관리자 화면(`/manage/*`)에서 언제든 내용을 수정·보완할 수 있습니다.

## API 개요

주요 엔드포인트만 요약합니다 (자세한 계약은 `backend/archive/` 코드 참고).

```
GET  /api/collections/            공개
GET  /api/collections/{id}/       공개
GET  /api/poems/                  공개 (?q=&collection=&featured=)
GET  /api/poems/{id}/             공개
GET  /api/archive-items/          공개 (?type=&q=)
GET  /api/archive-items/{id}/     공개
GET  /api/timeline/               공개
GET  /api/summary/                공개

POST /api/token/                  JWT 로그인
POST /api/token/refresh/          JWT 갱신

POST/PATCH/DELETE /api/collections/{id}/, /api/poems/{id}/, /api/archive-items/{id}/, /api/timeline/{id}/   인증 필요
POST /api/ai/extract/             인증 필요 (이미지 업로드 → Gemini OCR/분류 제안)
```

## 라이선스 / 출처

자료 출처: 유족 소장 자료. 문의: (추후 기재)
