# Guided workflows and focused navigation

## Revised design plan

Keep Vigor's existing Plus Jakarta Sans and colors: paper #F3F7F4, surface #FFFFFF, ink #20352B, green #1D593F, water #357E88 and attention #92571E. Use left-aligned explanations, sentence case and one primary next action. The monitoring board remains the dashboard's main visual.

The user's review replaces the earlier inline-coach decision: a tour must appear immediately, spotlight its real component and dim/blur the background. Render the coach in a body portal with explicit targets, independent of page flow and sidebar stacking. Place it next to the component when space permits; on crowded screens place it below the visible upper part of the section. Keep controls outside the scrolling explanation. Do not duplicate or screenshot the target.

Four task-based tours cover the workspace, setup, daily care and harvest through financial review. A modal spotlight explains each step. Coba di halaman releases the spotlight and page lock, with a small Lanjutkan tour control. This lets the user work with real forms without competing overlays. Completion means learning progress, not finished farm work. Scope progress to the member and greenhouse.

Retain the earlier navigation improvements: a data-derived work queue, contextual actions and filters, a labelled section selector on phones, and a closed-by-default process map. Avoid a separate task database or another sidebar entry.

## Critique and root cause

The earlier sticky coach lived inside main, provided only an outline, and required a second click to scroll to a component. It had no spotlight or blur backdrop. A DOM-presence assertion could pass without proving that a user could see the guide. That implementation did not meet the requested tour behavior.

A single blocking overlay would obstruct form work. The revised design therefore provides an explicit practice mode and a direct return to the current step. The shade has a dim-color fallback when backdrop-filter is unsupported. Movement is immediate instead of animated, including for reduced-motion users.

The implementation also fixes two navigation/placement races: route effects can reset scroll after a target is located, and viewport changes can resize the tooltip after its position was calculated. Target scrolling now runs after route effects; tooltip reflow is measured before paint. The map step names its Monitoring tab explicitly so resuming from another Greenhouse tab cannot keep the wrong section open.

## Implemented behavior

- Open Panduan Vigor from the account popup or Buka panduan from the dashboard introduction. Tours start only when requested. Dismissing the introduction leaves the account entry available.
- Four tours contain 22 steps, each with an explicit data-tour anchor. All prior progress IDs remain compatible. Previous, next, finish, pause, resume and restart retain their existing meaning.
- Starting or advancing opens the real route, scrolls its target into view, places the floating explanation and displays four dimmed blur panes around a clear cutout. The visible part of oversized sections is highlighted without covering the coach.
- The portal does not inherit main/sidebar overflow or stacking. Layout responds to target and panel resizing, route DOM changes, scrolling, orientation and visualViewport changes. Missing or hidden targets show a visible explanation with a page-header fallback; they do not silently dismiss the tour.
- The spotlight is a labelled modal dialog. Its background is inert, page scrolling is locked, Tab stays in the tour and Escape pauses it. Focus moves after the guide chooser closes. Cleanup restores prior scroll styles and inert state, removes highlights and disconnects observers.
- Coba di halaman removes the overlay and focuses the component for reading. The user can navigate or open a form. The resume control stays out of native dialogs, notifications, the greenhouse switcher, the account popup and mobile navigation. Lanjutkan tour returns to the saved route and component.
- Progress stays in workspace preferences, per member and greenhouse. Changing greenhouse, role, account or login state ends the current presentation while preserving progress. Reload does not force a tour to start. Touring does not run devices, modify records, make payments or reset the simulator.
- The dashboard queue derives open cases, uncertain runs, maintenance, device problems, care, stock, held lots and due receipts from current data. Related device/stock tickets are deduplicated. Four priorities are initially shown; links open existing records.
- Four-or-more tabs expose a labelled native selector below 768 px. Desktop keyboard tabs remain. Contextual actions and device filters follow the selected area. The crop-process map stays in an optional disclosure. Kontrol demo retains its visible mobile label.
- Light/dark tokens, 44 px tour controls, visible keyboard focus, existing routes and 2D/3D implementations remain in use. No dependency or hosting framework changes.

## Verification results

370 Vitest checks pass in 22 files. Tour coverage includes 32 React DOM tests, 7 guide/work-queue model tests and 7 geometry tests. All 22 steps traverse their real pages at innerWidth 390, 768, 1280 and 1440. Assertions check the exact component anchors, body portal, spotlight, background lock, focus, route, progress and unchanged greenhouse data.

Geometry fixtures check tooltip bounds, target separation and complete blur coverage. Additional cases cover short/rotated screens, visualViewport offsets, resizing, target disappearance/recovery, keyboard containment, Escape cleanup, native form practice, off-route return, same-page sections, read-only roles and identity changes. Existing domain/navigation regressions pass. TypeScript passes; the actual React/Vite production build is packaged through Sites for private publication.

These are DOM and mathematical geometry checks, not browser screenshots or CSS layout verification. The supported control-browser capability is unavailable in this session. Actual blur compositing, font wrapping, native dialog behavior, touch scrolling, hosted-origin storage and WebGL/GPU rendering remain unverified. Recharts 0×0 warnings in jsdom are unchanged. Portable-preview results are not reused as verification.

## Private-preview review path

Open the account menu, select Panduan Vigor and start Kenali workspace. The greenhouse selector should be clear inside a spotlight, with a tooltip and dimmed blur behind it. Advance through the monitoring board, map, notifications and appearance settings. Then try Siapkan greenhouse: use Coba di halaman on Target tanaman, open and close the editor, and return with Lanjutkan tour. Repeat at phone width; the explanation should scroll independently while previous/next stay available. Escape or Jeda tour should restore normal page interaction and retain progress.
