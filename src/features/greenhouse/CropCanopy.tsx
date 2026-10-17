import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { DomainState } from '../../domain/types';
import type { GreenhouseLayout } from './spatialModel';
import { cropAppearance, type CropAppearance } from './botanicalModel';
import {
  botanicalCapacity,
  createLeafGeometry,
  createPepperGeometry,
  populateBotanicalMeshes,
} from './botanicalGeometry';

export function CropCanopy({ s, layout }: { s: DomainState; layout: GreenhouseLayout }) {
  const leaves = useRef<THREE.InstancedMesh>(null),
    stems = useRef<THREE.InstancedMesh>(null),
    fruits = useRef<THREE.InstancedMesh>(null),
    tomatoes = useRef<THREE.InstancedMesh>(null),
    pots = useRef<THREE.InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  const leafGeometry = useMemo(createLeafGeometry, []),
    pepperGeometry = useMemo(createPepperGeometry, []);
  useEffect(
    () => () => {
      leafGeometry.dispose();
      pepperGeometry.dispose();
    },
    [leafGeometry, pepperGeometry],
  );
  const signature = JSON.stringify(s.zones.map((z) => cropAppearance(s, z)));
  useLayoutEffect(() => {
    if (!leaves.current || !stems.current || !fruits.current || !tomatoes.current || !pots.current)
      return;
    const plots: CropAppearance[] = JSON.parse(signature);
    populateBotanicalMeshes(
      {
        leaves: leaves.current,
        stems: stems.current,
        fruits: fruits.current,
        tomatoes: tomatoes.current,
        pots: pots.current,
      },
      layout,
      plots,
    );
    invalidate();
  }, [layout, signature, invalidate]);
  return (
    <group name={'Crop from active batch'}>
      <instancedMesh ref={stems} args={[undefined, undefined, botanicalCapacity.stems]}>
        <cylinderGeometry args={[0.7, 1, 1, 5]} />
        <meshStandardMaterial color="#527138" roughness={0.95} />
      </instancedMesh>
      <instancedMesh
        ref={leaves}
        args={[undefined, undefined, botanicalCapacity.leaves]}
        castShadow
        receiveShadow
      >
        <primitive object={leafGeometry} attach="geometry" />
        <meshStandardMaterial roughness={0.8} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh
        ref={fruits}
        args={[undefined, undefined, botanicalCapacity.fruits]}
        castShadow
      >
        <primitive object={pepperGeometry} attach="geometry" />
        <meshStandardMaterial roughness={0.37} />
      </instancedMesh>
      <instancedMesh
        ref={tomatoes}
        args={[undefined, undefined, botanicalCapacity.tomatoes]}
        castShadow
      >
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial roughness={0.42} />
      </instancedMesh>
      <instancedMesh
        ref={pots}
        args={[undefined, undefined, botanicalCapacity.pots]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 0.8, 1, 10]} />
        <meshStandardMaterial color="#343f36" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
