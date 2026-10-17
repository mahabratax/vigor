# Third-party and supplied assets

## Portable runtime

The preview includes a locally available copy of Preact (`portable/vendor/preact.mjs`), identified in its original header as MIT-licensed. It was available in the environment's PyTorch model-dump viewer. Its exact version is not recorded by that file and is therefore not asserted.

The MIT notice is in `portable/vendor/LICENSE-preact.txt` and is also included inside the built application script and single-file HTML. Canonical upstream license: https://github.com/preactjs/preact/blob/main/LICENSE

The portable React/store/router adapters and lightweight SVG symbol mappings are local compatibility code. They are not copies of the installed React 19, Zustand, React Router, Recharts or lucide-react packages. The native npm dependencies, when installed, retain their own upstream licenses.

## User-provided design media

The five WEBP files are crops of the user's supplied Vigor design/reference assets. Original artwork, branding and any depicted photography remain subject to the user's rights and original licenses; no new ownership or redistribution license is asserted here. No font files are distributed.
