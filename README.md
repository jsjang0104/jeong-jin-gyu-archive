# 정진규 아카이브 (jeong-jin-gyu-archive)

시인 정진규(鄭鎭圭, 호 絅山 경산, 1939–2017)의 문학 아카이브 웹사이트 **데모 버전**입니다.

시인의 장남 정민영 교수님(한국외국어대학교 독일어과)께서 네이버 블로그(blog.naver.com/dramaturgie)에 아카이빙해 오던 육필 원고·유품·문헌·사진 자료를 정식 웹사이트로 이전하기 위한 프로젝트이며, 이 데모를 먼저 보여드리고 피드백을 받아 이후 버전을 다듬어 나갈 예정입니다.

## 🌐 라이브 서비스

- **🌐 사이트**: https://jeong-jin-gyu-archive.vercel.app
- **⚙️ API 백엔드**: https://jsjang0104.pythonanywhere.com

> 이 저장소는 `austrian-library-hufs` 프로젝트의 구조(레포 레이아웃, Django + DRF 백엔드 패턴, Vercel + PythonAnywhere 배포 방식)를 최대한 그대로 미러링해서 만들었습니다. 유지보수 담당자가 이미 익숙한 구조를 그대로 따르기 위함입니다.

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
- **배포**: Backend는 [PythonAnywhere](https://www.pythonanywhere.com)(무료 플랜, SQLite), Frontend는 [Vercel](https://vercel.com/). (대안으로 HF Spaces/Render 배포도 계속 지원합니다 — 아래 참고.)

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

## 배포 가이드

권장 배포 방식은 다음과 같습니다.

### 권장: PythonAnywhere (무료)

PythonAnywhere의 Beginner(무료) 플랜을 사용하면 별도 인프라 비용 없이 Django 앱을 배포할 수 있습니다.

#### 1. 계정 생성

1. [pythonanywhere.com](https://www.pythonanywhere.com)에서 Beginner(무료) 계정을 생성합니다.

#### 2. 저장소 클론 및 가상환경 설정

Consoles → Bash를 열어 다음을 실행합니다:

```bash
git clone https://github.com/jsjang0104/jeong-jin-gyu-archive.git
mkvirtualenv --python=python3.13 archive-env
pip install -r jeong-jin-gyu-archive/requirements.txt
cd jeong-jin-gyu-archive/backend
python manage.py migrate
python manage.py seed_demo
```

#### 3. WSGI 설정

Web 탭에서 "Add a new web app" → "Manual configuration"을 선택해 다음을 구성합니다:

**Virtualenv 경로**: `/home/<username>/.virtualenvs/archive-env`

**WSGI 파일**: `/home/<username>/jeong-jin-gyu-archive/backend/config/wsgi.py`로 수정하고, 파일 편집 시 다음 코드를 적용합니다:

```python
import os
import sys

path = '/home/<username>/jeong-jin-gyu-archive/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**주의**: `sys.path`에 backend 디렉토리를 먼저 추가하지 않으면 `"No module named 'config'"` 에러가 발생합니다.

**환경변수 설정**: Bash 콘솔에서 다음을 실행해 `.env` 파일을 생성합니다:

```bash
cd jeong-jin-gyu-archive/backend
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(50))" > .env
echo "DEBUG=false" >> .env
# (선택) AI 자동 등록 기능을 사용하려면:
# echo "GEMINI_API_KEY=your-api-key" >> .env
```

#### 4. Static files 매핑

Web 탭의 "Static files" 섹션에서:

- URL `/static/` → `/home/<username>/jeong-jin-gyu-archive/backend/staticfiles`
- URL `/media/` → `/home/<username>/jeong-jin-gyu-archive/backend/media`

먼저 Bash 콘솔에서 `python manage.py collectstatic --no-input`을 실행해 정적 파일을 모읍니다.

#### 5. 배포 업데이트

이후 코드 변경을 배포하려면:

1. Bash 콘솔: `cd jeong-jin-gyu-archive && git pull`
2. Web 탭: "Reload" 버튼 클릭

### Vercel (Frontend)

Vercel에서 이 저장소의 `frontend` 디렉토리를 배포합니다.

#### 1. 저장소 연결 및 기본 설정

Vercel 대시보드에서 이 GitHub 저장소를 연결하고 다음을 설정합니다:

- **Root Directory**: `frontend`
- **Framework Preset**: Vite (Django로 자동 감지되면 수동으로 Vite로 변경)

#### 2. 환경변수 설정

**`VITE_API_URL`**: PythonAnywhere 백엔드 주소(끝 슬래시 없음)

```
VITE_API_URL=https://jsjang0104.pythonanywhere.com
```

설정 후 저장하면 Vercel이 자동으로 재배포합니다.

#### 3. 자동 배포

이 저장소로 push하면 Vercel이 자동으로 변경사항을 감지해 재배포합니다(별도 수동 트리거 불필요).

#### ⚠️ 주의사항

- **Gemini API 화이트리스트**: PythonAnywhere 무료 플랜은 외부 API 호출이 화이트리스트로 제한되지만, Google API (`.googleapis.com`)는 허용되므로 **Gemini API는 무료 티어에서도 정상 호출됩니다.** 키를 설정하면 `/manage/ai-upload`의 AI 자동 등록 기능이 실제로 동작합니다. 키가 없으면 자동으로 예시 응답(`"demo": true`)으로 대체됩니다.
- **SQLite 및 미디어 저장소**: 파일시스템이 영구 저장되므로 외부 데이터베이스는 불필요합니다. Neon 같은 PostgreSQL을 연결하면 더 안정적이지만, SQLite만 해도 데모 용도로는 충분합니다.

#### 📋 운영 체크리스트

배포 후 계속 서비스하려면 다음을 확인하세요:

1. **월 1회 활성화 갱신** (무료 플랜): PythonAnywhere 대시보드에서 "Run until 1 month from today" 버튼을 월 1회 클릭하세요. 비활성화 예고 메일이 오므로 그때 갱신하면 됩니다. 외부 ping 도구로는 이를 대체할 수 없습니다.
2. **코드 업데이트 반영**: 
   - Backend 업데이트: `git pull` (Bash 콘솔) → Web 탭 "Reload" 클릭 (자동 reload 아님)
   - Frontend 업데이트: Vercel은 GitHub push 시 자동 배포됨
3. **관리자 비밀번호 변경**: 최초 배포 후 Django admin(`/admin/`)에서 기본 계정(admin/gyeongsan2026)의 비밀번호를 반드시 변경하세요.

### 대안: Hugging Face Spaces (Docker)

**대안 사유**: 2026년부터 Hugging Face Docker SDK가 유료화되어 새 프로젝트에는 권장하지 않습니다. 기존 배포는 계속 운영 가능하며, 참고용으로 절차를 남겨둡니다.

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

**DB → Neon**: [neon.tech](https://neon.tech/)에서 무료 프로젝트를 생성하고, 대시보드의 connection string을 위 `DATABASE_URL` 시크릿에 붙여넣습니다.

**Frontend → Vercel**: Vercel에서 이 저장소를 연결하고 Root Directory를 `frontend`로 지정한 뒤, 환경변수 `VITE_API_URL`을 위에서 확인한 HF Spaces backend URL로 설정합니다(예: `https://<user>-<space>.hf.space`).

### ⚠️ 미디어 업로드는 ephemeral(휘발성)입니다 (HF Spaces)

Hugging Face Spaces의 기본(무료) 컨테이너 스토리지는 **영구 저장소가 아닙니다.** Space가 재시작/재빌드/슬립 후 재개될 때마다 컨테이너 파일시스템이 초기화되므로:

- 관리자 화면(`/manage/*`)이나 AI 자동 등록으로 새로 업로드한 이미지(`backend/media/`)는 재시작 시 사라집니다.
- `backend/media/seed/`에 git으로 커밋된 시드 이미지는 이미지 자체가 저장소에 있으므로 재시작해도 다시 나타납니다(seed_demo가 매번 다시 연결).
- 업로드 콘텐츠를 영구 보존하려면 HF Spaces의 유료 Persistent Storage를 추가하거나, 이미지 저장을 S3/Cloudinary 등 외부 오브젝트 스토리지로 옮기는 후속 작업이 필요합니다(현재는 미구현).

### 대안: Render

**대안 사유**: Render 무료 플랜은 다중 프로젝트 구분이 제한적이고 비활성 시 슬립되므로, PythonAnywhere를 기본값으로 권장합니다. 기존 배포는 계속 운영 가능하며, 참고용으로 절차를 남겨둡니다(`render.yaml` 유지).

1. Render 대시보드에서 "New Web Service"로 이 저장소를 연결합니다.
2. 루트의 `render.yaml`을 그대로 사용하면(Blueprint) buildCommand/startCommand가 자동 설정됩니다.
   - buildCommand: `pip install -r requirements.txt && cd backend && python manage.py collectstatic --no-input && python manage.py migrate && python manage.py seed_demo`
   - startCommand: `gunicorn --chdir backend config.wsgi:application --bind 0.0.0.0:$PORT`
3. 환경변수 `GEMINI_API_KEY`를 Render 대시보드에서 직접 입력합니다(`sync: false`로 되어 있어 자동 동기화되지 않습니다).
4. `DATABASE_URL`을 Render PostgreSQL 인스턴스(또는 Neon)와 연결하면 SQLite 대신 PostgreSQL을 사용합니다(연결하지 않으면 SQLite로 동작 — 데모 용도로는 충분하지만 재배포 시 데이터가 초기화될 수 있습니다).
5. Frontend(Vercel)의 `VITE_API_URL`을 Render 백엔드 URL로 설정합니다(예: `https://jeong-jin-gyu-archive-backend.onrender.com`).

## 데모 데이터에 대한 주의사항

이 데모의 콘텐츠는 실제 사이트 오픈 전 레이아웃·기능 검증을 위한 것으로, 다음과 같은 한계가 있습니다.

- **시(詩) 본문은 저작권 문제로 인해 실제 작품이 아닌 플레이스홀더 텍스트**로 채워져 있습니다. 실제 시 본문은 저작권자(정민영 교수님) 확인 후 정식 등재할 예정입니다.
- **연보(타임라인)와 시집 목록은 한국어 위키백과 등 공개 자료로 1차 검증**했지만, 정민영 교수님께 재확인이 필요합니다.
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

자료 출처: 정민영 교수님 소장 자료. 문의: (추후 기재)
