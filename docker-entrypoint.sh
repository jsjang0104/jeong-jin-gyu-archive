#!/bin/bash
# HF Spaces 컨테이너 시작 스크립트.
#
# 순서: migrate -> seed_demo(멱등) -> collectstatic -> gunicorn
#
# - DATABASE_URL이 없으면 settings.py가 자동으로 SQLite로 폴백하므로 이 스크립트는
#   그대로 동작한다(컨테이너가 죽지 않는다). 다만 SQLite는 컨테이너 재시작 시
#   초기화되므로 매번 새로 migrate + seed된다.
# - Neon 같은 서버리스 Postgres는 콜드 스타트로 첫 연결이 지연될 수 있어 migrate에
#   짧은 재시도를 둔다.
# - seed_demo/collectstatic은 실패하더라도 gunicorn 기동 자체를 막지 않는다(경고만
#   남기고 계속 진행) — 컨테이너가 죽지 않아야 한다는 요구사항에 따른 것이다.

set -uo pipefail

cd /app/backend

echo "[entrypoint] Running migrate..."
MAX_RETRIES=5
attempt=0
until python manage.py migrate --no-input; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
        echo "[entrypoint] ERROR: migrate failed after ${MAX_RETRIES} attempts, aborting." >&2
        exit 1
    fi
    echo "[entrypoint] migrate failed (attempt ${attempt}/${MAX_RETRIES}); retrying in 3s (DB may be waking up)..."
    sleep 3
done

echo "[entrypoint] Running seed_demo (idempotent)..."
python manage.py seed_demo || echo "[entrypoint] WARNING: seed_demo failed, continuing startup anyway."

echo "[entrypoint] Running collectstatic..."
python manage.py collectstatic --no-input || echo "[entrypoint] WARNING: collectstatic failed, continuing startup anyway."

PORT="${PORT:-7860}"
echo "[entrypoint] Starting gunicorn on 0.0.0.0:${PORT}..."
exec gunicorn config.wsgi:application \
    --bind "0.0.0.0:${PORT}" \
    --workers "${GUNICORN_WORKERS:-2}" \
    --timeout "${GUNICORN_TIMEOUT:-60}"
