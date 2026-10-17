# Vigor presentation pack

The owner has deferred Gemini and GCP activation until payment is complete. This pack supports a truthful rehearsal of the existing prototype. It does not represent a final compliant submission.

## Deliverables

- `Vigor-Hackathon-Proposal.pdf`: 10 slides, English, 16:9. Problem hypothesis, care-to-harvest workflow, Gemini's intended contribution, application controls, current implementation, Google Cloud architecture, impact measurement, operating-cost model, validation and submission gates.
- `Vigor-Presenter-Guide.pdf`: 3 A4 pages. Setup and backup checklist, timed English narration, activation handoff, recovery and final checks.

Generated files are delivered separately. The editable content and layout source is `build_pdfs.py`; they are not screenshots of the application. Proposal links open the owner-private review Site and relevant application sections.

## Visual direction

Keep the approved Vigor logo, locally bundled Plus Jakarta Sans, Dew `#F3F7F4`, Leaf ink `#20352B`, Canopy `#1D593F`, Water `#357E88`, and attention `#92571E`. Use a 1280 × 720 landscape canvas, left-aligned typography and generous spacing. Use one flat composition per slide. Tables and the architecture diagram explain relationships; decorative card grids and unmeasured impact charts are excluded.

The cover spends the strongest emphasis on the original identity and product purpose. Supporting slides stay quiet. A generic statistics-led pitch would imply impact data that does not exist. This deck instead uses the actual care-to-harvest workflow and visibly separates pending activation from working software.

No external market numbers, device quotations, cloud prices, generated model answers or measured savings are invented. The supplied event brief and application source are the factual baseline.

## Generate

Requires Python with `reportlab`, `fonttools`, `Brotli` and `Pillow`, plus the installed application font package.

```bash
python3 docs/presentation/build_pdfs.py --output-dir /absolute/output/pdf --cache-dir /absolute/tmp/vigor-fonts
```

Render both PDFs with Poppler and inspect every page after edits. The builder embeds distinct font faces and keeps PDF text selectable. Generated PDF files need not be committed to the Site source.

## Walkthrough in the app

Account menu / Vigor guide / 3-minute walkthrough. On mobile, open Menu first.

Eight spotlight steps follow greenhouse context, the assistant, evidence review, care, harvest, profit, efficiency and actual runtime readiness. Each step has a suggested time range. There is no timer or automatic record write. Try on page restores normal controls; submitted forms still save local records. Progress remains scoped to the member and greenhouse.

The assistant now keeps model uncertainty and cited source labels in the existing Sources & next steps disclosure, eliminating a second evidence section without removing source navigation or action checks.

## Remaining checks

- Real browser screenshots/layouts and WebGL at 390, 768, 1280 and 1440 px. DOM geometry tests do not verify actual CSS layout or native browser focus.
- Live Gemini evaluation and real GCP deployment after activation.
- Final public video at most three minutes, with a real model response and verified GCP URL.
- Field pilot, measured resource use, and reviewed baseline before any savings claim.

## Verification on 16 October 2026

- TypeScript checks passed.
- All 460 tests in 33 files passed with `npm test -- --maxWorkers=1`, including the complete presentation tour at four DOM viewport sizes. Parallel runs hit the existing SQLite concurrency test's 5-second timeout. The same test passed in isolation and the sequential suite passed without increasing its timeout or changing assertions.
- `npm run build:gcp` passed, including compiled route, asset, Worker/WASM, server import and provider-isolation checks. No Docker image or GCP deployment was run.
- Both PDFs were rendered and every page visually reviewed. All fonts used in document text are embedded, and the proposal contains real clickable private-Site links.
- The managed browser-control capability was unavailable. No browser screenshot, native focus, WebGL or real-device test is claimed.
