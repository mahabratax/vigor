# AI support foundation

Vigor has local decision support plus a server-side Gemini implementation prepared for private Cloud Run. No key or GCP access has been provided, so live model inference and GCP deployment remain unverified. The private ChatGPT Site uses local lookup and shows Gemini setup as unavailable. No autonomous agronomy or physical hardware execution is implemented.

See [Google Cloud setup](GCP_DEPLOYMENT.md) and [hackathon readiness](HACKATHON_READINESS.md) for the deployment gates, evaluation cases and presentation sequence.

## Available workflow

1. Select a greenhouse. Dashboard → Vigor assistant is a compact command bar. Open it or ask a supported question about plant health, watering, harvests, payments or tasks.
2. A focused conversation drawer shows one current answer and next action. Sources, additional matches, workflow details and recent questions stay collapsed until requested. The question handler is bounded local record lookup, not a language model; unsupported questions receive an explicit capability explanation.
3. Record an inspection or assign a linked follow-up. Assignments persist in the existing normalized care task table, scoped to greenhouse, cycle, zone and planting batch. Relevant evidence is checked again before saving; retrying an assignment reuses its stable source key.
4. Record care results in the existing form. Follow-up retains the task and source links; completed work never closes a pest case or releases a lot automatically. A sensor issue requires a fresh usable reading inside the reviewed target range to count as verified in records.
5. Use existing lot review, sales and receipt forms from business priorities. The assistant recalculates remaining stock and receivables. It does not create transactions, savings or profit simply from accepting a suggestion.
6. On a configured Cloud Run deployment, select Gemini in the same drawer and ask a question. The response explains up to three current findings with evidence and uncertainty, then routes to the existing forms. Analysis exports include the actual model call metadata and input snapshot. Settings → AI integration shows runtime configuration and input quality. Automation → Preview checks blockers and planned steps without altering operations.

The assistant launcher is the first dashboard section. No priority table or evidence panel is expanded on the dashboard. The drawer becomes full-screen on mobile and keeps its question input at the bottom. A native dialog handles modal focus, Escape and backdrop close; closing restores the opener. Recent questions are scoped to the mounted greenhouse and are not persisted to SQLite. AI settings and preview remain tabs within existing sections. The daily guide highlights the assistant and its follow-up workflow.

## Local decision support and model analysis

`src/domain/assistant.ts` derives explanations and stable evidence fingerprints without mutation. Open cases are linked to actual harvest stock in their zone; those lots do not also create duplicate release suggestions. Stock reminders reuse their existing maintenance ticket. Financial suggestions distinguish unsold stock, receivables, cash and reviewed profit. Payment receipt records do not invalidate an otherwise reviewed cost allocation.

`src/domain/assistantActions.ts` handles only care-task assignment through the existing production action. The normal permission gate requires cultivation access; Viewer writes are denied. Current evidence, active zone/batch and cycle state are checked again before a new task. No new database table or duplicated operational state is introduced. Source keys are provenance links, not authorization tokens or immutable historical evidence snapshots.

Local record lookup does not send any data to a model. The new `vigor-brief-v1` Gemini contract explicitly projects selected findings, crop context, evidence and available actions. It excludes buyer names, staff profiles, task notes, raw source fingerprints and images, while including record labels and financial amounts needed to explain harvest/payment dependencies. User questions are transmitted as typed. The UI explains this before selecting Gemini. This differs from the narrower legacy sensor-input export below.

## Gemini gateway and current boundaries

`briefInput.ts` builds a bounded snapshot using wall-clock sensor freshness. `briefContract.ts` owns strict input/output schemas, canonical SHA-256 binding, a 15-minute expiration, unique IDs and same-finding evidence checks. Unknown actions and fields are rejected. The client also checks greenhouse, crop cycle and workspace revision after the asynchronous response and while displaying it. Changed/expired records hide old action suggestions and offer reanalysis.

`server/ai/gemini.ts` calls Google's fixed generateContent endpoint with a server-only key, an explicit runtime model ID, structured output, a 35-second deadline and no retries. It stamps model/request/time/token metadata itself. Provider errors are mapped to safe messages; upstream bodies, credentials and prompts are never logged by this code. Blocked, truncated and ungrounded results fail visibly. There is no silent fallback labeled as AI. Gemini is used for prioritization and explanation, not image recognition or autonomous tool execution.

`server/ai/handler.ts` bounds input to 96 KiB, validates the snapshot and applies a per-instance request/concurrency budget. The prepared Cloud Run deployment requires IAM invocation; the app does not implement multi-tenant cloud identity. The snapshot is browser-supplied operational evidence, not server-verified greenhouse ownership. Never expose the API as an unrestricted public relay. Prose can still be inaccurate even when structural evidence checks pass; operator review remains necessary.

`useGemini.ts` handles configuration discovery, opt-in analysis, cancellation, retry, stale-response invalidation and errors. `GeminiAnswer.tsx` resolves returned finding IDs into the same existing `Decision` actions. The model cannot create tasks, modify routines, release a lot or record money. Users complete existing validated forms for those changes. No new database schema or duplicated transaction table was added. Analysis history lasts in browser memory; downloaded analyses are evidence artifacts, not a durable cloud audit log.

## Previous compact-assistant verification, 16 October 2026

The compact conversation revision passed 436 tests in 30 files. Component workflows were exercised with viewport settings 390, 768, 1280 and 1440, including the initially closed launcher, suggested questions, collapsed sources, task assignment and completion. Additional checks cover typed payment/routine lookup, receipt recording, unsupported questions, zone scope, focus restoration on Escape, recent-question reset, greenhouse changes, inspection-modal handoff and Viewer restrictions. SQLite tests retain coverage for reload, stable task relations, duplicate submission and cross-greenhouse rejection; the service test rejects Viewer assignment.

These are DOM and data checks, not browser pixel/layout verification. The browser-control capability was unavailable, so no browser screenshots, rendered layout measurements, deployed-page interaction or WebGL checks were performed in this revision. The Sites packaging workflow performs the production framework build separately.

## Telemetry contract

`src/domain/telemetry.ts` selects the latest reading for each device and metric, regardless of row order. It rejects unavailable/maintenance/uncalibrated devices, wrong units, invalid timestamps and values, future readings, and expired readings. Missing data is null, never zero. An invalid latest reading cannot fall back to an older valid value. Temperature and humidity are assessed independently.

The default maximum age is 30 minutes. This is a technical prototype policy and must be reviewed per sensor and crop before field deployment. UI freshness refreshes every minute and on visibility/focus changes; this refresh never runs a scheduler or writes measurements. Imported sample records remain historical, so they may correctly show as expired.

## Retained sensor-input contract

`src/features/ai/foundation.ts` defines contract `vigor-actions-v1` and a provider interface. Input includes:

- Selected greenhouse ID and workspace revision.
- Active zones, batches and reviewed target limits.
- Devices and timestamped sensor evidence with quality/provenance.
- Open pest cases and structured inspection counts.
- Reviewed routine versions and existing deterministic blockers.

Input excludes member identities, customer names, payment balances, device credentials, free-form inspection notes, and attachments. Snapshot creation does not write another database copy. SHA-256 identifies the serialized input; this hash binds a response to its input and is **not authentication**. Snapshots expire after 15 minutes.

The strict Zod response schema allows only zone inspection, device review, routine review, or observation recommendations. Every recommendation requires evidence IDs, a reason and an uncertainty statement. Validation rejects unknown fields, duplicate IDs, missing or wrong-zone evidence, wrong-zone device/routine references, expired snapshots, and changes to the selected greenhouse or workspace revision. Current state is checked again after the asynchronous provider returns. Passing validation never authorizes physical execution.

`unconfiguredAiProvider` remains the explicit unavailable adapter for this older sensor-response contract. The actual Gemini gateway uses `vigor-brief-v1`, described above. No key entry or browser credential storage is provided in either flow.

## Routine preview boundary

`src/domain/routinePreview.ts` reuses existing configuration and guard validation, then checks current sensor quality and resource locks. It returns blockers, planned steps, and duration/water estimates from saved parameters. It creates no run, device command, usage, supply movement, payment, or savings claim. A successful preview is not evidence of field readiness or crop improvement.

## Remaining integration work

1. Configure the key in Secret Manager and the enabled Gemini model ID. Deploy the prepared application to private Cloud Run; verify actual model access and the resulting GCP URL.
2. Run live evaluation for missing/stale inputs, conflicting evidence, unsupported actions and incorrect advice. Mocked transport checks do not measure model quality.
3. Verify the app in a real browser on the GCP origin, including SQLite backup restore, worker/WASM loading, all page layouts and 3D/2D fallback.
4. Add authenticated user identity, authorized greenhouse tenancy, shared database storage, durable request budgets and separate recommendation history before shared public operation.
5. Add real selected-image Gemini inspection as a separate evaluated feature. Custom YOLO requires labeled greenhouse imagery and is not a substitute for the required Google Gen AI integration. Reference photos remain reference photos.

Credentials, live-model evaluation, a live GCP deployment, persistent AI history and telemetry ingestion have not been completed. Resource savings and improved crop outcomes remain unmeasured until a field pilot uses reviewed baselines.

## English presentation and data compatibility

UI copy, form feedback, tour content, reports, and new seed records use English. `src/i18n/display.ts` maps known legacy labels for display while preserving stored identifiers and enums such as expense categories and crop stages. Select options submit stable values. Unknown user-entered names and notes remain unchanged. IDR and Asia/Jakarta are retained. CSV labels are translated before existing spreadsheet-formula escaping.
