# Google Cloud Run deployment

Status: source and build target prepared. No GCP resources have been created and no live Gemini request has been verified. The existing private ChatGPT Site remains available for product review.

## Architecture

The GCP build uses the same `src/main.tsx` / `BrowserApp` and all existing pages. `vite.gcp.config.ts` builds the browser application, SQLite worker and WASM. `vite.gcp-server.config.ts` bundles the small Node HTTP server and Gemini gateway. The existing Sites/Vinext configuration remains unchanged.

Cloud Run serves both the app and `/api/ai/*` on one origin. It listens on `0.0.0.0:$PORT`. SQLite stays in each browser's IndexedDB; the server is stateless and does not store a database on Cloud Run's ephemeral disk. A new GCP URL is a different storage origin: export the SQLite backup from the Site and restore it in GCP through Settings → Data & backup. Existing browser data does not transfer automatically.

## Requirements

1. A Google Cloud project with billing enabled and permission to deploy Cloud Run from source. Enable Cloud Run, Cloud Build, Artifact Registry and Secret Manager APIs. Follow the current Cloud Run source deployment guide for build/service-account permissions.
2. Gemini Developer API access in Google AI Studio and a model ID available to the key's project. The model is runtime configuration, not embedded in the frontend. Vertex AI is a later alternative, not needed for this first implementation.
3. Store the Gemini key in Secret Manager using the Google Cloud console. Do not paste it into chat, code, browser storage, a backup, a shell argument or a `VITE_*` environment variable.
4. A dedicated runtime service account with `roles/secretmanager.secretAccessor` on that one secret. The deployer also needs permission to act as that account. The runtime service does not need project-owner permissions.

## Build and deploy

Use Node 22.12 or newer. The lockfile pins the existing dependencies; no Google SDK is required because the gateway uses Google's documented REST API through Node fetch.

```sh
npm ci --no-audit --no-fund
npm run build:gcp
```

The Dockerfile performs the same build and copies only `dist-gcp` into a non-root Node runtime. All runtime imports are Node built-ins; Zod is bundled. Secret files and local caches are excluded from build uploads.

In an authenticated Cloud Shell or workstation, set these **non-secret references** to your values:

```sh
export VIGOR_GCP_PROJECT='your-project-id'
export VIGOR_GCP_REGION='your-chosen-cloud-run-region'
export VIGOR_RUN_SERVICE_ACCOUNT='vigor-runtime@your-project-id.iam.gserviceaccount.com'
export VIGOR_GEMINI_SECRET='your-secret-name'
export VIGOR_GEMINI_MODEL='your-enabled-gemini-model-id'
bash scripts/deploy-gcp.sh
```

The script deploys **private** with IAM required. It does not grant public invocation. Review using an authenticated Cloud Run proxy:

```sh
gcloud run services proxy vigor --project "$VIGOR_GCP_PROJECT" --region "$VIGOR_GCP_REGION" --port 8080
```

Open the proxy URL printed by gcloud. For a judge-accessible endpoint, decide the access policy separately: grant named reviewers invocation or add verified app authentication/IAP before considering public invocation. Local role switching is not cloud identity. This build must not be exposed as an unrestricted public Gemini relay.

## Configuration and controls

| Item | Behavior |
|---|---|
| `GEMINI_API_KEY` | Server-only Secret Manager binding |
| `GEMINI_MODEL` | Explicit enabled Gemini model; missing/invalid means unavailable |
| `/api/ai/status` | Configuration status, no secret; configured is not proof of inference |
| `/api/ai/brief` | Same-origin POST, strict input, 96 KiB limit, valid timestamp and hash |
| Provider calls | 35-second deadline, cancellation, no automatic retries |
| Instance budget | 12 analyses/minute and at most 2 concurrent provider calls |
| Deployment budget | Maximum one instance for initial private prototype; min zero |
| Responses | At most 3 findings; existing IDs and matching evidence required |
| Actions | Existing local forms, permission checks and SQLite write validation |
| Logs | This code never logs prompts, keys or upstream error bodies; Cloud Run still logs request metadata |

The in-memory limiter resets on instance restart and is not a durable spending cap. Set a Google Cloud billing alert and API quota in the project. Billing alerts do not stop spending. Model prose can still be wrong even when its IDs are valid; a human reviews it. SHA-256 binds content, not ownership or authenticity. The prototype uses browser-supplied records; there is no shared cloud greenhouse database or server-side per-greenhouse authorization yet.

## Live acceptance checks after deployment

1. Confirm direct unauthenticated invocation is denied; use your authenticated access path.
2. Open Settings → AI integration; verify Cloud Run and the chosen model are shown.
3. Open Dashboard → Vigor assistant, select Gemini, ask: “What should I do before selling the affected zone's harvest?”
4. Check real model output and its evidence references. Export analysis to retain the model, request ID, usage, input snapshot and timing. Do not substitute a test fixture for this evidence.
5. Assign follow-up through the existing form, record care, then inspect/review the case. Confirm task completion alone does not release the lot. Test receipt and cost-review paths separately.
6. Change records while an analysis is pending; confirm it is rejected as stale. Test quota failure, cancellation and local lookup without network.
7. Run the evaluation cases in `HACKATHON_READINESS.md`. Review actual layouts at 390, 768, 1280 and 1440 px; test storage restore, worker/WASM requests, 3D and 2D fallback in a real browser.

## Official references checked 16 October 2026

- [Gemini generateContent API](https://ai.google.dev/api/generate-content)
- [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini model availability](https://ai.google.dev/gemini-api/docs/models)
- [Cloud Run container contract](https://docs.cloud.google.com/run/docs/container-contract)
- [Cloud Run source deployment](https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)
- [Cloud Run Secret Manager integration](https://docs.cloud.google.com/run/docs/configuring/services/secrets)

Model availability, permissions and quota must be checked in the actual project before deployment. No deployment price or field-savings claim has been assumed.
