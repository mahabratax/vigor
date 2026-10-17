import * as THREE from 'three';
import type { GreenhouseLayout } from './spatialModel';
import { serviceLayout, type ServiceId } from './serviceModel';

export function assetAnchor(layout: GreenhouseLayout, id: ServiceId): [number, number, number] {
  const { x } = serviceLayout(layout);
  switch (id) {
    case 'solar':
      return [x, 3.12, -2.7];
    case 'water':
      return [x + 0.35, 1.62, 3.05];
    case 'nutrition':
      return [x + 0.72, 1.5, 1.3];
    case 'controller':
      return [x - 1.13, 1.9, 0.6];
    case 'climate':
      return [0, 3.25, -layout.depth / 2 + 0.2];
  }
}
export function assetBounds(layout: GreenhouseLayout, id: ServiceId) {
  const { x } = serviceLayout(layout);
  const bounds: Record<ServiceId, [number[], number[]]> = {
    solar: [
      [x - 1.9, -0.1, -4.5],
      [x + 1.9, 3.5, 1.3],
    ],
    water: [
      [x - 1.3, -0.1, 2.15],
      [x + 1.1, 1.85, 3.9],
    ],
    nutrition: [
      [x, -0.1, 0.3],
      [x + 1.4, 1.75, 2],
    ],
    controller: [
      [x - 1.6, -0.1, 0],
      [x - 0.6, 2.1, 1.2],
    ],
    climate: [
      [-0.8, 1.3, -layout.depth / 2 - 0.2],
      [0.8, 3.6, -layout.depth / 2 + 1],
    ],
  };
  return new THREE.Box3(new THREE.Vector3(...bounds[id][0]), new THREE.Vector3(...bounds[id][1]));
}
export interface AssetProjection {
  id: ServiceId;
  x: number;
  y: number;
  dx: number;
  dy: number;
  popover: { left: number; top: number; width: number; maxHeight: number };
}
/** Keep constant-size pins apart from each other and from the zone labels, in screen pixels. */
export function projectAssetLabels(
  camera: THREE.Camera,
  layout: GreenhouseLayout,
  width: number,
  height: number,
  ids: ServiceId[],
  selected: ServiceId | null,
  zoneLabels: { x: number; y: number }[] = [],
): AssetProjection[] {
  if (width < 110 || height < 120) return [];
  const placed: AssetProjection[] = [];
  const occupied = zoneLabels.map((p) => ({ ...p, w: 40, h: 34 }));
  const ordered =
    selected && ids.includes(selected) ? [selected, ...ids.filter((id) => id !== selected)] : ids;
  const offsets = [
    [0, -12],
    [0, -50],
    [0, 28],
    [78, -12],
    [-78, -12],
    [78, 28],
    [-78, 28],
    [0, -88],
    [0, 66],
    [78, -50],
    [-78, -50],
  ];
  for (const id of ordered) {
    const point = new THREE.Vector3(...assetAnchor(layout, id)).project(camera);
    const anchorX = ((point.x + 1) * width) / 2,
      anchorY = ((1 - point.y) * height) / 2;
    if (
      point.z < -1 ||
      point.z > 1 ||
      anchorX < 0 ||
      anchorX > width ||
      anchorY < 0 ||
      anchorY > height
    )
      continue;
    const candidate = offsets
      .map(([dx, dy]) => ({
        x: THREE.MathUtils.clamp(anchorX + dx, 46, width - 46),
        y: THREE.MathUtils.clamp(anchorY + dy, 22, height - 22),
      }))
      .find(
        (p) =>
          !occupied.some(
            (o) =>
              Math.abs(p.x - o.x) < (76 + o.w) / 2 + 5 && Math.abs(p.y - o.y) < (32 + o.h) / 2 + 5,
          ),
      );
    if (!candidate) continue;
    const popWidth = Math.min(280, width - 24),
      popHeight = Math.min(260, height - 24);
    const popX = THREE.MathUtils.clamp(
      candidate.x < width / 2 ? candidate.x - 38 : candidate.x + 38 - popWidth,
      12,
      width - popWidth - 12,
    );
    const popY = THREE.MathUtils.clamp(
      candidate.y + 24 + popHeight <= height - 12 ? candidate.y + 24 : candidate.y - 24 - popHeight,
      12,
      height - popHeight - 12,
    );
    placed.push({
      id,
      ...candidate,
      dx: candidate.x - anchorX,
      dy: candidate.y - anchorY,
      popover: { left: popX - anchorX, top: popY - anchorY, width: popWidth, maxHeight: popHeight },
    });
    occupied.push({ ...candidate, w: 76, h: 32 });
  }
  return placed;
}
