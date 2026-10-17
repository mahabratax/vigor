import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { DomainState, Zone } from '../../domain/types';
import { availableDevices } from '../../domain/scheduler';
import { deviceRunning } from './serviceModel';
import { cropAppearance } from './botanicalModel';
import { zoneVisual, type GreenhouseLayout, type SpatialLayer } from './spatialModel';

type Point = [number, number, number];
const metal = '#b2beb7';
export function Beam({
  a,
  b,
  r = 0.028,
  color = metal,
}: {
  a: Point;
  b: Point;
  r?: number;
  color?: string;
}) {
  const start = new THREE.Vector3(...a),
    end = new THREE.Vector3(...b),
    delta = end.clone().sub(start);
  const length = delta.length(),
    quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
  return (
    <mesh position={start.add(end).multiplyScalar(0.5)} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[r, r, length, 6]} />
      <meshStandardMaterial color={color} metalness={0.45} roughness={0.46} />
    </mesh>
  );
}
export function Solid({
  size,
  at,
  color,
  metalness = 0,
}: {
  size: Point;
  at: Point;
  color: string;
  metalness?: number;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={metalness ? 0.46 : 0.9}
        metalness={metalness}
      />
    </mesh>
  );
}
export function Foundation({ layout }: { layout: GreenhouseLayout }) {
  return (
    <group name={'Foundation and service paths'}>
      <Solid
        size={[layout.width + 1.4, 0.32, layout.depth + 1.3]}
        at={[0, -0.22, 0]}
        color="#aeb7a9"
      />
      <mesh position={[0, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[layout.width + 1.35, layout.depth + 1.25]} />
        <meshStandardMaterial color="#d9dfd8" roughness={1} />
      </mesh>
      {layout.aisles.map((x) => (
        <group key={x}>
          <Solid size={[0.77, 0.035, layout.depth]} at={[x, -0.015, 0]} color="#e6e9e0" />
          {Array.from({ length: layout.rows * 3 }, (_, i) => (
            <Solid
              key={i}
              size={[0.77, 0.012, 0.018]}
              at={[
                x,
                0.008,
                -layout.depth / 2 + 0.45 + (i * (layout.depth - 0.6)) / (layout.rows * 3),
              ]}
              color="#b4c0b6"
            />
          ))}
        </group>
      ))}
      <Solid size={[1.45, 0.06, 0.65]} at={[0, -0.015, layout.depth / 2 + 0.26]} color="#e6e9e0" />
    </group>
  );
}
export function Structure({ layout }: { layout: GreenhouseLayout }) {
  const half = layout.depth / 2,
    edge = layout.width / 2;
  const bow = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-edge, 0.06, 0),
        new THREE.Vector3(-edge, 2.2, 0),
        new THREE.Vector3(-edge * 0.72, 3.1, 0),
        new THREE.Vector3(0, 3.75, 0),
        new THREE.Vector3(edge * 0.72, 3.1, 0),
        new THREE.Vector3(edge, 2.2, 0),
        new THREE.Vector3(edge, 0.06, 0),
      ]),
    [edge],
  );
  const skin = useMemo(() => {
    const points: number[] = [],
      indices: number[] = [];
    // Only a rear band of the cover is retained, exposing the cultivation space.
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-edge, 2.2, 0),
      new THREE.Vector3(-edge * 0.72, 3.1, 0),
      new THREE.Vector3(0, 3.75, 0),
      new THREE.Vector3(edge * 0.72, 3.1, 0),
      new THREE.Vector3(edge, 2.2, 0),
    ]);
    for (let i = 0; i <= 24; i++) {
      const p = curve.getPoint(i / 24);
      points.push(p.x, p.y, -half, p.x, p.y, -half + Math.min(1.15, layout.depth * 0.18));
      if (i < 24) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [edge, half, layout.depth]);
  useEffect(() => () => skin.dispose(), [skin]);
  return (
    <group name={'Galvanized frame and partial covering'}>
      {Array.from(
        { length: layout.rows + 1 },
        (_, i) => -half + (i * layout.depth) / layout.rows,
      ).map((z) => (
        <mesh key={z} position={[0, 0, z]} castShadow>
          <tubeGeometry args={[bow, 36, 0.032, 6, false]} />
          <meshStandardMaterial color={metal} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {[-edge, edge].map((x) => (
        <group key={x}>
          <Beam a={[x, 0.08, -half]} b={[x, 0.08, half]} r={0.045} />
          <Beam a={[x, 2.2, -half]} b={[x, 2.2, half]} />
          <Beam
            a={[x, 0.08, -half]}
            b={[x, 2.2, -half + Math.min(2, layout.depth / 2)]}
            r={0.016}
          />
          <mesh position={[x, 0.65, -half + layout.depth * 0.22]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[layout.depth * 0.44, 1.15]} />
            <meshStandardMaterial
              color="#d3e3d9"
              transparent
              opacity={0.23}
              depthWrite={false}
              side={THREE.DoubleSide}
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}
      <Beam a={[0, 3.75, -half]} b={[0, 3.75, half]} />
      {[-1, 1].map((side) => (
        <Beam
          key={side}
          a={[edge * 0.72 * side, 3.1, -half]}
          b={[edge * 0.72 * side, 3.1, half]}
          r={0.02}
        />
      ))}
      <mesh>
        <primitive object={skin} attach="geometry" />
        <meshStandardMaterial
          color="#e4efe8"
          transparent
          opacity={0.28}
          depthWrite={false}
          side={THREE.DoubleSide}
          roughness={0.52}
        />
      </mesh>
      <Beam a={[-0.65, 0.05, half]} b={[-0.65, 2.2, half]} r={0.035} />
      <Beam a={[0.65, 0.05, half]} b={[0.65, 2.2, half]} r={0.035} />
      <Beam a={[-0.65, 2.2, half]} b={[0.65, 2.2, half]} r={0.035} />
    </group>
  );
}
export function BedFurniture({
  s,
  zone,
  chosen,
  layer,
  devices,
}: {
  s: DomainState;
  zone: Zone;
  chosen: boolean;
  layer: SpatialLayer;
  devices: boolean;
}) {
  const crop = cropAppearance(s, zone),
    visual = zoneVisual(s, zone, layer);
  const camera =
    devices && s.devices.find((d) => d.active && d.type === 'camera' && d.zones.includes(zone.id));
  const sensor =
    devices && s.devices.find((d) => d.active && d.type === 'sensor' && d.zones.includes(zone.id));
  return (
    <group>
      <Solid size={[3.6, 0.12, 2.65]} at={[0, 0.04, 0]} color="#9ca996" />
      <Solid
        size={[3.44, 0.16, 2.29]}
        at={[0, 0.17, 0]}
        color={crop.bed === 'soil' ? '#51483b' : '#c7d0c3'}
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Solid
            size={[0.055, 0.26, 2.65]}
            at={[side * 1.78, 0.17, 0]}
            color={chosen ? '#204b35' : '#a9b6a8'}
            metalness={0.25}
          />
          <Solid
            size={[3.6, 0.26, 0.055]}
            at={[0, 0.17, side * 1.3]}
            color={chosen ? '#204b35' : '#a9b6a8'}
            metalness={0.25}
          />
        </group>
      ))}
      <Solid size={[0.74, 0.13, 0.07]} at={[-1.26, 0.34, 1.34]} color={visual.mark} />
      {[-0.77, 0, 0.77].map((z) =>
        crop.bed === 'channels' ? (
          <group key={z}>
            <Solid size={[3.3, 0.12, 0.25]} at={[0, 0.51, z]} color="#e9eee5" />
            {[-1.3, 1.3].map((x) => (
              <Solid
                key={x}
                size={[0.045, 0.35, 0.06]}
                at={[x, 0.3, z]}
                color={metal}
                metalness={0.4}
              />
            ))}
          </group>
        ) : (
          <Beam key={z} a={[-1.66, 0.28, z]} b={[1.66, 0.28, z]} r={0.018} color="#344b43" />
        ),
      )}
      {(camera || sensor) && <Beam a={[1.6, 0.25, -1.08]} b={[1.6, 2, -1.08]} r={0.026} />}
      {camera && (
        <group position={[1.6, 2.02, -0.99]} rotation={[0.18, -0.4, 0]}>
          <Solid size={[0.25, 0.16, 0.31]} at={[0, 0, 0]} color="#e8eee6" />
          <Solid size={[0.31, 0.025, 0.39]} at={[0, 0.1, 0.02]} color="#bdc9bf" />
          <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.045, 12]} />
            <meshStandardMaterial color="#263f38" roughness={0.28} />
          </mesh>
          <mesh position={[0.09, -0.045, 0.16]}>
            <sphereGeometry args={[0.018, 6, 4]} />
            <meshBasicMaterial color={camera.connection === 'online' ? '#7fab64' : '#c3924b'} />
          </mesh>
        </group>
      )}
      {sensor && (
        <group position={[1.6, 0.96, -1.08]}>
          <Solid size={[0.22, 0.3, 0.17]} at={[0, 0, 0]} color="#e5e9df" />
          {[-0.08, -0.02, 0.04, 0.1].map((y) => (
            <Solid key={y} size={[0.24, 0.018, 0.19]} at={[0, y, 0.015]} color="#b4c1b4" />
          ))}
          <Solid
            size={[0.05, 0.04, 0.01]}
            at={[0, 0.07, 0.11]}
            color={sensor.connection === 'online' ? '#4a858d' : '#b58441'}
          />
        </group>
      )}
    </group>
  );
}
export function IrrigationNetwork({ s, layout }: { s: DomainState; layout: GreenhouseLayout }) {
  const pump = availableDevices(s).find((d) => d.capabilities.includes('pump'));
  if (!pump) return null;
  const running = deviceRunning(s, pump.id);
  const x = -layout.width / 2 - 0.32,
    front = layout.depth / 2 - 0.3;
  const color = running ? '#357761' : '#4a858d';
  return (
    <group name={`Irigasi ${pump.id}`}>
      <Beam a={[x, 0.18, front]} b={[x, 0.18, -layout.depth / 2 + 0.12]} r={0.045} color={color} />
      {s.zones.map((z, i) =>
        pump.zones.includes(z.id) ? (
          <Beam
            key={z.id}
            a={[x, 0.18, layout.positions[i].z - 1.4]}
            b={[layout.positions[i].x, 0.18, layout.positions[i].z - 1.4]}
            r={0.026}
            color={color}
          />
        ) : null,
      )}
    </group>
  );
}
