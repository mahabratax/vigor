import { expect, it } from 'vitest';
import * as THREE from 'three';
import { greenhouseLayout } from '../src/features/greenhouse/spatialModel';
import {
  assetAnchor,
  assetBounds,
  projectAssetLabels,
} from '../src/features/greenhouse/assetAnnotations';
import {
  boundsCorners,
  fitAssetCamera,
  fitGreenhouseCamera,
  visibleZoneLabels,
} from '../src/features/greenhouse/sceneGeometry';
import type { ServiceId } from '../src/features/greenhouse/serviceModel';
const ids: ServiceId[] = ['solar', 'water', 'nutrition', 'controller', 'climate'];

it.each([390, 768, 1280, 1440])(
  'places selected asset pins and popovers inside %s px without overlapping visible zone labels (projection only)',
  (width) => {
    for (const count of [1, 6, 32])
      for (const mode of ['isometric', 'top'] as const)
        for (const selected of ids) {
          const layout = greenhouseLayout(count),
            camera = new THREE.OrthographicCamera(),
            height = width < 768 ? 440 : 560;
          fitGreenhouseCamera(camera, layout, width, height, mode, true);
          const zones = visibleZoneLabels(camera, layout, width, height, 0);
          const pins = projectAssetLabels(camera, layout, width, height, ids, selected, zones);
          expect(
            pins.some((p) => p.id === selected),
            `${count} beds / ${mode} / ${selected}`,
          ).toBe(true);
          for (const [i, pin] of pins.entries()) {
            expect(pin.x - 38).toBeGreaterThanOrEqual(8);
            expect(pin.x + 38).toBeLessThanOrEqual(width - 8);
            expect(pin.y - 16).toBeGreaterThanOrEqual(6);
            expect(pin.y + 16).toBeLessThanOrEqual(height - 6);
            for (const other of pins.slice(i + 1))
              expect(Math.abs(pin.x - other.x) >= 81 || Math.abs(pin.y - other.y) >= 37).toBe(true);
            for (const zone of zones)
              expect(Math.abs(pin.x - zone.x) >= 63 || Math.abs(pin.y - zone.y) >= 38).toBe(true);
            const anchor = new THREE.Vector3(...assetAnchor(layout, pin.id)).project(camera);
            const left = ((anchor.x + 1) * width) / 2 + pin.popover.left,
              top = ((1 - anchor.y) * height) / 2 + pin.popover.top;
            expect(left).toBeGreaterThanOrEqual(11.99);
            expect(left + pin.popover.width).toBeLessThanOrEqual(width - 11.99);
            expect(top).toBeGreaterThanOrEqual(11.99);
            expect(top + pin.popover.maxHeight).toBeLessThanOrEqual(height - 11.99);
          }
        }
  },
);
it.each([390, 768, 1280, 1440])(
  'fits physical equipment at %s px and restores the full scene without losing the selected pin',
  (width) => {
    for (const mode of ['isometric', 'top'] as const)
      for (const id of ids) {
        const layout = greenhouseLayout(32),
          camera = new THREE.OrthographicCamera();
        const full = fitGreenhouseCamera(camera, layout, width, 440, mode, true);
        const focus = fitAssetCamera(camera, layout, id, width, 440, mode);
        expect(focus.zoom).toBeGreaterThan(full.zoom);
        for (const corner of boundsCorners(assetBounds(layout, id))) {
          const p = corner.project(camera);
          expect(Math.abs(p.x)).toBeLessThan(1);
          expect(Math.abs(p.y)).toBeLessThan(1);
          expect(p.z).toBeGreaterThan(-1);
          expect(p.z).toBeLessThan(1);
        }
        const labels = projectAssetLabels(
          camera,
          layout,
          width,
          440,
          ids,
          id,
          visibleZoneLabels(camera, layout, width, 440, 0),
        );
        expect(
          labels.some((p) => p.id === id),
          `${mode} / ${id}`,
        ).toBe(true);
        expect(fitGreenhouseCamera(camera, layout, width, 440, mode, true).zoom).toBeCloseTo(
          full.zoom,
        );
      }
  },
);
it('does not create pins for absent services or a viewport too small to contain a tooltip', () => {
  const layout = greenhouseLayout(6),
    camera = new THREE.OrthographicCamera();
  fitGreenhouseCamera(camera, layout, 390, 440, 'isometric', true);
  expect(projectAssetLabels(camera, layout, 390, 440, [], null)).toEqual([]);
  expect(projectAssetLabels(camera, layout, 90, 90, ids, null)).toEqual([]);
  expect(
    projectAssetLabels(camera, layout, 390, 440, ['water'], 'solar').some((p) => p.id === 'solar'),
  ).toBe(false);
});
