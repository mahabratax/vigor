# Vigor illustration direction

## Brief and review

Use the supplied miniature workstation image as a reference for material quality, orthographic composition and readable human activity. Vigor's subject is a small, productive Indonesian greenhouse. Keep the existing wordmark, Plus Jakarta Sans and green palette. Original scenes show actual farm equipment and work: crop beds, trap inspections, pumps and reservoirs, harvest grading, and a solar service installation.

The initial idea of putting a full scene on every page would compete with monitoring and repeat the greenhouse view. Revised direction: one large scene on entry, a smaller guide introduction, restrained artwork within selected existing page headers, and illustrations for genuine first-use states. Keep search-empty, validation, permission and device-failure states concise. Never use illustrations as camera evidence or live data.

## Tokens and composition

- Forest `#1D593F`: primary actions and equipment accents.
- Leaf `#73A15C`: foliage and secondary material.
- Sage `#EAF2EB`: quiet surfaces and login scene backdrop.
- Water `#357E88`: plumbing and resource details.
- Ink `#20352B`: interface text and equipment edges.
- White `#FFFFFF`: page and ceramic/material surfaces.
- Type: existing Plus Jakarta Sans, 28–40 px entry heading, 24–28 px page title, 14–16 px body. Sentence case; left aligned; no accent-word treatment.
- Images: consistent orthographic miniature view, matte enamel and metal, realistic leaf structure, soft contact shadows, transparent background, no image text. Characters are farm staff, not an implication of deployed robot hardware.
- Layout: desktop login has a broad illustration area and a quiet 360–400 px sign-in area; mobile places a compact illustration above the sign-in controls. Operational page art is bounded to a small header footprint and omitted from narrow mobile headers. No added dashboard banners or automatic motion.

## Page-by-page audit and placement

| Destination | Decision | Scene / implementation |
|---|---|---|
| Login / entry | Dedicated visual entry | Large greenhouse scene; one-click local prototype entry; safe return to workspace |
| Dashboard | Keep monitoring density | No header illustration; retain assistant, chart, work queue and sensor hierarchy |
| Greenhouse monitoring / 2D / 3D | Keep interactive view authoritative | Shared miniature equipment and crop assets in the 2D plan; real 3D geometry retained |
| Greenhouse management | Small contextual header | Greenhouse scene; keep CRUD and zone access visible |
| Pests & inspections | Small contextual header and first-use state | Inspection scene for case management; no art on detection review; original camera evidence retained |
| Pest management | Small contextual header and no-plan state | Inspection scene; plans, safeguards and review remain functional |
| Crop cycle / care | Small contextual header | Inspection scene; care records and outcomes stay primary |
| Crop cycle / harvest / sales | Small contextual header and initial empty state | Harvest scene; stock, sale and receipt distinctions preserved |
| Automation / schedule / routines | Small contextual header and initial empty state | Irrigation scene; no art in builder or execution inspector |
| Devices / inventory / supplies | Small contextual header and initial empty state | Irrigation / harvest scene; connectivity and amounts remain real UI |
| Costs & savings | Selected header artwork | Resource scene for costs/energy; harvest for cycle results; ledger remains tabular |
| Activity & reports | No illustration in evidence tables or print | Existing history and report structure retained |
| Roles & permissions | No illustration | Permissions and member table remain concise |
| Settings | No illustration | Functional profile, appearance, backup and AI status retained; link to sign-in page |
| Vigor guide | Replace generic introduction icon | Compact greenhouse scene; existing tour catalogue and spotlight behavior retained |

## Assets

Five original transparent raster illustrations, generated with the built-in image-generation tool: greenhouse, irrigation, inspection, harvest, resources. Optimized delivery versions live in `public/illustrations`. Prompt specifications and source provenance are recorded alongside implementation. Art is illustrative only; live state always comes from application data.

First-use artwork suppresses the header scene so the same page does not repeat an illustration. The login uses one scene without a second decorative icon or tagline strip. Artwork is hidden in printed reports.

## Authentication boundary

Sites owns hosted access. The branded entry uses a local prototype session on both build targets and does not collect passwords, establish identity or grant a local role. The owner-private platform gate still applies before application content. Logout returns to the branded entry and preserves records. GCP/Google-model activation remains pending. See `UNIFIED-FARM-ASSETS.md` for the current entry and shared object family.
