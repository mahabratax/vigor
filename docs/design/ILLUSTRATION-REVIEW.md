# Illustration and login review

17 October 2026

Historical record of version 29. The subsequent local prototype entry and unified 2D/equipment artwork are documented in [UNIFIED-FARM-ASSETS.md](UNIFIED-FARM-ASSETS.md). The ChatGPT redirect described below has been replaced.

## Implemented

Audited all eleven existing page routes, their primary tabs, the Vigor guide and entry flow. The placement decisions are in `ILLUSTRATION-DIRECTION.md`. Five original scenes use the supplied miniature diorama reference: greenhouse, irrigation, inspection, harvest and resources. The original transparent PNGs are preserved in `design-assets/illustrations`; optimized WebP delivery files are in `public/illustrations`. Exact prompts are in `illustration-prompts.json`.

Login has a dedicated `/login` route and is also shown at the root when there is no workspace hash. Existing workspace deep links continue to open their destinations. Settings → Profile → Account session includes a link to review the sign-in page.

Selected headers and genuine first-use states use small illustrations. A first-use scene suppresses duplicate header artwork. Dashboard monitoring, interactive 2D/3D, detection evidence, device execution, tables, settings and permission controls remain data-led. Header artwork is hidden below 768 px; the login changes to a compact stacked layout. Dark mode, keyboard focus, text alternatives and image failure handling are included. No automatic motion was added.

The five small images are 34–48 KB each. The larger login image is 213 KB and belongs to the lazy-loaded login module. Images are embedded with explicit `image/webp` MIME to avoid the previously encountered hosted image issue. If an image cannot decode, it is removed without blocking the primary controls.

Empty device inventory now offers the existing Add device form; filtered results retain Clear filters. Empty inspection wording distinguishes an empty register from a search with no matches.

## Access and storage

The Site remains owner-private. Its platform access gate may appear before the branded Vigor entry. Continue with ChatGPT uses the native top-level sign-in route, with validated same-origin destinations. The page does not collect passwords or assign local roles. On the GCP build, entry uses Open workspace under the deployment's existing access boundary. GCP and Google AI activation remain deferred.

Opening login does not initialize SQLite or subscribe to workspace refresh events. Entering the workspace retains initialization, backup export, restore and retry behavior. Lazy-module failures offer Reload page. No data migration, schema, fixture, physical-device control or AI-provider behavior changed.

## Verification

- Full Vitest regression run: **502 passed in 36 files**. This includes twenty new entry/illustration behavior checks, existing route and guide checks, greenhouse/zone/crop forms, automation, costs, browser SQLite, backup restore and AI foundation checks.
- Existing DOM tests cover page routing and relevant interactions at 390, 768, 1280 and 1440 px. These use DOM and geometry fixtures; they are not rendered visual tests.
- The initial regression run exposed a slow binary equality assertion in an existing backup durability test. Replacing generic typed-array deep comparison with an exact `Buffer.compare` retained the same byte-for-byte guarantee and allowed the concurrency test to finish in 333 ms. No test timeout was increased and database code was unchanged.
- The actual GCP application and compiled server build passed, including `/login`, route fallback, emitted asset, SQLite worker/WASM MIME and AI-provider isolation checks. This was a local build, not a GCP deployment.
- All six illustration WebP files decoded with real alpha transparency. Production asset verification checks the exact bytes of the five existing assets and six new illustration sizes inside emitted JavaScript.
- The Sites publication workflow runs its actual framework build and the same production image-byte verification before packaging and pushing the saved version.

## Remaining verification limits

The managed browser capability is unavailable in this session. Per the Sites workflow, no substitute browser or preview server was started. Live screenshots at the four widths, CSS overflow, real WebGL rendering, and the complete hosted ChatGPT sign-in round trip were not tested in this revision. The existing usable 2D fallback was preserved; illustration changes do not alter either spatial renderer. Review the private deployment at `/login`, the guide, selected workflow headers and genuine first-use states before presenting.
