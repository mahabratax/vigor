# Vigor greenhouse workspace

Vigor connects greenhouse monitoring, crop care, pest inspections, automation configuration, supplies, harvest, sales, and cycle costs. It is an English-language frontend prototype for an Indonesian greenhouse context: currency remains IDR and operating time remains Asia/Jakarta.

Private Site: https://vigor-greenhouse-aldi.brawnycoin1.chatgpt.site

The application runs React with Vinext/Vite. SQLite runs in a browser Web Worker using sql.js; IndexedDB persists the database. Settings → Data & backup exports and restores SQLite files. Data belongs to each browser/device. Existing backups and stored enum values remain compatible; English display labels do not rewrite user records.

## AI workflow and hackathon deployment

- Dashboard → Vigor assistant is a compact command bar and conversation drawer. Local lookup works without a model. The separate Gemini mode calls the same-origin server gateway when configured, grounds replies in selected records and links to existing actions.
- Settings → AI integration checks gateway configuration and input quality. No key is accepted or stored in the browser.
- Successful model responses include evidence references, uncertainty, model/timing/token metadata and an exportable analysis record. Stale or invalid responses do not reach actions.
- The Gemini snapshot excludes buyer/staff identities and free-form notes, but includes selected financial amounts and record labels. The older sensor-input export remains available as a separate narrow contract.
- Automation → Preview checks routine requirements without creating executions, inventory movements, or expenses.
- No Gemini key or GCP project is configured in this workspace. Live inference and Cloud Run deployment have not been verified. No physical device execution, unattended scheduling or actual payments occur.

See [hackathon readiness and demo plan](docs/HACKATHON_READINESS.md), [Cloud Run deployment](docs/GCP_DEPLOYMENT.md), [AI boundaries](docs/AI_FOUNDATION.md) and [SQLite storage](docs/SQLITE_STORAGE.md).

## Development and verification

```sh
npm run install:ci
npm run typecheck
npm test -- --maxWorkers=2
npm run build
npm run build:gcp
```

Use the Sites build/package helpers in the managed runtime. Preserve the existing project ID and private audience. Do not edit already-applied SQL migrations. Fixtures are seed/test inputs, not the runtime database.

`build:gcp` emits the full existing browser app and a stateless Node API server into `dist-gcp`, then checks the compiled routes, assets, worker/WASM MIME types and server dependency isolation. The Dockerfile and `scripts/deploy-gcp.sh` deploy the same app to private Cloud Run after project/secret setup. It is not a replacement landing page and does not use the portable preview.

Vitest covers domain rules, SQLite round trips and migrations, role restrictions, forms, navigation, guided tours, and responsive component states. DOM tests use widths of 390, 768, 1280, and 1440 px; they are not browser pixel/layout or WebGL verification. The preserved 2D fallback and lazy 3D scene still require a real-browser review for this revision.

## Boundaries

Camera media are reference images; attachments retain metadata only. Local role controls are prototype permissions, not multi-user authentication. An activated routine is saved configuration; the browser does not operate hardware or run schedules while closed. The deterministic simulator remains in the source and isolated tests, while operational SQLite records cannot be advanced by demo controls.

Historic portable-preview test results in `docs/` do not verify the current Site build. Current verification is recorded separately in the implementation status.
