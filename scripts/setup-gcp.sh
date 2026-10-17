#!/usr/bin/env bash
# One-time Google Cloud setup for Vigor, then deploy via scripts/deploy-gcp.sh.
# Usage: VIGOR_GCP_PROJECT=my-project VIGOR_GCP_REGION=asia-southeast2 bash scripts/setup-gcp.sh
# Reads GEMINI_API_KEY and GEMINI_MODEL from .env.local; the key goes to Secret Manager via stdin, never a shell argument.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${VIGOR_GCP_PROJECT:?Set the target Google Cloud project ID}"
: "${VIGOR_GCP_REGION:?Set a Cloud Run region, e.g. asia-southeast2 (Jakarta)}"
[ -f .env.local ] || { echo ".env.local not found" >&2; exit 1; }
set -a; . ./.env.local; set +a
: "${GEMINI_API_KEY:?GEMINI_API_KEY missing in .env.local}"
: "${GEMINI_MODEL:?GEMINI_MODEL missing in .env.local}"

SA_NAME="${VIGOR_RUN_SA_NAME:-vigor-runtime}"
SECRET="${VIGOR_GEMINI_SECRET:-vigor-gemini-api-key}"
SA_EMAIL="${SA_NAME}@${VIGOR_GCP_PROJECT}.iam.gserviceaccount.com"
PROJECT_NUMBER="$(gcloud projects describe "$VIGOR_GCP_PROJECT" --format='value(projectNumber)')"

echo "==> Enabling APIs"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com --project "$VIGOR_GCP_PROJECT"

echo "==> Runtime service account: $SA_EMAIL"
gcloud iam service-accounts describe "$SA_EMAIL" --project "$VIGOR_GCP_PROJECT" >/dev/null 2>&1 \
  || gcloud iam service-accounts create "$SA_NAME" --project "$VIGOR_GCP_PROJECT" --display-name "Vigor Cloud Run runtime"

echo "==> Secret: $SECRET"
if gcloud secrets describe "$SECRET" --project "$VIGOR_GCP_PROJECT" >/dev/null 2>&1; then
  printf '%s' "$GEMINI_API_KEY" | gcloud secrets versions add "$SECRET" --project "$VIGOR_GCP_PROJECT" --data-file=-
else
  printf '%s' "$GEMINI_API_KEY" | gcloud secrets create "$SECRET" --project "$VIGOR_GCP_PROJECT" --replication-policy automatic --data-file=-
fi
gcloud secrets add-iam-policy-binding "$SECRET" --project "$VIGOR_GCP_PROJECT" \
  --member "serviceAccount:$SA_EMAIL" --role roles/secretmanager.secretAccessor >/dev/null

echo "==> Build permissions for the default Cloud Build / Compute service accounts"
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
for m in "serviceAccount:$CB_SA" "serviceAccount:$COMPUTE_SA"; do
  gcloud projects add-iam-policy-binding "$VIGOR_GCP_PROJECT" --member "$m" --role roles/cloudbuild.builds.builder --quiet >/dev/null 2>&1 || true
done
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" --project "$VIGOR_GCP_PROJECT" \
  --member "user:$(gcloud config get-value account 2>/dev/null)" --role roles/iam.serviceAccountUser --quiet >/dev/null

echo "==> Deploying"
VIGOR_RUN_SERVICE_ACCOUNT="$SA_EMAIL" VIGOR_GEMINI_SECRET="$SECRET" VIGOR_GEMINI_MODEL="$GEMINI_MODEL" \
  bash scripts/deploy-gcp.sh

echo "==> Done. Service URL:"
gcloud run services describe vigor --project "$VIGOR_GCP_PROJECT" --region "$VIGOR_GCP_REGION" --format='value(status.url)'
