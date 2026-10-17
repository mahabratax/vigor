# Targets, outcome review, supplies and efficiency

## Design plan and review

Continue the existing Vigor workspace. Use its Plus Jakarta Sans, paper #F3F7F4, surface #FFFFFF, ink #20352B, green #1D593F, water #357E88 and attention #92571E. Keep left-aligned registers, editable rows and short explanations. Do not add another top-level menu or four disconnected KPI dashboards.

- Zone details gain Target tanaman: a batch/stage-specific range sheet with version history, explicit review, and current readings. A draft never replaces an active revision. Crop/variety changes invalidate the match. Targets guide monitoring and do not silently change automation settings.
- Operations and run details share Review hasil: immutable before/start and after/finish snapshots, optional follow-up capture, numeric comparison, and an operator assessment. Missing/old-run data is not reconstructed. Fixture changes are labelled; command completion is not causal evidence of crop recovery.
- Devices gain Persediaan: master items, stock movements, reversal, low-stock tasks linked to existing maintenance, and links to existing expenses. Refill is a physical task record and does not falsify a sensor reading. Simulator nutrient units are never converted to liters.
- Costs gain Efisiensi panen: a cycle-wide numerator/denominator reconciliation, run-usage allocations, additional non-run usage, coverage review and a cost-per-kg derived from the existing reviewed ledger. Solar projections and savings do not become actual usage or additional profit.

The distinguishing element is traceability through the existing records. Use one restrained process sequence for outcome review and tables for allocation/stock, not repeated decorative cards. Mobile forms stack; wide registers scroll locally. Shared FormBox/Field/Modal handle errors and focus; all mutation controls respect the existing role matrix.

## Verification boundary

All measurements and actuations remain browser simulations. New fields are optional and validated during hydration; corrupt extensions must not discard the original greenhouse or ledger. Use meaningful domain and React DOM tests plus the actual production build. Managed control-browser is unavailable; no claims of screenshot, real WebGL, touch or browser layout verification.

## Implemented workflows

| Priority | Review location | Behavior |
| --- | --- | --- |
| 1. Crop targets | Greenhouse → Zona & tanaman → Target tanaman | Configure temperature, humidity, media moisture, EC and pH ranges as needed. Save a draft, review and activate it for the selected batch and growth stage. Current readings show missing data or deviation from the active range. |
| 2. Action outcomes | Greenhouse → Operations; Otomasi → Eksekusi → run details | New runs capture immutable readings at actual start and finish. Advance the demo clock for a follow-up reading, then record improved/unchanged/worse/inconclusive with notes. Review history retains the chosen evidence. |
| 3. Supplies and maintenance | Perangkat → Persediaan | Add stock items linked to devices, record receipt/refill/use/waste, correct with reversals, and link existing expenses. Low stock can create one open maintenance task per item, with an assigned operator. Receipts do not silently complete physical work. |
| 4. Harvest efficiency | Biaya → Efisiensi panen | Review run-usage allocation and non-run usage, declare partial/complete coverage, and calculate liters, kWh and cost per kg of released A/B harvest after losses. Open the existing cycle-profit review for revenue and profit. |

The first target revision is deliberately empty until entered; Vigor does not invent agronomic ranges from a crop name. Targets do not rewrite existing automation triggers or dosing. A crop/variety/batch change stops matching the prior target; a different growth stage uses its own revision.

Outcome comparisons preserve sensor quality, timestamp, scenario and target references. Missing readings produce no numeric delta. Changing a scenario is disclosed, not attributed to the preceding action. Existing runs have no reconstructed evidence. Reloading an interrupted run preserves its start evidence and leaves completion unproven.

Supply movements are signed records with nonnegative current and chronological balances. Reversals remain visible; an expense link does not create another payment or void the original payment. Simulator dosing units are not converted into liters. Restock/refill records do not change sensor readings. Stock valuation and automated purchasing are outside this prototype.

New run usage carries the current cycle ID. Older records start with a 0% allocation until reviewed. Additional entries must exclude usage already captured by runs. The harvest denominator includes already-sold released output and excludes reject, held lots and recorded loss. Unknown usage stays blank; explicit measured zero remains valid. Cost per kg requires the existing financial allocation review. Solar projections and assumed savings never become additional profit or actual usage. Completing coverage requires air/energy records, a paused clock and no unresolved active runs; it remains a user's coverage declaration, not verified physical metering.

## Presentation path

1. Choose Greenhouse 01 and Owner/Manager. Open Zona A → Target tanaman; enter a clearly documented example range, save and activate the draft. Do not present the example as an agronomic recommendation.
2. Start a suitable routine from Automation and advance the demo clock until it finishes. Open Operations → the same routine → Review hasil. Compare readings, optionally capture a later reading, then save an assessment. Synthetic readings may remain unchanged.
3. Open Persediaan. Add a nutrient item linked to its dosing device, set a reorder threshold and an operator, and enable low-stock tasks. Record a receipt and later refill/use. Open the resulting maintenance task and link the appropriate existing expense; no payment is created by stock movement.
4. Review actual demo harvest lots in Siklus tanam. Open Efisiensi panen, review allocations and any additional usage, then open Laba siklus to review financial allocation. Missing harvest or cost review explains which step is needed before ratios are available.

## Verification results

All 324 Vitest checks across 19 files pass, as does TypeScript. The new domain suite has 33 passing checks for target versioning, frozen evidence, unknown readings, stock correction/idempotency, expense links, usage allocation, harvest denominators, invalid data recovery and permissions. Six React DOM tests exercise the four connected interfaces, read-only Viewer controls and deep links. The connected flow runs at innerWidth 390, 768, 1280 and 1440 and checks localStorage reload; jsdom does not compute visual layout. Historical tab-navigation tests now select tabs by their labels instead of their position after the new target tab was inserted.

No dependency changes. The actual React/TypeScript/Vite build is the deployment artifact; the portable preview is not used as verification. Browser layout, screenshots, native dialog focus trapping, hosted-origin persistence, charts, touch and WebGL remain untested in this environment.
