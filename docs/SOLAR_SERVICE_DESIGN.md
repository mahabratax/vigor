# Solar and greenhouse services

## Reviewed brief

The supplied physical prototype shows temperature/humidity, media moisture and light sensors, ventilation, a pump and a local controller. The two other graphics are conceptual references, not measurements or evidence for their savings percentages. Vigor already contains camera/sensor, irrigation, nutrition, ventilation, device power, automation usage and a paid-expense ledger.

Add an editable, per-greenhouse solar planning scenario and a service area that exposes these relationships. Keep the model open and readable. Use a side canopy for the illustrative array, leaving the crop roof unobstructed. Placement is conceptual, not a shading study or construction design. No batteries, robotics, CO₂ injection or heating are inferred from the references.

## Visual plan and critique before implementation

Retain Plus Jakarta Sans, left-aligned controls and the existing hierarchy. Palette: drawing `#EEF3EF`, canopy `#204B35`, leaf `#83AA57`, water `#4A858D`, photovoltaic `#24465C`, metal `#B2BEB7`. A detailed service canopy beside the greenhouse is the distinguishing visual. A small flow diagram and one hourly chart explain energy; no decorative headline metrics or new sidebar menu. Energy lives within Greenhouse and is accessible from Costs.

The initial idea of panels on the crop roof would obscure both the plants and their monitoring markers; use an adjacent, explicitly illustrative service area instead. Generic equipment icons alone would add little: model panel cells and framing, inverter/cable conduit, fan blades/grilles, tank fittings, nutrient containers and a controller cabinet. Asset selection must expose the actual associated devices and workflows. Persistent solar configuration is a plan, not an installed/online device.

## Model boundary

- Hourly synthetic solar profile, scaled by editable equivalent-sun-hours and performance ratio, capped by inverter power. It is not a forecast or live meter.
- Planned demand uses current active device watts and explicit editable daily hours/start times. These assumptions do not modify automation schedules. Existing run energy is shown separately.
- Grid-assisted, no battery. Direct use is `min(load, solar)` each hour; grid import and unused surplus remain separate. Surplus earns no revenue. No backup-power claim.
- Period projections repeat the same illustrative day. Savings reduce only projected electricity purchases; investment and maintenance remain explicit. Unknown investment does not become zero/payback. No automatic entries or credits in expenses or crop profit.
- Owner/Manager can save configuration; existing role checks and browser persistence apply. Old stored greenhouse data remains compatible.

## References

- User's three supplied images, 15 October 2026.
- ESDM, 24 February 2024, explanation of Permen 2/2024: https://www.esdm.go.id/en/media-center/news-archives/revisi-permen-esdm-plts-atap-skema-jual-beli-listrik-dihapuskan- . This prototype assumes zero surplus credit; it is not a regulatory eligibility assessment.
- Continue the five CloudAI-X Three.js skills documented in `SPATIAL_ART_DIRECTION.md`: hierarchical procedural geometry, PBR materials, bounded shadows, deliberate interaction and demand rendering.

## Verification

Record completed checks below. Browser/GPU visual verification is unavailable unless the managed control-browser capability becomes available. DOM and geometry tests do not establish actual layout, touch or rendering quality.


Completed: 259 Vitest checks across 13 files; after the final input/status refinement, all 33 energy/service checks passed again. TypeScript and diff whitespace checks pass. Tests cover hourly conservation and inverter limits, midnight/fractional loads, surplus/no-demand cases, invalid inputs, maintenance/payback, greenhouse isolation and persistence, unchanged schedules/ledger/production, permission routing, asset links and camera fits for 390/768/1280/1440 px. Existing full-app navigation regression checks pass. Browser pixel layout, actual WebGL/PBR rendering and touch are unverified because the required control-browser capability is unavailable. Solar is a persistent plan, not a real installed/connected asset; repeat-day projections and zero surplus revenue are explicit.
