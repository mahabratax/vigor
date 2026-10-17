import { expect, it } from 'vitest';
import {
  backdropRects,
  intersectRect,
  placeGuide,
  type GuideRect,
} from '../src/features/guide/placement';

const inside = (r: GuideRect, v: GuideRect) => {
  expect(r.x).toBeGreaterThanOrEqual(v.x);
  expect(r.y).toBeGreaterThanOrEqual(v.y);
  expect(r.x + r.width).toBeLessThanOrEqual(v.x + v.width + 0.001);
  expect(r.y + r.height).toBeLessThanOrEqual(v.y + v.height + 0.001);
};
const viewports = [
  { x: 0, y: 0, width: 390, height: 844 },
  { x: 0, y: 0, width: 768, height: 1024 },
  { x: 0, y: 0, width: 1280, height: 800 },
  { x: 0, y: 0, width: 1440, height: 900 },
  { x: 0, y: 0, width: 844, height: 390 },
  // Pinch zoom / visualViewport offsets and a short viewport.
  { x: 80, y: 120, width: 320, height: 360 },
];
it.each(viewports)(
  'keeps navigation reachable and the blur cutout clear at $width × $height',
  (viewport) => {
    const targets: (GuideRect | null)[] = [
      { x: viewport.x + 18, y: viewport.y + 18, width: 160, height: 44 },
      { x: viewport.x + viewport.width - 48, y: viewport.y + 18, width: 44, height: 44 },
      { x: viewport.x + 10, y: viewport.y + 20, width: viewport.width - 20, height: 1800 },
      { x: viewport.x + 20, y: viewport.y + viewport.height - 60, width: 300, height: 44 },
      { x: viewport.x, y: viewport.y + 2000, width: 250, height: 400 },
      null,
    ];
    for (const target of targets)
      for (const height of [260, 400, 700]) {
        const result = placeGuide(target, viewport, height);
        inside(result.panel, viewport);
        expect(result.panel.height).toBeLessThanOrEqual(result.maxHeight);
        if (result.spotlight) {
          inside(result.spotlight, viewport);
          expect(intersectRect(result.panel, result.spotlight)).toBeNull();
        }
        const panes = backdropRects(viewport, result.spotlight);
        for (const [i, pane] of panes.entries()) {
          inside(pane, viewport);
          if (result.spotlight) expect(intersectRect(pane, result.spotlight)).toBeNull();
          for (const other of panes.slice(i + 1)) expect(intersectRect(pane, other)).toBeNull();
        }
        const area =
          panes.reduce((total, p) => total + p.width * p.height, 0) +
          (result.spotlight ? result.spotlight.width * result.spotlight.height : 0);
        expect(area).toBeCloseTo(viewport.width * viewport.height, 4);
      }
  },
);
it('places a small header target below and keeps a right-edge tooltip inside the viewport', () => {
  const p = placeGuide({ x: 1390, y: 12, width: 40, height: 40 }, viewports[3], 300);
  expect(p.side).toBe('bottom');
  expect(p.spotlight?.width).toBe(52);
  expect(p.panel.y).toBeGreaterThan(52);
  expect(p.panel.x + p.panel.width).toBeLessThanOrEqual(1428);
});
