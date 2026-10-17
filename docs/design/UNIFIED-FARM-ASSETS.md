# Unified farm artwork and prototype entry

17 October 2026

The previous revision introduced miniature greenhouse scenes but left flat overhead crop drawings and flat service symbols in the interactive plan. This revision uses the same material and lighting language for farm objects at every scale.

## Visual decisions

- Preserve forest `#1D593F`, leaf `#73A15C`, sage `#EAF2EB`, water `#357E88`, ink `#20352B` and white `#FFFFFF`.
- Preserve Plus Jakarta Sans and the existing type scale. Equipment names, quantities and measured states remain readable text.
- Generate a single miniature equipment family: solar, tank/pump, fertigation, fan, controller, camera and sensor. Matte white enclosures, teal plumbing, dark green details, soft upper-left lighting and no embedded labels.
- Generate individual leafy, tomato and pepper plant sprites in the same material style. Render them on code-defined raised beds so plant counts, empty zones, inactive zones and cultivation methods still follow records.
- Move 2D beds from flat top-down symbols to shallow three-quarter miniature beds. The 2D plan remains a selectable arrangement of live records, not a flattened image. Exact zone area, crop and plant counts remain adjacent text.
- Use the same equipment image in service selectors, service details and device illustrations. Retain one consistent Lucide family for small functional actions and navigation; subject images never replace a close, menu or status control.
- Remove the old flat equipment drawings. Avoid a second set of decorative backgrounds, neon, floating UI, oversized shadows or repeated full scenes.

Review against the brief: regenerating full-page scenes would leave the actual mismatch unresolved. This pass replaces the farm-object vocabulary where it was inconsistent, using compact assets and a shared mapping rather than adding more banners.

## Prototype entry

Replace the secondary ChatGPT redirect with a local prototype entry button. This is an explicitly simulated application session; it does not establish identity, grant roles, or alter the private Sites access policy. Preserve existing records and role selections. Logout ends this local presentation session and returns to entry. The platform still controls access to the private Site.

The button is labeled **Enter workspace**, with **Prototype access. No email or password needed.** immediately below. Both account-menu and profile-settings Logout actions return to `/login`. A requested greenhouse or workflow link survives entry. Session storage retains entry within the current tab; an in-memory fallback supports browsers that block it. Revisiting a workspace route after logout shows entry again. Login remains independent of SQLite initialization, and workspace storage recovery is preserved.

## Applied assets

| Object | Reused in |
| --- | --- |
| Solar installation | 2D service area, 3D asset selector, service details |
| Water tank, pump and filter | Service area, asset selector, service details, irrigation devices |
| Nutrient dosing station | Service area, asset selector, service details, dosing devices |
| Ventilation fan | Service area, asset selector, service details, environmental devices |
| Controller cabinet | Service area, asset selector, service details, controller devices |
| Camera | Device list and device details |
| Sensor | Device list and device details |
| Leafy, tomato and pepper plants | Data-driven 2D crop beds |

All ten transparent PNG originals are in `design-assets/farm-objects`. Delivery versions are WebP, at most 320 px, approximately 272 KiB total on disk. Exact generation prompts and source/delivery mappings are in `farm-object-prompts.json`; `node scripts/prepare-farm-objects.mjs` reproduces delivery encoding from the preserved originals.

The 2D plan uses a compact equipment strip below the beds and removes the duplicated selector above it. Small action/navigation controls retain the same Lucide family. Plant sprites are defined once per bed and referenced by each planting position. A bed shows at most eighteen representative plants; exact counts and areas remain adjacent labels. Empty/inactive beds have no plant sprites. Soil, hydroponic channels and grow bags remain distinct. The fruitless assets do not claim a harvest is ready.

All delivery assets are imported with explicit `image/webp` data URLs, preserving the existing fix for broken hosted image paths. A failed equipment image falls back to the common action-icon family; selection and details remain usable. Plant decode failures leave the bed structure and zone information visible.

## Verification and limits

- Visually inspected all new generated objects and the actual 2D crop-bed SVG composition for leafy, tomato and pepper plants. The static art review used PNG decoding for the SVG renderer; application delivery remains WebP.
- Focused behavior checks passed: entry button, return destination, storage restrictions, account/profile logout, preserved records and roles, image failures, equipment selection, zone selection, layer controls and 3D-to-2D recovery.
- DOM tests cover relevant interaction branches at 390, 768, 1280 and 1440 px. They do not verify CSS layout or WebGL pixels.
- Full regression suite: **510 passed in 36 files**. TypeScript checking passed.
- Actual GCP browser and server build passed its route, asset, worker/WASM, server-import and provider-isolation checks. All 21 production image byte sequences were verified as `image/webp` data URLs. This is build verification, not a GCP deployment.
- The Sites release gate runs the actual framework build and the same 21-image production verification before packaging, committing and deploying the private saved version.

The managed browser capability is unavailable in this session. Live screenshots, responsive overflow, on-device interaction and real WebGL rendering remain unverified. No replacement browser or preview server was started. Real identity, Sites access policy, role grants, schema, greenhouse records, device connections and Google model activation were not changed.
