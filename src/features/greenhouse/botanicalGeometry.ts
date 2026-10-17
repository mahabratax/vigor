import * as THREE from 'three';
import {
  LEAVES_PER_PLANT,
  PLANTS_PER_PLOT,
  plantingPoints,
  type CropAppearance,
} from './botanicalModel';
import type { GreenhouseLayout } from './spatialModel';

export const MAX_PLANTS = 32 * PLANTS_PER_PLOT;
export const botanicalCapacity = {
  leaves: MAX_PLANTS * LEAVES_PER_PLANT,
  stems: MAX_PLANTS * 3,
  fruits: MAX_PLANTS * 2,
  tomatoes: MAX_PLANTS * 2,
  pots: MAX_PLANTS,
} as const;
export type BotanicalMeshes = Record<keyof typeof botanicalCapacity, THREE.InstancedMesh>;

/** A pointed, folded leaf with a raised midrib. Its base is at the origin, tip at +Y. */
export function createLeafGeometry() {
  const positions: number[] = [],
    indices: number[] = [];
  const segments = 8;
  for (let row = 0; row <= segments; row++) {
    const t = row / segments;
    const half = Math.pow(Math.sin(t * Math.PI), 0.85) * 0.29;
    for (const side of [-1, 0, 1]) {
      positions.push(
        side * half,
        t,
        Math.sin(t * Math.PI) * (side === 0 ? 0.12 : 0.025) - t * t * 0.12,
      );
    }
  }
  for (let row = 0; row < segments; row++)
    for (let col = 0; col < 2; col++) {
      const a = row * 3 + col;
      indices.push(a, a + 1, a + 3, a + 1, a + 4, a + 3);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Four lobes and a broad shoulder distinguish peppers from spherical tomato instances. */
export function createPepperGeometry() {
  const positions: number[] = [],
    indices: number[] = [];
  const rings = 10,
    segments = 16;
  for (let row = 0; row <= rings; row++) {
    const t = row / rings;
    const radius = Math.pow(Math.sin(Math.PI * t), 0.42) * (0.72 + 0.22 * t);
    for (let column = 0; column <= segments; column++) {
      const a = (column / segments) * Math.PI * 2;
      const lobe = radius * (1 + 0.12 * Math.cos(a * 4));
      positions.push(Math.cos(a) * lobe, (t - 0.5) * 2, Math.sin(a) * lobe);
    }
  }
  for (let row = 0; row < rings; row++)
    for (let col = 0; col < segments; col++) {
      const a = row * (segments + 1) + col,
        b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function populateBotanicalMeshes(
  meshes: BotanicalMeshes,
  layout: GreenhouseLayout,
  plots: CropAppearance[],
) {
  const dummy = new THREE.Object3D(),
    color = new THREE.Color();
  const up = new THREE.Vector3(0, 1, 0),
    direction = new THREE.Vector3();
  const counts = { leaves: 0, stems: 0, fruits: 0, tomatoes: 0, pots: 0 };
  const add = (name: keyof BotanicalMeshes, tint?: string) => {
    const index = counts[name]++;
    dummy.updateMatrix();
    meshes[name].setMatrixAt(index, dummy.matrix);
    if (tint) meshes[name].setColorAt(index, color.set(tint));
  };
  plots.forEach((plot, index) => {
    const bed = layout.positions[index];
    if (!bed || plot.inactive) return;
    const tall = !plot.seedling && ['pepper', 'tomato'].includes(plot.kind);
    const baseY = plot.bed === 'channels' ? 0.58 : plot.bed === 'bags' ? 0.43 : 0.28;
    plantingPoints(plot.plants).forEach((plant, i) => {
      const x = bed.x + plant.x,
        z = bed.z + plant.z;
      const height = (plot.seedling ? 0.27 : tall ? 1.35 : 0.38) * plant.variation;
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(x, baseY + height / 2, z);
      dummy.scale.set(0.018, height, 0.018);
      add('stems');
      if (plot.bed === 'bags') {
        dummy.position.set(x, 0.24, z);
        dummy.scale.set(0.19, 0.38, 0.19);
        add('pots');
      }
      for (let leaf = 0; leaf < LEAVES_PER_PLANT; leaf++) {
        const angle = leaf * 2.39996 + plant.angle;
        const y = tall ? baseY + height * (0.25 + leaf * 0.07) : baseY + height * 0.25;
        dummy.position.set(x, y, z);
        direction
          .set(
            Math.cos(angle),
            tall ? 0.32 + (leaf % 3) * 0.1 : 0.18 + leaf * 0.04,
            Math.sin(angle),
          )
          .normalize();
        dummy.quaternion.setFromUnitVectors(up, direction);
        const length =
          (plot.seedling ? 0.2 : tall ? 0.5 : 0.45) * plant.variation * (0.82 + (leaf % 3) * 0.09);
        dummy.scale.set(length * (plot.kind === 'leafy' ? 1.65 : 1), length, length);
        add('leaves', ['#315b35', '#4d793c', '#83aa57', '#648e43'][leaf % 4]);
      }
      if (plot.fruiting)
        for (let fruit = 0; fruit < 2; fruit++) {
          const angle = plant.angle + fruit * Math.PI;
          dummy.position.set(
            x + Math.cos(angle) * 0.19,
            baseY + height * (0.45 + fruit * 0.23),
            z + Math.sin(angle) * 0.19,
          );
          dummy.rotation.set(0.08, angle, fruit ? 0.16 : -0.12);
          dummy.scale.set(0.105, plot.kind === 'tomato' ? 0.11 : 0.16, 0.105);
          add(
            plot.kind === 'tomato' ? 'tomatoes' : 'fruits',
            ['#ba4532', '#d09539', '#507638'][(i + fruit) % 3],
          );
          dummy.position.y += plot.kind === 'tomato' ? 0.11 : 0.16;
          direction.set(-Math.cos(angle) * 0.19, 0.12, -Math.sin(angle) * 0.19);
          dummy.position.addScaledVector(direction, 0.5);
          const stalkLength = direction.length();
          dummy.quaternion.setFromUnitVectors(up, direction.normalize());
          dummy.scale.set(0.009, stalkLength, 0.009);
          add('stems');
        }
    });
  });
  for (const key of Object.keys(meshes) as (keyof BotanicalMeshes)[]) {
    const mesh = meshes[key];
    mesh.count = counts[key];
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }
}
