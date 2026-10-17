# Operations and asset annotations

## Brief and reviewed plan

The references describe a sensing, decision, action and feedback loop. Existing Vigor has guarded automation, pest review, care, harvest, sales and costs, but the reasons for waiting and the handoff to outcome review are spread across pages. Add one Operations tab inside Greenhouse, using the existing records and scheduler checks. Do not invent an autonomous AI controller, measured plant recovery, or additional hardware.

Retain Plus Jakarta Sans; palette: paper `#EEF3EF`, text `#20352B`, control `#1D593F`, water `#357E88`, attention `#92571E`, boundary `#DCE6DF`. Left aligned, master/detail layout: a compact routine list beside a vertical sequence of condition, rule, readiness, execution and follow-up. The sequence carries actual process order. A compact handoff strip connects the existing pest/care/harvest/sales/profit workflows without duplicating their editors.

Review: another KPI/card dashboard would repeat the overview. Use explanatory operational rows, explicit missing-data states and the scheduler's own readiness checks. A completed run confirms execution, not plant health. A task-producing run does not mean the physical task is done. No new dataset or scheduler is needed.

For 3D, service assets need the same discoverability as zones. Add anchored code/name pins with collision-aware placement. Hover/focus shows a descriptive tooltip; selection by click/tap pins an interactive popover. Escape/close dismisses it. Focus asset fits the relevant equipment, and the detail action opens its existing device/workflow. Pointer/touch interaction is user-triggered. Existing service selector and 2D details remain accessible alternatives.

## Further product priorities

- Crop/batch-specific environmental targets and a review history before activation.
- A light-monitoring module using suitable measurements and accumulated light, with shading/lighting decisions tied to crop needs. No PPFD/DLI is inferred from the reference photo's lux value.
- Before/after sensor histories and human outcome review, separate from command completion.
- Refill, calibration and maintenance tasks linked to consumables and recorded expenses.
- Resource use per saleable kilogram, with explicit period/batch allocation and incomplete-data treatment.

Primary references: UMass Extension greenhouse ventilation and humidity guidance, and Cornell's Greenhouse Lighting Laboratory (https://blogs.cornell.edu/urbancea/livestream/). These inform potential modules, not universal growing thresholds or hardware purchases. Existing demo thresholds remain labelled as examples.

## Verification boundary

Required managed control-browser is unavailable in this environment. Validate DOM keyboard/touch-equivalent clicks, mathematical label placement/camera fits and production build. Do not describe those as real WebGL, screenshot or mobile touch validation.

## Implemented and checked

- Operations is a tab in Greenhouse, not a second automation engine. `operationReview` reuses `validateRoutine`, `checkRoutineGuards`, `nextOccurrence`, `sensorValue`, runs, resource locks, usage and maintenance records. The only clock action is the existing permission-gated 60-second tick.
- Routine and zone selections use URL query state. Unknown/missing data stays missing. Device profile restrictions, low-tank guards, paused routines, latched sensor episodes and interrupted runs remain visible.
- Asset pins are native HTML controls anchored to the Three scene. `assetAnnotations` owns screen placement and equipment bounds; `AssetPin` owns keyboard/pointer interaction; `AssetAnnotations` adapts the two to Fiber/Drei. The selected pin takes priority when space is limited. The external asset selector remains available if camera positioning hides a pin.
- Five equipment groups: PLTS/inverter, water/pump/valves, fertigation, circulation fan and controller. These do not assert that every inventory device has its own physical mesh. Installed groups follow active inventory; the solar group follows the saved scenario.
- 285 Vitest tests across 17 files passed. The 26 additions cover pure process review, missing data, physical-task completion, permissions, connected actions, keyboard Escape/focus, click without hover, pin collisions, popover bounds and asset camera fits. Existing 2D fallback and navigation tests also passed.
- TypeScript passed. Production build and private version are prepared through the Sites helper. No dependencies or real integrations were added.

## Review walkthrough

1. Open Greenhouse → Operations on Greenhouse 01. Select a routine and review the five process steps. Open Uji aturan to inspect the existing dry-run result.
2. Choose Coba skenario → Tangki rendah. The irrigation reading and guard explain why the next run cannot start. Open its device record. Restore the normal scenario when finished; these are shared demo conditions.
3. For the fan demonstration, the existing Tangkapan meningkat scenario also sets TH-A-01 to 30.2 °C. Select Sirkulasi udara and advance 60 seconds. Review the run and the distinction between command completion and measured environmental recovery.
4. Open Monitoring → 3D. Select a code pin or physical equipment; inspect its status/zones, use Fokus aset and follow Detail perangkat or Lihat proses terkait. Escape closes the popover; Sesuaikan view restores the whole greenhouse. Use 2D or the asset selector when WebGL is unavailable.
5. Return to Operations and follow the existing care, harvest, sales and cost-review links. These use recorded production and ledger data; merely visiting Operations does not create sales, expenses or savings.

## Remaining work

The proposed crop targets, light monitoring, before/after telemetry, consumable stock and resource-per-kg module are priorities for another iteration, not completed capabilities. Physical installation, sensor feedback, command delivery, crop recovery and savings are not validated by this frontend prototype. Real-browser visual and GPU review remains necessary before describing the presentation as visually verified.
