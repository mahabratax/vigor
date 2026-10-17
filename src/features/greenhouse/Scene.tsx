import { displayLabel } from '../../i18n/display';
import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { DomainState, ZoneId } from '../../domain/types';
import {
  greenhouseLayout,
  zoneVisual,
  type CameraMode,
  type CameraCommand,
  type GreenhouseLayout,
  type SpatialLayer,
} from './spatialModel';
import {
  cameraPolarLimits,
  fitGreenhouseCamera,
  fitZoneCamera,
  fitAssetCamera,
  visibleZoneLabels,
} from './sceneGeometry';
import { CropCanopy } from './CropCanopy';
import { Foundation, Structure, BedFurniture, IrrigationNetwork } from './SceneArchitecture';
import { SceneServices } from './SceneServices';
import { serviceAssets, type ServiceId } from './serviceModel';
import { AssetAnnotations } from './AssetAnnotationsOverlay';
export interface SceneProps {
  s: DomainState;
  selected: ZoneId;
  onSelect: (id: ZoneId) => void;
  layer: SpatialLayer;
  mode: CameraMode;
  command: CameraCommand;
  structure: boolean;
  devices: boolean;
  onUnavailable: () => void;
  selectedAsset: ServiceId | null;
  onSelectAsset: (id: ServiceId | null) => void;
  onFocusAsset: () => void;
  onNavigate?: (url: string) => void;
}
function CameraRig({
  layout,
  mode,
  command,
  selectedIndex,
  onUnavailable,
  services,
  selectedAsset,
}: Pick<SceneProps, 'mode' | 'command' | 'onUnavailable' | 'selectedAsset'> & {
  layout: GreenhouseLayout;
  selectedIndex: number;
  services: boolean;
}) {
  const { camera, size, invalidate, gl } = useThree();
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const fit = useRef({ minZoom: 0.1, maxZoom: 100 });
  const fitView = useCallback(() => {
    if (!(camera instanceof THREE.OrthographicCamera) || !size.width || !size.height) return;
    const result = fitGreenhouseCamera(camera, layout, size.width, size.height, mode, services);
    fit.current = result;
    if (controls.current) {
      controls.current.target.copy(result.target);
      controls.current.minZoom = result.minZoom;
      controls.current.maxZoom = result.maxZoom;
      controls.current.update();
    }
    invalidate();
  }, [camera, layout, mode, size.width, size.height, invalidate, services]);
  useLayoutEffect(fitView, [fitView]);
  const appliedCommand = useRef(command.sequence);
  useLayoutEffect(() => {
    if (
      !(camera instanceof THREE.OrthographicCamera) ||
      appliedCommand.current === command.sequence
    )
      return;
    appliedCommand.current = command.sequence;
    if (command.action === 'focus' || (command.action === 'focus_asset' && selectedAsset)) {
      const result =
        command.action === 'focus_asset' && selectedAsset
          ? fitAssetCamera(camera, layout, selectedAsset, size.width, size.height, mode)
          : fitZoneCamera(camera, layout, selectedIndex, size.width, size.height, mode);
      fit.current = result;
      if (controls.current) {
        controls.current.target.copy(result.target);
        controls.current.minZoom = result.minZoom;
        controls.current.maxZoom = result.maxZoom;
        controls.current.update();
      }
      invalidate();
      return;
    }
    if (command.action === 'fit') {
      fitView();
      return;
    }
    camera.zoom = THREE.MathUtils.clamp(
      camera.zoom * (command.action === 'in' ? 1.25 : 0.8),
      fit.current.minZoom,
      fit.current.maxZoom,
    );
    camera.updateProjectionMatrix();
    invalidate();
  }, [
    camera,
    command,
    fitView,
    invalidate,
    layout,
    selectedIndex,
    selectedAsset,
    size.width,
    size.height,
    mode,
  ]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onUnavailable]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan
      enableDamping={false}
      enableRotate={mode !== 'top'}
      mouseButtons={{
        LEFT: mode === 'top' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: mode === 'top' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      {...cameraPolarLimits(mode)}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      minZoom={0.1}
      maxZoom={100}
    />
  );
}
function ZoneLabels({
  s,
  layout,
  selected,
  onSelect,
  layer,
}: Pick<SceneProps, 's' | 'selected' | 'onSelect' | 'layer'> & { layout: GreenhouseLayout }) {
  const selectedIndex = s.zones.findIndex((z) => z.id === selected);
  const [visible, setVisible] = useState<number[]>([Math.max(0, selectedIndex)]);
  const signature = useRef('');
  useFrame(({ camera, size }) => {
    camera.updateMatrixWorld(true);
    const next = visibleZoneLabels(camera, layout, size.width, size.height, selectedIndex).map(
      (marker) => marker.index,
    );
    const key = next.join(',');
    if (key !== signature.current) {
      signature.current = key;
      setVisible(next);
    }
  });
  return (
    <>
      {visible.map((index) => {
        const z = s.zones[index],
          position = layout.positions[index];
        if (!z || !position) return null;
        const visual = zoneVisual(s, z, layer),
          chosen = z.id === selected;
        return (
          <Html key={z.id} center position={[position.x, 2.05, position.z]} zIndexRange={[2, 1]}>
            <button
              type="button"
              className={`scene-zone-label ${chosen ? 'selected' : ''}`}
              aria-pressed={chosen}
              aria-label={`${displayLabel(z.name)}: ${displayLabel(visual.label)}`}
              title={`${displayLabel(z.name)} / ${displayLabel(visual.label)}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(z.id);
              }}
            >
              <i style={{ background: visual.mark }} />
              {displayLabel(z.id)}
            </button>
          </Html>
        );
      })}
    </>
  );
}
function Model({
  s,
  selected,
  onSelect,
  layer,
  mode,
  command,
  structure,
  devices,
  onUnavailable,
  selectedAsset,
  onSelectAsset,
  onFocusAsset,
  onNavigate,
}: SceneProps) {
  const layout = useMemo(() => greenhouseLayout(s.zones.length), [s.zones.length]);
  const gl = useThree((state) => state.gl);
  const services = devices && serviceAssets(s).length > 0;
  const span = Math.max(layout.width + (services ? 4.6 : 0), layout.depth, services ? 8.4 : 0) + 3;
  const selectedIndex = s.zones.findIndex((z) => z.id === selected);
  return (
    <>
      <color attach="background" args={['#eef3ef']} />
      <CameraRig
        layout={layout}
        selectedIndex={selectedIndex}
        mode={mode}
        command={command}
        onUnavailable={onUnavailable}
        services={services}
        selectedAsset={selectedAsset}
      />
      <hemisphereLight args={['#eff7f4', '#7e896a', 1.3]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-span * 0.6, span, span * 0.5]}
        intensity={2.7}
        color="#fff5df"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-span * 0.7}
        shadow-camera-right={span * 0.7}
        shadow-camera-top={span * 0.7}
        shadow-camera-bottom={-span * 0.7}
        shadow-camera-near={0.5}
        shadow-camera-far={span * 4}
        shadow-bias={-0.0002}
        shadow-normalBias={0.025}
      />
      <Foundation layout={layout} />
      {s.zones.map((z, i) => {
        const point = layout.positions[i];
        return (
          <group
            key={z.id}
            position={[point.x, 0, point.z]}
            onClick={(event) => {
              event.stopPropagation();
              if (event.delta <= 5) onSelect(z.id);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              gl.domElement.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              gl.domElement.style.cursor = '';
            }}
          >
            <BedFurniture
              s={s}
              zone={z}
              chosen={z.id === selected}
              layer={layer}
              devices={devices}
            />
          </group>
        );
      })}
      <CropCanopy s={s} layout={layout} />
      <ZoneLabels s={s} layout={layout} selected={selected} layer={layer} onSelect={onSelect} />
      {devices && (
        <AssetAnnotations
          s={s}
          layout={layout}
          selectedZone={selected}
          selected={selectedAsset}
          onSelect={onSelectAsset}
          onFocus={onFocusAsset}
          onNavigate={onNavigate}
        />
      )}
      {structure && <Structure layout={layout} />}
      {devices && <IrrigationNetwork s={s} layout={layout} />}
      {devices && (
        <SceneServices s={s} layout={layout} selected={selectedAsset} onSelect={onSelectAsset} />
      )}
    </>
  );
}
export default function Scene(props: SceneProps) {
  return (
    <div className="greenhouse-scene" role="group" aria-label={'Greenhouse 3D model'}>
      <Canvas
        shadows="soft"
        orthographic
        camera={{ position: [12, 16, 18], zoom: 25, near: 0.1, far: 200 }}
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        fallback={<p>3D is not available in this browser.</p>}
        onPointerMissed={() => props.onSelectAsset(null)}
      >
        <Model {...props} />
      </Canvas>
    </div>
  );
}
