#!/usr/bin/env bash
# Start the prebuilt Vigor server locally with the Gemini gateway configured.
# Reads GEMINI_API_KEY and GEMINI_MODEL from .env.local (gitignored). Never commit that file.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env.local ]; then
  set -a; . ./.env.local; set +a
fi
if [ -z "${GEMINI_API_KEY:-}" ]; then
  echo "GEMINI_API_KEY is not set. Copy .env.local.example to .env.local and fill it in." >&2
fi
export GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.8-flash}"
export PORT="${PORT:-8080}"
echo "Vigor -> http://localhost:${PORT}/login  (model: ${GEMINI_MODEL}, key: $([ -n "${GEMINI_API_KEY:-}" ] && echo set || echo missing))"
exec node dist-gcp/server.mjs
