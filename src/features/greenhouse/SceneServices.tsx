import React, { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { DomainState } from '../../domain/types';
import { energyConfig } from '../../domain/energy';
import { Beam, Solid } from './SceneArchitecture';
import { serviceAssets, serviceLayout, type ServiceId } from './serviceModel';
import type { GreenhouseLayout } from './spatialModel';

function PanelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#182f40';
    ctx.fillRect(0, 0, 256, 384);
    for (let col = 0; col < 6; col++)
      for (let row = 0; row < 10; row++) {
        const x = 5 + col * 41,
          y = 5 + row * 37.5;
        ctx.fillStyle = (col + row) % 3 === 0 ? '#274a62' : '#24445b';
        ctx.fillRect(x, y, 39, 35);
        ctx.strokeStyle = '#7295a7';
        ctx.lineWidth = 0.6;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 8 * i, y + 1);
          ctx.lineTo(x + 8 * i, y + 34);
          ctx.stroke();
        }
      }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function SolarCanopy({ s }: { s: DomainState }) {
  const config = energyConfig(s),
    cols = config.panelCount > 4 ? 3 : 2,
    rows = Math.ceil(config.panelCount / cols);
  const width = cols * 1.12 + 0.12,
    depth = rows * 1.29 + 0.12,
    z = -4.2 + depth / 2 + 0.22;
  const texture = useMemo(PanelTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group name={'Service canopy with photovoltaic modules'}>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((front) => (
          <Beam
            key={`${x}-${front}`}
            a={[x * (width / 2 - 0.15), 0.02, z + front * (depth / 2 - 0.1)]}
            b={[x * (width / 2 - 0.15), 2.72 - front * 0.13, z + front * (depth / 2 - 0.1)]}
            r={0.045}
            color="#8d9e94"
          />
        )),
      )}
      <group position={[0, 2.76, z]} rotation={[-0.08, 0, 0]}>
        {[-1, 1].map((side) => (
          <Beam
            key={side}
            a={[-width / 2, -0.05, side * (depth / 2 - 0.15)]}
            b={[width / 2, -0.05, side * (depth / 2 - 0.15)]}
            r={0.035}
          />
        ))}
        {Array.from({ length: config.panelCount }, (_, i) => (
          <group
            key={i}
            position={[
              ((i % cols) - (cols - 1) / 2) * 1.12,
              0,
              (Math.floor(i / cols) - (rows - 1) / 2) * 1.29,
            ]}
          >
            <Solid size={[1.08, 0.055, 1.25]} at={[0, 0, 0]} color="#c0cbc6" metalness={0.7} />
            <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <planeGeometry args={[1.025, 1.195]} />
              <meshStandardMaterial map={texture} roughness={0.29} metalness={0.18} />
            </mesh>
          </group>
        ))}
      </group>
      <group position={[-1.05, 0.95, z + depth / 2 - 0.1]}>
        <Solid size={[0.43, 0.66, 0.2]} at={[0, 0, 0]} color="#d9e0d6" metalness={0.15} />
        <Solid size={[0.29, 0.12, 0.025]} at={[0, 0.1, 0.12]} color="#294a3b" />
        {[-0.19, -0.12, -0.05].map((y) => (
          <Solid key={y} size={[0.28, 0.014, 0.02]} at={[0, y, 0.115]} color="#82998a" />
        ))}
        <Beam a={[0.13, -0.33, 0]} b={[0.13, -0.72, 0]} r={0.021} color="#5e7167" />
      </group>
      <Beam a={[-1.18, 2.6, z]} b={[-1.18, 0.25, z]} r={0.022} color="#53685c" />
      <Beam a={[-1.18, 0.25, z]} b={[-1.18, 0.25, 2.9]} r={0.022} color="#53685c" />
    </group>
  );
}
function WaterStation({ running }: { running: boolean }) {
  return (
    <group name={'Water tank, filter, valves, and pump'} position={[0.35, 0, 3.05]}>
      <mesh position={[0, 0.69, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.57, 1.28, 24]} />
        <meshStandardMaterial color="#739e97" roughness={0.62} />
      </mesh>
      {[0.16, 0.4, 0.68, 0.96, 1.22].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.54, 0.023, 6, 24]} />
          <meshStandardMaterial color="#517f78" roughness={0.65} />
        </mesh>
      ))}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.53, 0.54, 0.09, 24]} />
        <meshStandardMaterial color="#456f65" />
      </mesh>
      <mesh position={[0, 1.43, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.07, 16]} />
        <meshStandardMaterial color="#294e43" />
      </mesh>
      <Beam a={[-0.5, 0.18, 0]} b={[-1.07, 0.18, 0]} r={0.05} color="#4a858d" />
      <Solid size={[0.5, 0.08, 0.49]} at={[-1.04, 0.06, 0]} color="#a6b5a7" />
      <mesh position={[-1.04, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.36, 16]} />
        <meshStandardMaterial color="#355d51" metalness={0.35} roughness={0.5} />
      </mesh>
      {[-1.16, -1.1, -1.04, -0.98].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.145, 0.012, 5, 12]} />
          <meshStandardMaterial color="#789b88" />
        </mesh>
      ))}
      <Solid
        size={[0.11, 0.07, 0.13]}
        at={[-1.03, 0.43, 0]}
        color={running ? '#74a55c' : '#afbdad'}
      />
      <Beam a={[-1.35, 0.2, 0]} b={[-1.35, 0.2, -0.55]} r={0.04} color="#4a858d" />
      <Solid size={[0.16, 0.24, 0.14]} at={[-1.35, 0.28, -0.4]} color="#c1d0c3" />
      <Beam a={[-1.48, 0.47, -0.4]} b={[-1.22, 0.47, -0.4]} r={0.025} color="#326b7b" />
    </group>
  );
}
function NutrientStation() {
  return (
    <group name={'Fertigation stations A and B'} position={[0.72, 0, 1.3]}>
      <Solid size={[1.15, 0.09, 0.72]} at={[0, 0.06, 0]} color="#aebba7" />
      {[-0.29, 0.29].map((x, i) => (
        <group key={x}>
          <mesh position={[x, 0.39, 0]} castShadow>
            <cylinderGeometry args={[0.19, 0.21, 0.6, 16]} />
            <meshStandardMaterial color={i ? '#bec5a3' : '#94af9c'} roughness={0.75} />
          </mesh>
          <mesh position={[x, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
            <meshStandardMaterial color="#476448" />
          </mesh>
          <Solid size={[0.17, 0.22, 0.025]} at={[x, 0.44, 0.205]} color="#e0e6d4" />
          <Beam a={[x, 0.73, 0]} b={[x, 1.12, 0]} r={0.016} color="#4c6f59" />
          <Beam a={[x, 1.12, 0]} b={[x, 1.12, -0.4]} r={0.016} color="#4c6f59" />
        </group>
      ))}
      <Beam a={[-0.5, 0.05, -0.45]} b={[-0.5, 1.4, -0.45]} r={0.028} />
      <Beam a={[0.5, 0.05, -0.45]} b={[0.5, 1.4, -0.45]} r={0.028} />
      <Solid size={[0.99, 0.35, 0.16]} at={[0, 1.1, -0.45]} color="#c8d3c3" />
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 1.1, -0.345]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.09, 12]} />
          <meshStandardMaterial color="#4b7864" />
        </mesh>
      ))}
    </group>
  );
}
function ControllerCabinet() {
  return (
    <group name={'Controller cabinet and gateway antenna'} position={[-1.13, 0.0, 0.6]}>
      <Beam a={[0, 0.05, 0]} b={[0, 1.6, 0]} r={0.055} />
      <Solid size={[0.52, 0.7, 0.28]} at={[0, 1.08, 0]} color="#c5d3c8" metalness={0.22} />
      <Solid size={[0.3, 0.15, 0.025]} at={[-0.04, 1.22, 0.15]} color="#335b48" />
      <Solid size={[0.026, 0.13, 0.04]} at={[0.19, 1.02, 0.17]} color="#6e8277" metalness={0.5} />
      {[0.88, 0.93, 0.98].map((y) => (
        <Solid key={y} size={[0.25, 0.012, 0.024]} at={[-0.06, y, 0.15]} color="#8ba08c" />
      ))}
      <Beam a={[-0.15, 1.42, 0]} b={[-0.15, 1.85, 0]} r={0.016} color="#324b3b" />
      <Beam a={[0.15, 1.42, 0]} b={[0.15, 1.75, 0]} r={0.016} color="#324b3b" />
    </group>
  );
}
function Fan({ running, selected }: { running: boolean; selected: boolean }) {
  const blade = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.03, 0);
    shape.quadraticCurveTo(0.4, -0.1, 0.34, -0.28);
    shape.quadraticCurveTo(0.13, -0.43, 0.03, 0);
    return new THREE.ShapeGeometry(shape, 10);
  }, []);
  useEffect(() => () => blade.dispose(), [blade]);
  return (
    <group name={'Circulation fan with grille'}>
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <Solid
            size={[0.83, 0.065, 0.24]}
            at={[0, side * 0.4, 0]}
            color={selected ? '#527749' : '#aebfb0'}
            metalness={0.45}
          />
          <Solid
            size={[0.065, 0.83, 0.24]}
            at={[side * 0.4, 0, 0]}
            color={selected ? '#527749' : '#aebfb0'}
            metalness={0.45}
          />
        </React.Fragment>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.365, 0.365, 0.15, 24, 1, true]} />
        <meshStandardMaterial color="#4f695a" side={THREE.DoubleSide} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((r) => (
        <mesh key={r} rotation={[0, 0, r]} castShadow>
          <primitive attach="geometry" object={blade} />
          <meshStandardMaterial
            color="#97b29d"
            metalness={0.35}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.13, 16]} />
        <meshStandardMaterial color={running ? '#86ad64' : '#bacab5'} />
      </mesh>
      {[0.15, 0.24, 0.33].map((r) => (
        <mesh key={r} position={[0, 0, 0.16]}>
          <torusGeometry args={[r, 0.007, 4, 32]} />
          <meshStandardMaterial color="#d0dacf" metalness={0.5} />
        </mesh>
      ))}
      {[0, Math.PI / 2].map((r) => (
        <group key={r} rotation={[0, 0, r]}>
          <Beam a={[-0.36, 0, 0.165]} b={[0.36, 0, 0.165]} r={0.008} />
        </group>
      ))}
    </group>
  );
}
export function SceneServices({
  s,
  layout,
  selected,
  onSelect,
}: {
  s: DomainState;
  layout: GreenhouseLayout;
  selected: ServiceId | null;
  onSelect: (id: ServiceId) => void;
}) {
  const assets = serviceAssets(s),
    service = serviceLayout(layout),
    gl = useThree((state) => state.gl);
  const has = (id: ServiceId) => assets.find((a) => a.id === id);
  if (!assets.length) return null;
  const interactive = (id: ServiceId) => ({
    onClick: (event: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      if (event.delta <= 5) onSelect(id);
    },
    onPointerOver: () => {
      gl.domElement.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      gl.domElement.style.cursor = '';
    },
  });
  return (
    <group name={'Greenhouse infrastructure'}>
      <group position={[service.x, 0, 0]}>
        <Solid
          size={[service.width, 0.26, service.depth + 0.1]}
          at={[0, -0.18, 0]}
          color="#adb9ac"
        />
        <Solid
          size={[service.width - 0.05, 0.04, service.depth]}
          at={[0, -0.025, 0]}
          color="#d9dfd2"
        />
        {has('solar') && (
          <group {...interactive('solar')}>
            <SolarCanopy s={s} />
          </group>
        )}
        {has('water') && (
          <group {...interactive('water')}>
            <WaterStation running={has('water')!.running} />
          </group>
        )}
        {has('nutrition') && (
          <group {...interactive('nutrition')}>
            <NutrientStation />
          </group>
        )}
        {has('controller') && (
          <group {...interactive('controller')}>
            <ControllerCabinet />
          </group>
        )}
        {selected && selected !== 'climate' && has(selected) && (
          <group name={'Selected asset marker'}>
            {[-1, 1].map((side) => (
              <Beam
                key={side}
                a={[side * 1.77, 0.02, -4.18]}
                b={[side * 1.77, 0.02, 4.18]}
                r={0.025}
                color="#527749"
              />
            ))}
          </group>
        )}
      </group>
      {has('climate') && (
        <group position={[0, 2.7, -layout.depth / 2 + 0.2]} {...interactive('climate')}>
          <Fan running={has('climate')!.running} selected={selected === 'climate'} />
          <Beam a={[0, -0.45, -0.1]} b={[0, -1.2, -0.1]} r={0.025} />
        </group>
      )}
      {has('water') && (
        <group name={'Irrigation supply from service area'}>
          <Beam
            a={[service.x - 0.95, 0.18, 3.05]}
            b={[service.x - 0.95, 0.18, layout.depth / 2 + 0.4]}
            r={0.04}
            color="#4a858d"
          />
          <Beam
            a={[service.x - 0.95, 0.18, layout.depth / 2 + 0.4]}
            b={[-layout.width / 2 - 0.32, 0.18, layout.depth / 2 + 0.4]}
            r={0.04}
            color="#4a858d"
          />
          <Beam
            a={[-layout.width / 2 - 0.32, 0.18, layout.depth / 2 + 0.4]}
            b={[-layout.width / 2 - 0.32, 0.18, layout.depth / 2 - 0.3]}
            r={0.04}
            color="#4a858d"
          />
        </group>
      )}
    </group>
  );
}
