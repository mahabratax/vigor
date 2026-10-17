# Vigor v30 — start here

This download contains the editable application source, original illustration assets,
optimized images, tests, documentation, and the compiled browser application with
its Node server from private Site version 30.

## Run the included application

1. Install Node.js 22.12 or newer.
2. Extract the ZIP completely.
3. Open a terminal inside the Vigor-v30 folder and run:

   node dist-gcp/server.mjs

4. Open http://localhost:8080/login in your browser.
5. Click **Enter workspace**. No email or password is required for this prototype.

On Windows, you can also double-click START-VIGOR.cmd after installing Node.js.
Keep the terminal open while using Vigor. Press Ctrl+C to stop.
The included build does not require npm install. Do not open index.html directly
with file://; SQLite workers need the application served over HTTP.

## Edit and rebuild

From the extracted Vigor-v30 folder:

   npm ci --no-audit --no-fund
   npm run build:gcp
   node dist-gcp/server.mjs

For frontend development with live reload:

   npx vite --config vite.gcp.config.ts --host 127.0.0.1

Use the development URL printed in the terminal. This development command does
not start the optional Gemini API gateway. The compiled Node server serves both
the browser app and the gateway configuration routes.

The Sites/Vinext configuration is retained in the source for the existing Site.
The GCP build is also the supported standalone Node build. No Google Cloud account
is needed to run it locally. See docs/GCP_DEPLOYMENT.md for later cloud deployment.

## Records and prototype access

SQLite records persist in each browser, under that browser's application URL.
The ZIP includes starter data in the source; it cannot include edits stored only
in your browser on the hosted Site. To move those records:

- On the hosted Site, open Settings > Data & backup and export the SQLite backup.
- Open the locally running Vigor, then restore that backup in the same settings.

Keep using the same local hostname and port to retain the same browser workspace.
Logout returns to the entry page and preserves the records. Local entry is a
prototype session, not verified multi-user authentication.

Gemini remains unavailable until configured. Hardware, live video, real device
execution, unattended scheduling and payments are not connected.

## Contents and verification

- src/, app/, server/, db/: editable application and data model.
- public/, design-assets/: optimized artwork and original generated illustrations.
- dist-gcp/: included runnable build; no dependency installation needed to run it.
- docs/, tests/: implementation/design notes and test suite.
- Vigor-Preview.html and portable/: historical references, not the current app.

This revision passed 510 tests in 36 files, TypeScript checks, the actual Sites and
GCP builds, and exact production-byte checks for all 21 image assets.
Live browser screenshots, responsive overflow and actual WebGL rendering were not
verified in that session. The usable 2D fallback is retained.

Source commit: 684a16608f8854b351ddd2cc4c17fa123da0669c
Private Site: https://vigor-greenhouse-aldi.brawnycoin1.chatgpt.site
