#!/usr/bin/env bash
# Run from an authenticated Google Cloud Shell or workstation. No keys in arguments.
set -euo pipefail
: "${VIGOR_GCP_PROJECT:?Set the target Google Cloud project ID}"
: "${VIGOR_GCP_REGION:?Set a Cloud Run region}"
: "${VIGOR_RUN_SERVICE_ACCOUNT:?Set the dedicated runtime service-account email}"
: "${VIGOR_GEMINI_SECRET:?Set an existing Secret Manager secret name}"
: "${VIGOR_GEMINI_MODEL:?Set a Gemini model ID available to this project}"
command -v gcloud >/dev/null || { echo 'Install Google Cloud CLI or use Cloud Shell.' >&2; exit 1; }
case "$VIGOR_GEMINI_MODEL" in gemini-*) ;; *) echo 'Expected a Gemini model ID.' >&2; exit 1 ;; esac
cd "$(dirname "$0")/.."
gcloud run deploy vigor \
  --project "$VIGOR_GCP_PROJECT" \
  --region "$VIGOR_GCP_REGION" \
  --source . \
  --service-account "$VIGOR_RUN_SERVICE_ACCOUNT" \
  --no-allow-unauthenticated \
  --set-secrets "GEMINI_API_KEY=$VIGOR_GEMINI_SECRET:latest" \
  --set-env-vars "GEMINI_MODEL=$VIGOR_GEMINI_MODEL" \
  --port 8080 --memory 512Mi --cpu 1 \
  --min-instances 0 --max-instances 1 --concurrency 8 --timeout 60
