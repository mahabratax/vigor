# Current Vigor Site status

## Gemini workflow and Cloud Run preparation — 16 October 2026

The existing app now has a real Gemini REST integration path, a compact optional Gemini mode in the assistant, evidence-linked responses, strict stale/reference validation, cancellation and clear failure handling. It resolves model-selected findings into existing permission-checked forms. The Google API key remains server-only. No credential is configured, and no live model call has been claimed.

A separate Cloud Run target builds the same application, including SQLite Worker/WASM and the existing 2D/3D pages. The bundled Node server serves the app and API on one origin. A non-root Dockerfile, private deployment script, Secret Manager instructions, evaluation cases and English presentation plan are provided. The existing private Sites/Vinext deployment is preserved. No GCP resource was provisioned.

Verification: 456 tests passed across 33 files. New tests cover the real gateway code with mocked Google transport, correct references, foreign/duplicate evidence rejection, snapshot tampering/expiry, request limits, redacted provider errors, cancellation, late responses after a scope change, existing follow-up forms and unavailable-provider states. Existing four-width DOM, guide, navigation and SQLite regressions still pass. The actual GCP frontend/server build passed TypeScript and compiled-route/asset/worker/WASM/provider-isolation checks. No Docker image was built and no actual Cloud Run runtime, live Gemini call, browser layout or WebGL test was performed. The Sites framework build is verified separately by the packaging workflow.

See [hackathon readiness](HACKATHON_READINESS.md), [deployment instructions](GCP_DEPLOYMENT.md) and [AI boundaries](AI_FOUNDATION.md). Live Gemini access, GCP deployment, real-browser/WebGL QA and measured field impact remain required before submission. The checks below are from the previous AI-foundation revision unless explicitly marked otherwise.

---

## Previous AI foundation and English interface — 16 October 2026

The existing application remains a private ChatGPT Site. The runtime is React/Vinext with sql.js in a browser Worker and IndexedDB persistence. This is the actual application source, not the older portable preview.

Implemented in this revision:

- English interface, forms, validation messages, guides, notifications, reports, and fresh seed labels. Existing database identifiers and category/stage enums are retained. Known legacy labels display in English; unknown user names and notes remain unchanged. IDR and Asia/Jakarta remain the financial/time context.
- Timestamp-aware telemetry selection and quality checks, including stale/future/missing/invalid values, units, calibration, maintenance, and device availability. Humidity reads its own stored metric rather than a zone placeholder. Display freshness refreshes without advancing the scheduler.
- AI readiness on Overview and Settings → AI integration, plus an exportable, hashed, versioned input snapshot scoped to the selected greenhouse.
- Strict advisory response schema and validation for freshness, workspace revision, zone scope, evidence references, and permitted action kinds. The provider adapter explicitly reports not connected.
- Automation → Preview reuses routine validation and checks current readings/resource locks without creating executions, expenses, or supply movements. Unsupported start/recovery entry points now lead to appropriate preview or maintenance review.
- Navigation recognizes the AI, storage, and preview tabs. Translated select options retain their stored values. English and original labels can both be searched in the main operational lists. Crop geometry still recognizes English and Indonesian crop names.

Verification uses the current source: TypeScript checking, Vitest (domain, SQLite, browser-storage harness, forms, navigation, guided tours, and AI boundaries), and the Sites application build. Component tests exercise 390, 768, 1280, and 1440 px responsive states. These are DOM tests with explicit geometry fixtures; they do not validate actual browser CSS, WebGL, or mobile touch rendering.

Real-browser QA was not available in this execution environment. The existing 2D fallback and lazy 3D scene are preserved; actual GPU rendering, screenshots, chart pixels, download dialogs, and real-origin IndexedDB behavior need a browser review of the private Site.

Gemini/Vertex access, real-model inference/evaluation, server authorization for AI, telemetry ingestion, live cameras, hardware commands, external notifications, payments, and unattended scheduling remain unimplemented. Local role restrictions are prototype controls. See [AI foundation](AI_FOUNDATION.md) for the integration sequence and exact boundaries.

---

# Historical portable-preview report

The following report predates the current Sites runtime and AI/English changes. Its old dependency availability and portable-browser results do not verify this revision.

## Delivered and exercised

The eight page destinations and associated detail sheets share the same typed state. The source includes central domain actions, selectors, an expense ledger with allocations, one deterministic scheduler, version snapshots, command steps, exclusive resources, usage records and bounded linked event history.

The executed browser flows cover: INS-024 inspection validation and assignment; creation/approval of a virtual module-test plan; plan completion into monitoring; automatic scheduled irrigation A→B; automatic fertigation; low-reservoir blocking; PUMP-01 September cost drill-down; a paid October maintenance expense without modifying September; six-stage routine edit/review/activation; 2/6-zone installation planning with owned-controller handling; and expense table search totals.

The executed domain suite covers additional fault and financial edge cases. Consult the named tests in `domain-test-results.tap`, rather than interpreting the test count as coverage of the entire product brief. Some browser steps intentionally advance the shared store directly to avoid waiting in real time; these still execute the same domain engine.

## Source / preview differences

| Area          | React/Vite source                                      | Supplied portable artifact                                    |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Runtime       | React 19 target; npm packages not installed here       | Vendored Preact adapter; exercised in Chromium                |
| State         | Zustand vanilla store                                  | Small compatible store adapter, same actions/domain functions |
| Routing       | React Router HashRouter                                | Hash-based compatibility adapter                              |
| Charts        | Recharts trend component and local SVG/HTML charts     | Local SVG/HTML charts, null gaps and clickable legends        |
| Greenhouse    | Lazy React Three Fiber / Drei / Three schematic        | Interactive SVG map with same zone selection/data             |
| UI primitives | Native semantic elements and dialogs; local components | Same local components                                         |
| Forms         | Native forms plus central domain validation            | Same validated forms with adapter handling of default selects |

No installed React/Vite/Three dependency versions, lockfile, production build result or WebGL performance result is invented. The chosen package ranges require resolution and validation with npm access. The Preact version is unknown: the local distribution contains no version metadata. Its source and MIT notice are included; no claim is made that it is the newest release.

## Functional boundaries still open

1. **3D and media:** 3D exists in source but was not executed. No original GLB or video was supplied. Video source switching/snapshot extraction and a real-model importer are not completed. Individual camera placeholders share reference imagery rather than unique recorded frames. Uploaded attachments keep metadata/filenames only, not bytes.
2. **Routine configuration:** daily/weekly schedules, sensor episodes and after-run triggers are implemented. Interval schedules, fully configurable volume-based targets, arbitrary capability-based step selection and an advanced hardware/profile editor are not. Templates use neutral demo parameters. Not every possible EC/pH/pressure fault path has a dedicated fixture or browser test.
3. **Financial breadth:** September is the fully reconciled fixture; October begins incomplete and accepts user demo entries. No fictional August ledger is added to fill a three-month range. Expense edit/void, consumption-period splits, links, allocation reading and baseline guards exist. A complete allocation editor, tariff-version editor, quantitative usage-vs-tariff analysis, recurring-cost projections, time-benefit entry and calculated payback/TCO are not fully implemented. Blank panels are labelled unavailable rather than reporting invented benefits.
4. **Design / libraries:** the supplied hierarchy, palette and layouts guide the implementation, but this is not a pixel-identical reconstruction of every reference. Native dialogs/forms replace the specifically requested Radix/shadcn and RHF/Zod packages. No second UI toolkit is installed.
5. **Verification:** full native-app typecheck, ESLint, Vite production build, Vitest and local-origin Playwright suites are not executed. Real-origin persistence, all keyboard/assistive-technology behavior, native print rendering, production chart behavior and Three.js lazy-chunk/network behavior still need validation. Executed Chromium tests cover the embedded portable artifact only.

## Acceptance interpretation

The primary inspection/control, automatic irrigation/fertigation and device/expense linking journeys are implemented and exercised. Fault, reconciliation, expense/baseline and deduplication rules have executable domain tests. Flows requiring both 3D and 2D equivalence, real media, the complete configurator and all advanced reporting/cost options remain partial. Do not mark all A–Y acceptance items or the full brief's completion criteria as passed based solely on this package.

## Next engineering gate

Install the target npm dependencies without force flags; create and review the lockfile; run native typecheck/lint/tests/build; test the WebGL and Recharts paths; then work through the original A–Y checklist using `PRODUCT_BRIEF.txt`. Keep the working portable preview as a review artifact, not as a substitute for validating the intended native bundle.
