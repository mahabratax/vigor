import * as THREE from 'three';
import type { CameraMode, GreenhouseLayout } from './spatialModel';
import { assetBounds } from './assetAnnotations';
import type { ServiceId } from './serviceModel';

export function sceneBounds(layout: GreenhouseLayout, services = false) {
  return new THREE.Box3(
    new THREE.Vector3(
      -layout.width / 2 - 0.75,
      -0.5,
      -Math.max(layout.depth / 2 + 0.7, services ? 4.6 : 0),
    ),
    new THREE.Vector3(
      layout.width / 2 + (services ? 4.6 : 0.75),
      3.95,
      Math.max(layout.depth / 2 + 0.7, services ? 4.6 : 0),
    ),
  );
}
export function boundsCorners(bounds: THREE.Box3) {
  return [bounds.min.x, bounds.max.x].flatMap((x) =>
    [bounds.min.y, bounds.max.y].flatMap((y) =>
      [bounds.min.z, bounds.max.z].map((z) => new THREE.Vector3(x, y, z)),
    ),
  );
}
/** Fit the actual projected bounding box, including the roof, with room for zone markers. */
export function fitGreenhouseCamera(
  camera: THREE.OrthographicCamera,
  layout: GreenhouseLayout,
  width: number,
  height: number,
  mode: CameraMode,
  services = false,
) {
  return fitCameraBounds(camera, sceneBounds(layout, services), width, height, mode);
}

export function zoneBounds(layout: GreenhouseLayout, index: number) {
  const zone = layout.positions[index];
  if (!zone) return sceneBounds(layout);
  return new THREE.Box3(
    new THREE.Vector3(zone.x - 2.25, -0.15, zone.z - 1.8),
    new THREE.Vector3(zone.x + 2.25, 2.7, zone.z + 1.8),
  );
}
export function fitZoneCamera(
  camera: THREE.OrthographicCamera,
  layout: GreenhouseLayout,
  index: number,
  width: number,
  height: number,
  mode: CameraMode,
) {
  const fit = fitCameraBounds(camera, zoneBounds(layout, index), width, height, mode);
  camera.far = Math.max(camera.far, sceneBounds(layout).getSize(new THREE.Vector3()).length() * 8);
  camera.updateProjectionMatrix();
  return fit;
}
export function fitAssetCamera(
  camera: THREE.OrthographicCamera,
  layout: GreenhouseLayout,
  id: ServiceId,
  width: number,
  height: number,
  mode: CameraMode,
) {
  const fit = fitCameraBounds(camera, assetBounds(layout, id), width, height, mode);
  camera.far = Math.max(
    camera.far,
    sceneBounds(layout, true).getSize(new THREE.Vector3()).length() * 8,
  );
  camera.updateProjectionMatrix();
  return fit;
}
function fitCameraBounds(
  camera: THREE.OrthographicCamera,
  bounds: THREE.Box3,
  width: number,
  height: number,
  mode: CameraMode,
) {
  const target = bounds.getCenter(new THREE.Vector3());
  const distance = bounds.getSize(new THREE.Vector3()).length() * 2;
  const direction =
    mode === 'top' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0.7, 1.35, 1.75).normalize();
  camera.up.set(0, mode === 'top' ? 0 : 1, mode === 'top' ? -1 : 0);
  camera.position.copy(target).addScaledVector(direction, distance);
  camera.near = 0.1;
  camera.far = distance * 4;
  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  const projected = boundsCorners(bounds).map((p) => p.applyMatrix4(camera.matrixWorldInverse));
  const spanX = Math.max(...projected.map((p) => p.x)) - Math.min(...projected.map((p) => p.x));
  const spanY = Math.max(...projected.map((p) => p.y)) - Math.min(...projected.map((p) => p.y));
  const zoom = Math.max(
    0.1,
    Math.min(Math.max(1, width - 64) / spanX, Math.max(1, height - 64) / spanY),
  );
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
  return { target, zoom, minZoom: zoom * 0.6, maxZoom: zoom * 4 };
}
/** HTML markers stay at a readable size. Suppress collisions while keeping the selected zone first. */
export function visibleZoneLabels(
  camera: THREE.Camera,
  layout: GreenhouseLayout,
  width: number,
  height: number,
  selected: number,
) {
  const placed: { index: number; x: number; y: number }[] = [];
  const order = [selected, ...layout.positions.map((_, i) => i).filter((i) => i !== selected)];
  for (const index of order) {
    const position = layout.positions[index];
    if (!position) continue;
    const point = new THREE.Vector3(position.x, 2.05, position.z).project(camera);
    const x = ((point.x + 1) * width) / 2,
      y = ((1 - point.y) * height) / 2;
    if (point.z < -1 || point.z > 1 || x < 24 || x > width - 24 || y < 20 || y > height - 20)
      continue;
    if (placed.some((other) => Math.abs(x - other.x) < 46 && Math.abs(y - other.y) < 40)) continue;
    placed.push({ index, x, y });
  }
  return placed;
}

export function cameraPolarLimits(mode: CameraMode) {
  // Top mode uses north (-Z) as camera up, so its polar angle is 90°, not 0°.
  return {
    minPolarAngle: mode === 'top' ? 0 : Math.PI / 6,
    maxPolarAngle: mode === 'top' ? Math.PI : Math.PI / 2.35,
  };
}
