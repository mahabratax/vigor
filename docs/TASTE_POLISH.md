# Vigor UI polish — 15 October 2026

## Brief, source, and applicability

Polish the existing operational greenhouse prototype, preserving all eleven destinations, approved visual references, the logo, independent greenhouse datasets, and existing crop/automation/finance behavior. This is a refinement of the application, not a marketing-site redesign.

Read [taste-skill](https://github.com/Leonxlnx/taste-skill/tree/main/skills/taste-skill), `SKILL.md` blob `91d114a9d8d1e9999ff8bdc7c6fc2303a49af754`, and its type, colour, layout, and critique references. The current v2 skill explicitly excludes dashboards and app screens. Apply its relevant craft guidance: shared alignment, legible secondary text, meaningful color, clear hierarchy, restrained surfaces, and honest verification. Do not apply its random marketing directions, giant headlines, minimum photography counts, mandatory decorative motion, or prohibition on useful operational tables and grouping.

## Plan reviewed before implementation

| Role | Token | Decision |
| --- | --- | --- |
| Dew | `#F3F7F4` | Quiet workspace ground |
| Surface | `#FFFFFF` | Analysis panels and working records |
| Leaf ink | `#20352B` | Reading, numbers, headings |
| Canopy | `#1D593F` | Primary action and selected navigation |
| Water | `#357E88` | Environmental information |
| Attention | `#92571E` | Readable warning text |

Keep locally bundled Plus Jakarta Sans Variable. Use 14 px reading/control text, 13 px supporting text, and 12 px compact captions; 16 px mobile form fields avoid browser input zoom. Retain the established 30 px page title and 16 px section title, with normal sentence case and tabular figures. Keep existing semantic dark colors.

The persistent frame must leave the workspace to the records: a compact 224 px navigation rail (76 px icon mode), independently scrollable navigation, and an accessible account area. Align page titles and controls to the same content inset. Keep simulator controls explicit but visually subordinate. Show all local navigation options on mobile rather than leaving important tabs beyond the edge.

The six-zone board remains the recognizable greenhouse element. Refine its density and type without replacing monitoring with a second spatial scene. Give analysis panels a flat surface; use separators where they actually distinguish table records, fields, and state. Keep money and operation states grounded in the shared demo data.

Initial critique: making every page borderless or inserting oversized display type would simply import a different template. Revise that direction: preserve the existing register/inspector and lifecycle patterns, simplify the surrounding shell, and use consistent readable type. No new imagery or animated decoration is needed for this brief.

## Findings to address

- Secondary text and mobile fields frequently shrink to 10–12 px. Establish shared lower type sizes and stop shrinking form input text on phones.
- The whole sidebar scrolls, with large repeated spacing; profile and logout can be far below the navigation. Separate the navigation scroll region and tighten chrome.
- The active menu has as much visual emphasis as a primary action. Use a quieter, clearly marked selected state.
- Tabs depend on horizontal overflow. Wrap the small set of local tabs on mobile and keep keyboard activation visible.
- Common modal titles share one hardcoded ID; failed submissions display an error above a possibly scrolled form without moving focus to it. Give dialogs unique labels and focus the error summary after rejection.
- Common form/modal styles are split across several files. Consolidate those primitives with the shared components instead of adding a last-loaded override sheet.

## Verification boundary

Review the supplied design contact sheet as the visual reference. DOM behavior and CSS source review cannot establish rendered layout quality. The managed Sites control-browser skill is unavailable; do not launch a substitute browser or preview server. No screenshot critique score or claim of browser testing is justified. Report this limit with the private preview.

## Implementation and verification

- Shared type tokens applied across the existing page styles; no dependency or business-domain changes.
- Shared form/modal CSS consolidated, with no extra override stylesheet. Crop and finance forms now use the same action-footer pattern.
- The original 142 Vitest checks and four new UI interaction checks pass. The navigation suite visits all eleven destinations at 390, 768, 1280, and 1440 px in DOM simulation only. This does not test CSS geometry.
- New checks cover a rejected form preserving input and accepting a correction, separate concurrent dialog names and opener focus, associated help text, and keyboard tab activation without accidental form submission.
- Core contrast pairs were calculated from sRGB tokens: light secondary 4.84:1, dark secondary 6.81:1, primary action text 8.23:1 light and 6.09:1 dark. Other component pairs, photographs, real font loading, native dialogs, sticky footers, and chart/3D rendering remain subject to browser review.
- Final publication uses the actual React/TypeScript/Vite build. The portable preview and older screenshots are not build verification.

No numeric visual critique score is reported: fresh screenshots could not be obtained using the required preview capability. Existing supplied photography/logo/illustration assets remain unchanged; no new stock imagery or synthetic evidence was introduced.
