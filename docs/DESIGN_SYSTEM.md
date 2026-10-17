# Vigor frontend design

## Brief and direction

Apply the complete frontend-design guidance supplied by the user on 14 October 2026. This is an operational greenhouse product for Indonesian growers, with hybrid English/Indonesian navigation. The approved Vigor logo, green identity, supplied greenhouse references and eight existing workflows remain the basis. The primary job is to identify which zone or operation needs attention and reach the relevant evidence or record.

The distinctive element is a six-zone monitoring board based on the greenhouse's planting beds. Each lane links to a real demo zone, showing current temperature, humidity availability, camera connection, and inspection status. No decorative plant-health score, invented sensor history, or second full greenhouse model is placed on Dashboard.

## Plan and critique before implementation

The earlier metric strip and numbered priority queue could fit an unrelated SaaS product. The new direction replaces them with zone monitoring and a photographic field-work context. Priority numbering was removed because those tasks are not sequential. The full spatial scene remains on Greenhouse. Identical containers were replaced with panels, compact registers and unboxed supporting sections according to content. Status colors carry meaning; ornamental gradients, uppercase eyebrows and monospace metadata are absent.

The board receives the strongest visual treatment. Surrounding charts, tasks, routines and ledgers stay quiet. Arched lane tops refer to covered planting beds, while the entire lane remains a standard keyboard-operable button. No autonomous decorative animation is introduced.

## Tokens

| Role | Value | Use |
|---|---|---|
| Dew | `#F3F7F4` | Workspace background |
| Leaf ink | `#20352B` | Primary text |
| Canopy | `#1D593F` | Navigation selection, primary actions |
| Growing leaf | `#73A15C` | Structural/status accents |
| Water | `#357E88` | Humidity/environment and chart series |
| Attention | `#C87C2A` | Inspection/connection accents; darker `#92571E` for small text |

Plus Jakarta Sans Variable is installed and bundled locally through Fontsource, with weights 400–650 for most text. No remote font service is needed. Page titles are 30 px; section titles 16 px; controls/data 14 px; supporting text 13 px and compact captions 12 px; mobile form inputs 16 px. Numeric values use tabular figures in the same family. Content is left aligned, with body paragraphs capped at 75 characters. The original logo stays unchanged.

## Composition and patterns

| Page | Structure |
|---|---|
| Dashboard | Monitoring board; trend and field work; routine agenda and environment; activity and period expenditure |
| Greenhouse | Farm context; interactive 3D/2D view; selected zone detail; zone records |
| Hama & inspeksi | Case queue or detection review; three comparable readings, quality checks and trigger evidence; inspection and follow-up |
| Pengendalian hama | Case/plan selection; action sequence; evaluation and simulator |
| Automation | Schedule; routines register; step editor; execution detail; nutrition profiles |
| Perangkat | Inventory and inspector; camera/sensor views; maintenance and related expenses |
| Aktivitas & laporan | Filtered activity records; source links; reports/export |
| Biaya & penghematan | Period/scope; expense ledger; comparable baseline; budget; purchase planning |
| Role & permission | Member register, greenhouse scope, fixed permission matrix, temporary role preview |
| Settings | Profile form, light/dark/system preferences, notification categories, demo session |
| Siklus tanam | Five linked lifecycle steps; fieldwork and existing pest cases; harvest lot register, grade stock, sales and receipts |

- Navigation groups: **Monitoring / Operations / Review / Workspace**. The eight original routes retain their paths; `/akses` and `/settings` extend the application.
- Frame: 224 px desktop rail, 76 px in icon mode; drawer below 1024 px. The collapse control is first in the header, before the greenhouse breadcrumb. Desktop preference does not hide labels in the mobile drawer.
- Monitoring board: six lanes on large screens, three below 1101 px, two below 601 px.
- Tables: `Card variant="register"`, compact 8 px corners, separated header and scrollable record body.
- Panels: default 12 px radius for grouped analysis or detail. Supporting content uses `variant="plain"` without a nested box.
- Metadata: short sentences and meaningful identifiers; no repeating middle-dot templates.
- Actions: explicit verbs such as Catat inspeksi, Lihat pengeluaran, Review & aktifkan. Arrows remain where they convey an actual step/flow.
- Charts: real shared observations, no gap-filling; native button legends with `aria-pressed`, keyboard focus, distinct colors and dash patterns.
- Sensors: current demo values and provenance. Uncalibrated/unavailable readings display a missing state, including humidity. Synthetic sensor sparklines have been removed.
- Accessibility: persistent visible focus, native button interactions, named controls, text alongside status colors, reduced motion, mobile navigation focus containment and larger touch targets.

## Code ownership

- `app/App.tsx` assembles the frame; `useWorkspace.ts` owns shared state, route-derived detail and demo clock lifecycle.
- `app/pages.ts` owns route names/descriptions; Sidebar, DemoToolbar, PageActions and PageRoutes have separate responsibilities.
- `components/ui.tsx` owns common primitives and explicit container variants.
- `features/overview/ZoneWatch.tsx` owns the monitoring board; Overview composes it with tasks, routines, activity and expenditure.
- Feature-specific detail components are reused by desktop inspectors and mobile drawers.
- `styles/tokens.css`: palette/type/spacing. `base.css`: element behavior. `components.css`: primitives. `workspace.css`: frame. `features.css`: specialized structures. `layouts.css`: page arrangements. `responsive.css`: specialized breakpoint/print behavior.
- `styles/overview.css` owns the dashboard composition and its breakpoints. Earlier dashboard layout rules were removed from shared files; it is not an override patch layer.

Keep identifiers, data relationships and simulation logic independent from display wording. Use `npm run format`. Do not restore a growing generic refinements stylesheet.

## Greenhouse and account feature extension

The greenhouse selector is a working context switch. Each choice shows location, crop, area and monitoring coverage before selection. The active name stays in both the rail and breadcrumb. Switching clears entity-specific URL selection and pauses the simulation; it does not reset the previous dataset.

Account and access flows stay visually subordinate to monitoring: a member register for comparison, one profile form, compact preference rows and a chronological notification list. Notification dots mean unread; they do not imply a new sensor event. Icon-only navigation retains accessible names and native title hints.

Dark mode uses a muted greenhouse palette: `#14261F` workspace, `#1C3026` surfaces, `#E2ECE3` text, `#A5BAAB` secondary text, `#A2CEAC` green accents, `#8EC4C7` water accents. Semantic variables adapt existing panels, controls and charts. Primary buttons use `#356D4D` with white text. Photographs, the approved logo and spatial illustrations retain their lighting rather than being color-inverted. System mode follows `prefers-color-scheme` changes.

Ownership additions: `store/store.ts` manages independent greenhouse domain states and migration; `store/workspace.ts` manages browser session/preferences; `features/access/permissions.ts` is the permission matrix used by UI controls and action guards. `features/workspace/` owns selection, notifications and demo login. `styles/account.css` owns these new forms/lists, while `styles/theme.css` supplies semantic theme values.

Roles are demo behavior only. The application does not claim server authentication, production authorization, invitation delivery, push notifications or background execution.

## Detection review composition

Keep the existing shell, palette and type scale. The memorable element is the evidence itself: three comparable observations, a labeled threshold and a readable reason for review. A narrow zone queue leads into one selected assessment. The camera reference is subordinate and explicitly separate from the numbers; no invented AI confidence, diagnostic overlays or decorative KPI cards.

At wide widths the zone queue sits beside the assessment. The proof and reference stack below 1280 px; below 768 px the six zones become a three-column selector above the content. Missing readings remain gaps. Rule and source checks use text as well as status symbols. Demo controls are folded by default and named for their effect.

`features/pests/DetectionReview.tsx` owns this composition and `styles/detection.css` owns its scoped styles and breakpoints. `domain/detection.ts` owns decisions and immutable trigger evidence; `domain/observations.ts` supplies the shared readings also used by existing charts. Presentation thresholds stay outside visual components.

## Cultivation through profit

Reuse Dew `#F3F7F4`, Leaf ink `#20352B`, Canopy `#1D593F`, Growing leaf `#73A15C`, Water `#357E88` and Attention `#C87C2A`; keep the existing semantic dark theme and locally bundled Plus Jakarta Sans. No new visual brand or font is introduced.

The cycle's five steps are meaningful navigation through actual work, not decorative numbered cards. One crop register owns fieldwork, harvest and sales. Finance remains in the existing Costs destination so expenses are not duplicated. Wide screens pair working records with context; mobile stacks them and preserves scrollable tables. Content stays left aligned.

The financial emphasis is one readable subtraction statement. Receivables and cash are supporting information beside it. A separate comparison table explains the savings assumption using the same sales revenue on both sides. Unknown costs are labeled before the result, rather than hidden behind a large positive number. The review pass removed the monthly scope selector from cycle profit because it would imply that the full-cycle result follows a monthly filter.

`domain/production.ts` owns validation, quantities and finance calculations; `productionTypes.ts` owns contracts. `features/cultivation/` separates workflow, forms and finance. `styles/cultivation.css` owns all new composition and mobile rules. Existing ledger, device allocation, cases and automation records remain the sources for links.

## Verification limit

Automated React/DOM checks do not establish rendered visual quality. The required managed Sites control-browser capability is unavailable. No substitute browser or preview server was started. Screenshot review at 390/768/1280/1440, actual chart sizing, WebGL, native dialog focus, print and GPU performance still require browser verification. CSS breakpoint review is not a screenshot audit.

## Taste-skill refinement

The 15 October polish adapts the relevant typography, color, layout, and restraint guidance from taste-skill v2. That skill explicitly excludes operational dashboards; its marketing direction generator, photography quotas, and mandatory motion were not applied. See `TASTE_POLISH.md` for the source, reviewed plan, and applicability decisions.

Shared type tokens replace scattered small pixel sizes. The navigation region scrolls independently while profile/logout remain accessible; short landscape screens fall back to a full sidebar scroll. Selected navigation uses sage with a clear leading mark. Panels use a flat surface and records retain functional separators. Mobile local tabs wrap, long actions may wrap, and simulator actions reflow while the demo indicator stays visible.

Forms/dialogs are owned by `components.css`, with a sticky action area for long forms. Dialog labels are unique, field hints are associated with their controls, and a rejected `FormBox` moves focus to its error without clearing the entered values. Native focus behavior still needs real browser verification.

## Pemilik visualisasi greenhouse

`features/greenhouse/SpatialView.tsx` memiliki kontrol/layer/selector/fallback; `ZoneMap.tsx` memiliki denah dengan label HTML dan ilustrasi SVG; `Scene.tsx` memiliki renderer 3D; `spatialModel.ts` memasok layout/status bersama; `sceneGeometry.ts` memasok perhitungan kamera, marker, dan buffer tanaman. `styles/spatial.css` adalah satu-satunya pemilik style denah/scene. Dokumen SPATIAL_VIEW_FIXES.md mencatat keputusan visual, regresi, dan batas verifikasi.


## Model greenhouse botanis

Refinement memakai skill Three.js dari CloudAI-X dan referensi greenhouse asli. Arah visual terbaru ada di `SPATIAL_ART_DIRECTION.md`. Scene menjadi model dengan sisi terbuka, dedaunan terstruktur sesuai komoditas, bed sesuai metode tanam, serta material dan bayangan yang membedakan ruang tanam dari jalur servis. Denah mengurangi bingkai kartu dan menjadikan footprint kebun sebagai struktur utamanya.

`botanicalModel.ts` menerjemahkan batch/metode/fase menjadi representasi bersama 2D/3D. `PlanBedArt.tsx` memiliki simbol botanis 2D. `botanicalGeometry.ts` memiliki custom indexed geometry dan kapasitas instance, `CropCanopy.tsx` memiliki renderer tanaman dan disposal, dan `SceneArchitecture.tsx` memiliki fondasi/rangka/bed/alat/irigasi. Camera math tetap di `sceneGeometry.ts`; scene merangkai objek dan kontrol. Tidak ada perubahan data bisnis atau dependency.
