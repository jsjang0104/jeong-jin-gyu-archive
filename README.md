---
title: jeong-jin-gyu-archive
emoji: 📜
colorFrom: gray
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

<!--
  위 YAML 블록은 Hugging Face Spaces가 Space 설정(제목/아이콘/Docker SDK/포트)을
  읽어들이는 메타데이터다. GitHub에서는 그냥 frontmatter 텍스트로 보이므로
  일반 README 본문은 이 블록 아래 그대로 유지한다.
-->

# 정진규 아카이브 (jeong-jin-gyu-archive)

시인 정진규(鄭鎭圭, 호 絅山 경산, 1939–2017)의 문학 아카이브 웹사이트 **데모 버전**입니다.

시인의 아드님이신 정민영 교수님 (한국외국어대학교 독일어과) 네이버 블로그(blog.naver.com/dramaturgie)에 아카이빙해 오던 육필 원고·유품·문헌·사진 자료를 정식 웹사이트로 이전하기 위한 프로젝트이며, 이 데모를 먼저 보여드리고 피드백을 받아 이후 버전을 다듬어 나갈 예정입니다.

> 이 저장소는 `austrian-library-hufs` 프로젝트의 구조(레포 레이아웃, Django + DRF 백엔드 패턴, Vercel + Render 배포 방식)를 최대한 그대로 미러링해서 만들었습니다. 유지보수 담당자가 이미 익숙한 구조를 그대로 따르기 위함입니다.

## 스크린샷

_(데모 배포 후 추가 예정)_

## 프로젝트 구조

```
jeong-jin-gyu-archive/
├── README.md
├── requirements.txt        # 백엔드 파이썬 의존성 (루트에 위치, Docker/Render 빌드가 루트에서 pip install)
├── Dockerfile              # Hugging Face Spaces(Docker SDK) 배포용 백엔드 이미지
├── docker-entrypoint.sh    # 컨테이너 시작 스크립트 (migrate → seed_demo → collectstatic → gunicorn)
├── .dockerignore
├── render.yaml             # (대안) Render 배포 설정 — 계속 유지
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

- **Backend**: Django 5 + Django REST Framework, JWT 인증(`djangorestframework-simplejwt`), SQLite(로컬 폴백)/PostgreSQL(배포), Gemini API를 이용한 이미지 OCR 자동 등록 기능.
- **Frontend**: Vite + React 19, react-router-dom(BrowserRouter), axios. Tailwind 없이 순수 CSS로 "Aesop/Diptyque 편집 미니멀리즘 × 한국 문학" 컨셉의 디자인 시스템을 구현.
- **배포**: Backend는 [Hugging Face Spaces](https://huggingface.co/spaces)(Docker), DB는 [Neon](https://neon.tech/)(PostgreSQL, `DATABASE_URL`), Frontend는 [Vercel](https://vercel.com/). (대안으로 Render 배포도 계속 지원합니다 — 아래 참고.)

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

## 배포 가이드: Hugging Face Spaces(backend) + Neon(DB) + Vercel(frontend)

Render 무료 플랜의 제약(슬립/리소스 한도) 때문에 backend는 **Hugging Face Spaces의 Docker Space**로 배포합니다. DB는 서버리스 Postgres인 **Neon**, frontend는 지금까지와 동일하게 **Vercel**입니다.

### 1. Backend → Hugging Face Spaces (Docker)

1. [huggingface.co/new-space](https://huggingface.co/new-space)에서 새 Space를 만듭니다. SDK로 **Docker**를 선택합니다(Blank 템플릿이면 충분합니다 — 이 저장소 루트의 `Dockerfile`을 그대로 사용하므로 별도 템플릿 코드는 필요 없습니다).
2. 이 저장소를 Space에 연결하는 두 가지 방법 중 하나를 선택합니다.
   - **GitHub 연동**: Space 설정에서 "Link to a GitHub repository"로 이 GitHub 저장소를 연결하면 push할 때마다 자동으로 다시 빌드됩니다.
   - **git remote로 직접 push**:
     ```bash
     git remote add hf https://huggingface.co/spaces/<user>/<space>
     git push hf main
     ```
3. Space의 **Settings → Variables and secrets**에서 다음을 등록합니다.
   - `SECRET_KEY` (Secret) — Django `SECRET_KEY`. 임의의 긴 무작위 문자열로 설정합니다.
   - `DEBUG` (Variable) — `false`
   - `DATABASE_URL` (Secret) — Neon 대시보드에서 발급받은 connection string(`postgresql://...`). `dj-database-url`이 이미 이 값을 파싱하도록 `backend/config/settings.py`에 설정되어 있습니다.
   - `GEMINI_API_KEY` (Secret, 선택) — AI 자동 등록 기능을 실제로 동작시키려면 입력합니다. 비워두면 데모 응답(`"demo": true`)으로 대체됩니다.
4. 저장 후 Space가 Docker 이미지를 빌드/기동합니다. `Dockerfile`의 시작 스크립트(`docker-entrypoint.sh`)가 `migrate` → `seed_demo`(멱등) → `collectstatic`을 순서대로 실행한 뒤 gunicorn을 포트 `7860`에서 띄웁니다.
5. 빌드가 끝나면 backend URL은 `https://<user>-<space>.hf.space` 형태입니다. `https://<user>-<space>.hf.space/api/summary/`에 접속해 200 응답이 오는지 확인합니다.

### 2. DB → Neon

1. [neon.tech](https://neon.tech/)에서 무료 프로젝트를 생성합니다.
2. 대시보드에서 connection string(`postgresql://user:password@host/dbname?sslmode=require` 형태)을 복사해 위 `DATABASE_URL` 시크릿에 붙여넣습니다.
3. `DATABASE_URL`을 설정하지 않으면 컨테이너는 자동으로 내부 SQLite로 폴백합니다 — 컨테이너가 죽지는 않지만, 재시작(재배포·슬립 복귀 등)마다 데이터가 초기화되고 `seed_demo`가 다시 채웁니다. **데모 용도가 아니라면 반드시 Neon의 `DATABASE_URL`을 설정하세요.**

### 3. Frontend → Vercel

1. Vercel에서 이 저장소를 연결하고 Root Directory를 `frontend`로 지정합니다.
2. 환경변수 `VITE_API_URL`을 위에서 확인한 HF Spaces backend URL로 설정합니다(예: `https://<user>-<space>.hf.space`).
3. `frontend/vercel.json`의 SPA rewrite 설정이 react-router-dom의 BrowserRouter와 함께 동작하도록 이미 구성되어 있습니다.

### ⚠️ 미디어 업로드는 ephemeral(휘발성)입니다

Hugging Face Spaces의 기본(무료) 컨테이너 스토리지는 **영구 저장소가 아닙니다.** Space가 재시작/재빌드/슬립 후 재개될 때마다 컨테이너 파일시스템이 초기화되므로:

- 관리자 화면(`/manage/*`)이나 AI 자동 등록으로 새로 업로드한 이미지(`backend/media/`)는 재시작 시 사라집니다.
- `backend/media/seed/`에 git으로 커밋된 시드 이미지는 이미지 자체가 저장소에 있으므로 재시작해도 다시 나타납니다(seed_demo가 매번 다시 연결).
- 업로드 콘텐츠를 영구 보존하려면 HF Spaces의 유료 Persistent Storage를 추가하거나, 이미지 저장을 S3/Cloudinary 등 외부 오브젝트 스토리지로 옮기는 후속 작업이 필요합니다(현재는 미구현).

### 대안: Render

기존 Render 배포 방식도 계속 지원합니다(`render.yaml` 유지). Render 무료 플랜은 일정 시간 미사용 시 슬립되고 리소스 한도가 있어 HF Spaces를 기본값으로 바꿨지만, 필요하면 아래 방식으로 그대로 배포할 수 있습니다.

1. Render 대시보드에서 "New Web Service"로 이 저장소를 연결합니다.
2. 루트의 `render.yaml`을 그대로 사용하면(Blueprint) buildCommand/startCommand가 자동 설정됩니다.
   - buildCommand: `pip install -r requirements.txt && cd backend && python manage.py collectstatic --no-input && python manage.py migrate && python manage.py seed_demo`
   - startCommand: `gunicorn --chdir backend config.wsgi:application --bind 0.0.0.0:$PORT`
3. 환경변수 `GEMINI_API_KEY`를 Render 대시보드에서 직접 입력합니다(`sync: false`로 되어 있어 자동 동기화되지 않습니다).
4. `DATABASE_URL`을 Render PostgreSQL 인스턴스(또는 Neon)와 연결하면 SQLite 대신 PostgreSQL을 사용합니다(연결하지 않으면 SQLite로 동작 — 데모 용도로는 충분하지만 재배포 시 데이터가 초기화될 수 있습니다).
5. Frontend(Vercel)의 `VITE_API_URL`을 Render 백엔드 URL로 설정합니다(예: `https://jeong-jin-gyu-archive-backend.onrender.com`).

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
