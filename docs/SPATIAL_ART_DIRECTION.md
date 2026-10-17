# Vigor spatial design, 15 October 2026

## Brief and reviewed direction

Improve the working 2D and 3D greenhouse views using the existing Vigor references, without changing the operational dashboard or replacing it with an image. The references reviewed are `Greenhouse Zones and Crop Cycle.png`, `Isometric greenhouse farm diorama.png`, and the retained greenhouse reference asset. Their useful characteristics are a readable planting plan, substantial crop foliage, visible galvanized structure, central service paths, irrigation, and instruments mounted beside beds.

The earlier implementation provided correct selection and fallback, but the plan was a grid of information cards and the model had repeated low-detail geometry with flat lighting. The new direction is a horticultural site plan paired with an open architectural model. Crops and cultivation method change the representation. Status uses a bed-edge marker and annotation, leaving the material of the plants and beds recognizable.

## Compact tokens

| Name | Hex | Role |
| --- | --- | --- |
| Drawing surface | `#EEF3EF` | Quiet spatial background |
| Concrete | `#D9DFD8` | Slab and service paths |
| Canopy | `#204B35` | Selected zone and deep foliage |
| Leaf | `#83AA57` | Growing leaves with darker undersides |
| Water | `#4A858D` | Irrigation hardware |
| Substrate | `#51483B` | Soil and planting medium |

Keep Plus Jakarta Sans and the established application type scale. All controls and annotations remain left aligned; no uppercase micro-labels, decorative metrics, or new font. The memorably detailed element is the greenhouse itself.

| Surface | Composition |
| --- | --- |
| 2D | A single greenhouse footprint with crop beds, paths, pipework and an entry; native zone targets over the drawing; readable annotations outside foliage. |
| 3D | Open-front architectural model on a shallow slab, detailed instanced plants, restrained material contrast, one sun shadow and sky fill; compact zone markers. |
| Controls | Shared layers and 2D/3D switch; manual orbit/top/fit/focus; device visibility; persistent accessible zone selector. |

Review before implementation: a full glass shell would obscure the crop and create transparency sorting problems; retain a deliberately partial cover. Bloom, artificial glow, autonomous camera rotation and decorative motion would not help monitoring, so omit them. Plant instances illustrate crop identity and stage; they are not a one-to-one inventory or a prediction. Device representations come only from active assigned devices. Layout remains illustrative, not a surveyed construction drawing.

## Requested skills applied

Read through the GitHub connector at commit `b1c623076c661fc9b03dac19292e825a5d106823`:

- [threejs-fundamentals](https://github.com/CloudAI-X/threejs-skills/blob/b1c623076c661fc9b03dac19292e825a5d106823/skills/threejs-fundamentals/SKILL.md): scene hierarchy, orthographic composition, bounded pixel ratio, cleanup.
- [threejs-geometry](https://github.com/CloudAI-X/threejs-skills/blob/b1c623076c661fc9b03dac19292e825a5d106823/skills/threejs-geometry/SKILL.md): custom indexed leaf/fruit geometry and instanced plants.
- [threejs-materials](https://github.com/CloudAI-X/threejs-skills/blob/b1c623076c661fc9b03dac19292e825a5d106823/skills/threejs-materials/SKILL.md): material-specific roughness/metalness, opaque surfaces by default.
- [threejs-lighting](https://github.com/CloudAI-X/threejs-skills/blob/b1c623076c661fc9b03dac19292e825a5d106823/skills/threejs-lighting/SKILL.md): one directional shadow, fitted shadow bounds and hemisphere fill.
- [threejs-interaction](https://github.com/CloudAI-X/threejs-skills/blob/b1c623076c661fc9b03dac19292e825a5d106823/skills/threejs-interaction/SKILL.md): deliberate selection, camera focus and separate simple hit surfaces.

Adapt examples to the installed Three r180 / R3F 9 / Drei 10 API, not verbatim. No package or global skill installation is needed. Avoid the lighting skill's unsupported `three/addons` ContactShadows example; use native directional shadows. Keep on-demand rendering and the existing renderer error boundary/context-loss fallback.

## Verification limit

Managed Sites has no available control-browser capability in this session. DOM checks, geometry checks and production build can be run. They do not establish actual screenshot appearance, WebGL shadow quality, touch behavior or GPU performance.


## Implementation and checks

- 2D uses native zone buttons around code-native botanical SVGs. The plan shows crop rows, planting media, entry, service paths and equipment. Type remains fixed-size; overflow is local. Three botanical SVG variants were rendered with native SVG rasterization and inspected as assets; this is not a browser screenshot or full layout review.
- 3D uses a lower open galvanized structure with only part of the translucent cover, soil beds / polybag containers / raised hydroponic channels, assigned camera/sensor assemblies, pump and connected branches. A directional light casts bounded 1024 px shadows with hemisphere fill.
- Leaves and peppers use custom indexed geometry. Foliage, main stems/stalks, peppers, tomatoes and pots use five instanced meshes with fixed capacity for 32 zones and up to 18 illustrative plants per zone. Counters and bounds are rebuilt when batch, stage, method, population or active status changes. Custom geometry is disposed on unmount. Rendering remains on demand with DPR capped at 1.5; GPU frame rates have not been measured.
- Fruits appear only for the appropriate recorded generative/harvest stage. A closed/missing batch, empty population or inactive zone does not retain decorative plants. Missing sensor values remain missing.
- Controls retain layer/selection across views and failure/retry. The new Focus zone command fits the chosen plot in either camera angle; Fit restores the full building. The device toggle controls both renderers.
- 226 Vitest checks pass, including the existing full application regressions, actual Three.js/OrbitControls camera math at 390/768/1280/1440, dynamic instanced buffers, crop transitions and DOM selection/fallback controls. DOM renderer tests use a mock WebGL renderer. TypeScript and formatter are checked separately. Existing 55 domain tests are unchanged; the previous run passed.
- No new dependency, backend, network-loaded model or image-as-interface. Production packaging and private deployment use the actual application source.
