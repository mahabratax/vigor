import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { createFixture } from '../src/data/fixtures';
import {
  greenhouseLayout,
  spatialLayer,
  zoneVisual,
} from '../src/features/greenhouse/spatialModel';
import {
  boundsCorners,
  cameraPolarLimits,
  fitGreenhouseCamera,
  fitZoneCamera,
  zoneBounds,
  sceneBounds,
  visibleZoneLabels,
} from '../src/features/greenhouse/sceneGeometry';
import {
  botanicalCapacity,
  populateBotanicalMeshes,
  createLeafGeometry,
  createPepperGeometry,
  type BotanicalMeshes,
} from '../src/features/greenhouse/botanicalGeometry';
import {
  cropAppearance,
  PLANTS_PER_PLOT,
  type CropAppearance,
} from '../src/features/greenhouse/botanicalModel';
import { activeBatch, cultivation } from '../src/domain/zones';

describe('shared greenhouse coordinates and camera projection', () => {
  it.each([1, 2, 6, 7, 12, 19, 32])(
    'keeps all %s beds separated and inside the building',
    (count) => {
      const layout = greenhouseLayout(count);
      expect(layout.positions).toHaveLength(count);
      for (const [i, bed] of layout.positions.entries()) {
        expect(Math.abs(bed.x) + layout.bedWidth / 2).toBeLessThan(layout.width / 2);
        expect(Math.abs(bed.z) + layout.bedDepth / 2).toBeLessThan(layout.depth / 2);
        expect(bed.row).toBe(Math.floor(i / layout.columns));
        for (const other of layout.positions.slice(i + 1)) {
          expect(
            Math.abs(bed.x - other.x) >= layout.bedWidth ||
              Math.abs(bed.z - other.z) >= layout.bedDepth,
          ).toBe(true);
        }
      }
      if (count === 1) expect(layout.positions[0]).toMatchObject({ x: 0, z: 0 });
    },
  );
  it.each([320, 390, 768, 1280, 1440])(
    'fits every corner inside a %s px viewport in both camera modes, including 32 zones',
    (width) => {
      for (const count of [1, 6, 7, 19, 32])
        for (const mode of ['isometric', 'top'] as const) {
          const camera = new THREE.OrthographicCamera(),
            layout = greenhouseLayout(count);
          const controls = new OrbitControls(camera);
          Object.assign(controls, cameraPolarLimits(mode));
          const fit = fitGreenhouseCamera(camera, layout, width, 410, mode);
          controls.target.copy(fit.target);
          controls.update();
          camera.updateMatrixWorld(true);
          for (const corner of boundsCorners(sceneBounds(layout))) {
            const projected = corner.project(camera);
            expect(Math.abs(projected.x)).toBeLessThan(1);
            expect(Math.abs(projected.y)).toBeLessThan(1);
            expect(projected.z).toBeGreaterThan(-1);
            expect(projected.z).toBeLessThan(1);
          }
          const markers = visibleZoneLabels(camera, layout, width, 410, count - 1);
          expect(markers.some((m) => m.index === count - 1)).toBe(true);
          for (const [i, marker] of markers.entries())
            for (const other of markers.slice(i + 1)) {
              expect(Math.abs(marker.x - other.x) >= 46 || Math.abs(marker.y - other.y) >= 40).toBe(
                true,
              );
            }
        }
    },
  );
  it('keeps north and row order consistent between the plan and top camera', () => {
    const camera = new THREE.OrthographicCamera(),
      layout = greenhouseLayout(6);
    fitGreenhouseCamera(camera, layout, 500, 490, 'top');
    const screen = layout.positions.map((p) => new THREE.Vector3(p.x, 0, p.z).project(camera));
    expect(screen[0].x).toBeLessThan(screen[1].x);
    expect(screen[0].y).toBeGreaterThan(screen[2].y);
    expect(screen[2].y).toBeGreaterThan(screen[4].y);
  });
  it('refits after a narrow resize, replacing prior zoom and orientation', () => {
    const camera = new THREE.OrthographicCamera(),
      layout = greenhouseLayout(32);
    fitGreenhouseCamera(camera, layout, 900, 490, 'isometric');
    camera.zoom *= 4;
    camera.position.set(90, 20, -12);
    fitGreenhouseCamera(camera, layout, 314, 410, 'top');
    for (const corner of boundsCorners(sceneBounds(layout)))
      expect(Math.abs(corner.project(camera).x)).toBeLessThan(1);
  });
});

describe('layer data, not cosmetic fixture colors', () => {
  it('removes the temperature and its green status when the real zone sensor becomes unavailable', () => {
    const s = createFixture(),
      z = s.zones[0];
    expect(zoneVisual(s, z, 'temperature')).toMatchObject({ label: '27.8 °C', tone: 'green' });
    s.devices.find((d) => d.id === 'TH-A-01')!.connection = 'offline';
    expect(zoneVisual(s, z, 'temperature')).toMatchObject({
      label: 'Temperature unavailable',
      tone: 'gray',
    });
    s.devices.find((d) => d.id === 'TH-A-01')!.connection = 'online';
    s.devices.find((d) => d.id === 'TH-A-01')!.calibrated = false;
    expect(zoneVisual(s, z, 'temperature').tone).toBe('gray');
  });
  it('matches the simulator temperature and does not invent readings in custom or inactive zones', () => {
    const s = createFixture(),
      z = s.zones[0];
    s.scenario = 'increasing';
    expect(zoneVisual(s, z, 'temperature')).toMatchObject({ label: '30.2 °C', tone: 'amber' });
    s.greenhouse.source = 'custom';
    expect(zoneVisual(s, z, 'temperature').tone).toBe('gray');
    z.status = 'inactive';
    for (const layer of ['coverage', 'temperature', 'pests'] as const)
      expect(zoneVisual(s, z, layer)).toMatchObject({ label: 'Zone inactive', tone: 'gray' });
  });
  it('keeps monitoring cases blue, inspection cases amber, and missing coverage gray', () => {
    const s = createFixture(),
      zone = s.zones.find((z) => z.id === 'B')!;
    expect(zoneVisual(s, zone, 'pests').tone).toBe('amber');
    s.cases
      .filter((c) => c.zoneId === zone.id)
      .forEach((c) => {
        c.status = 'monitoring';
      });
    expect(zoneVisual(s, zone, 'pests').tone).toBe('blue');
    s.cases
      .filter((c) => c.zoneId === zone.id)
      .forEach((c) => {
        c.status = 'closed';
      });
    s.devices.find((d) => d.type === 'camera' && d.zones.includes(zone.id))!.connection = 'offline';
    expect(zoneVisual(s, zone, 'pests').tone).toBe('gray');
    expect(spatialLayer('missing')).toBe('coverage');
  });
});

it('updates live instanced geometry as zones grow, shrink and become empty without stale plants or buffer overflow', () => {
  const geometry = new THREE.SphereGeometry(1, 7, 5),
    material = new THREE.MeshBasicMaterial();
  const meshes = Object.fromEntries(
    Object.entries(botanicalCapacity).map(([name, capacity]) => [
      name,
      new THREE.InstancedMesh(geometry, material, capacity),
    ]),
  ) as BotanicalMeshes;
  const matrix = new THREE.Matrix4();
  for (const count of [6, 32, 1, 7]) {
    const layout = greenhouseLayout(count);
    populateBotanicalMeshes(
      meshes,
      layout,
      Array.from({ length: count }, () => ({
        plants: 72,
        kind: 'pepper' as const,
        bed: 'bags' as const,
        fruiting: true,
        seedling: false,
        inactive: false,
      })),
    );
    expect(meshes.stems.count).toBe(count * PLANTS_PER_PLOT * 3);
    for (const mesh of Object.values(meshes)) {
      expect(mesh.count).toBeLessThanOrEqual(mesh.instanceMatrix.count);
      if (mesh.count) expect(Number.isFinite(mesh.boundingSphere!.radius)).toBe(true);
      if (mesh.count) mesh.getMatrixAt(mesh.count - 1, matrix);
      expect(matrix.elements.every(Number.isFinite)).toBe(true);
    }
  }
  populateBotanicalMeshes(meshes, greenhouseLayout(1), [
    {
      plants: 3,
      kind: 'leafy',
      bed: 'channels',
      fruiting: false,
      seedling: false,
      inactive: false,
    },
  ]);
  expect(meshes.stems.count).toBe(3);
  expect(meshes.fruits.count).toBe(0);
  populateBotanicalMeshes(meshes, greenhouseLayout(1), [
    { plants: 0, kind: 'generic', bed: 'soil', fruiting: false, seedling: false, inactive: false },
  ]);
  for (const mesh of Object.values(meshes)) {
    expect(mesh.count).toBe(0);
    mesh.dispose();
  }
  geometry.dispose();
  material.dispose();
});

it('keeps the top view overhead after real OrbitControls updates and returns to perspective', () => {
  const camera = new THREE.OrthographicCamera(),
    controls = new OrbitControls(camera),
    layout = greenhouseLayout(7);
  for (const mode of ['isometric', 'top', 'isometric', 'top'] as const) {
    Object.assign(controls, cameraPolarLimits(mode));
    const fit = fitGreenhouseCamera(camera, layout, 390, 410, mode);
    controls.target.copy(fit.target);
    for (let i = 0; i < 3; i++) controls.update();
    camera.updateMatrixWorld(true);
    const direction = camera.getWorldDirection(new THREE.Vector3());
    if (mode === 'top') {
      expect(direction.y).toBeCloseTo(-1);
      expect(direction.z).toBeCloseTo(0);
    } else expect(direction.z).toBeLessThan(-0.5);
    for (const corner of boundsCorners(sceneBounds(layout))) {
      const point = corner.project(camera);
      expect(Math.abs(point.x)).toBeLessThan(1);
      expect(Math.abs(point.y)).toBeLessThan(1);
    }
  }
});

it.each([390, 768, 1280, 1440])(
  'focuses the selected bed at %s px and restores the full greenhouse',
  (width) => {
    const layout = greenhouseLayout(32),
      camera = new THREE.OrthographicCamera(),
      controls = new OrbitControls(camera);
    for (const mode of ['isometric', 'top'] as const) {
      Object.assign(controls, cameraPolarLimits(mode));
      const all = fitGreenhouseCamera(camera, layout, width, 440, mode);
      for (const index of [0, 15, 31]) {
        const focused = fitZoneCamera(camera, layout, index, width, 440, mode);
        controls.target.copy(focused.target);
        controls.update();
        camera.updateMatrixWorld(true);
        expect(focused.zoom).toBeGreaterThan(all.zoom);
        for (const corner of boundsCorners(zoneBounds(layout, index))) {
          const projected = corner.project(camera);
          expect(Math.abs(projected.x)).toBeLessThan(1);
          expect(Math.abs(projected.y)).toBeLessThan(1);
        }
      }
      const restored = fitGreenhouseCamera(camera, layout, width, 440, mode);
      expect(restored.zoom).toBeCloseTo(all.zoom);
    }
  },
);

it('uses the recorded crop, method and stage and never invents fruit or plants in an empty batch', () => {
  const s = createFixture();
  s.cultivation = cultivation(s);
  const z = s.zones[0],
    batch = activeBatch(s, z.id)!;
  batch.crop = 'Bell pepper';
  batch.stage = 'Generatif';
  z.method = 'Substrat / drip';
  expect(cropAppearance(s, z)).toMatchObject({ kind: 'pepper', bed: 'bags', fruiting: true });
  batch.stage = 'Vegetatif';
  expect(cropAppearance(s, z).fruiting).toBe(false);
  batch.stage = 'Persemaian';
  expect(cropAppearance(s, z)).toMatchObject({ seedling: true, fruiting: false });
  batch.crop = 'Lettuce';
  z.method = 'Hidroponik';
  batch.stage = 'Panen';
  expect(cropAppearance(s, z)).toMatchObject({ kind: 'leafy', bed: 'channels', fruiting: false });
  batch.crop = 'Tomat';
  expect(cropAppearance(s, z)).toMatchObject({ kind: 'tomato', fruiting: true });
  batch.status = 'completed';
  expect(cropAppearance(s, z).plants).toBe(0);
  batch.status = 'active';
  z.status = 'inactive';
  expect(cropAppearance(s, z).plants).toBe(0);
});

it('builds finite indexed botanical geometry with normals and bounded vertex counts', () => {
  for (const geometry of [createLeafGeometry(), createPepperGeometry()]) {
    expect(geometry.index!.count).toBeGreaterThan(24);
    expect(geometry.attributes.position.count).toBeLessThan(220);
    for (const attribute of ['position', 'normal'])
      expect(Array.from(geometry.attributes[attribute].array).every(Number.isFinite)).toBe(true);
    expect(geometry.boundingSphere!.radius).toBeGreaterThan(0);
    geometry.dispose();
  }
});

it('clears stale pots and fruit instances when the crop method and stage change', () => {
  const geometry = createLeafGeometry(),
    material = new THREE.MeshStandardMaterial();
  const meshes = Object.fromEntries(
    Object.entries(botanicalCapacity).map(([name, capacity]) => [
      name,
      new THREE.InstancedMesh(geometry, material, capacity),
    ]),
  ) as BotanicalMeshes;
  const plot: CropAppearance = {
    kind: 'pepper',
    bed: 'bags',
    plants: 72,
    fruiting: true,
    seedling: false,
    inactive: false,
  };
  populateBotanicalMeshes(meshes, greenhouseLayout(1), [plot]);
  expect(meshes.pots.count).toBe(18);
  expect(meshes.fruits.count).toBe(36);
  populateBotanicalMeshes(meshes, greenhouseLayout(1), [
    { ...plot, kind: 'tomato', bed: 'channels' },
  ]);
  expect(meshes.fruits.count).toBe(0);
  expect(meshes.pots.count).toBe(0);
  expect(meshes.tomatoes.count).toBe(36);
  populateBotanicalMeshes(meshes, greenhouseLayout(1), [{ ...plot, fruiting: false }]);
  expect(meshes.fruits.count).toBe(0);
  expect(meshes.tomatoes.count).toBe(0);
  for (const mesh of Object.values(meshes)) mesh.dispose();
  geometry.dispose();
  material.dispose();
});
