import React, { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { DomainState, ZoneId } from '../../domain/types';
import type { GreenhouseLayout } from './spatialModel';
import { serviceAssets, type ServiceId } from './serviceModel';
import { visibleZoneLabels } from './sceneGeometry';
import { assetAnchor, projectAssetLabels, type AssetProjection } from './assetAnnotations';
import { AssetPin } from './AssetPin';

export function AssetAnnotations({
  s,
  layout,
  selectedZone,
  selected,
  onSelect,
  onFocus,
  onNavigate,
}: {
  s: DomainState;
  layout: GreenhouseLayout;
  selectedZone: ZoneId;
  selected: ServiceId | null;
  onSelect: (id: ServiceId | null) => void;
  onFocus: () => void;
  onNavigate?: (url: string) => void;
}) {
  const assets = serviceAssets(s),
    signature = useRef('');
  const lastSelected = useRef<ServiceId | null>(null);
  const [labels, setLabels] = useState<AssetProjection[]>([]);
  useFrame(({ camera, size }) => {
    if (selected) lastSelected.current = selected;
    camera.updateMatrixWorld(true);
    const zones = visibleZoneLabels(
      camera,
      layout,
      size.width,
      size.height,
      s.zones.findIndex((z) => z.id === selectedZone),
    );
    const next = projectAssetLabels(
      camera,
      layout,
      size.width,
      size.height,
      assets.map((a) => a.id),
      selected ?? lastSelected.current,
      zones,
    );
    const key = JSON.stringify(next, (_key, value) =>
      typeof value === 'number' ? Math.round(value) : value,
    );
    if (key !== signature.current) {
      signature.current = key;
      setLabels(next);
    }
  });
  return (
    <>
      {labels.map((label) => {
        const asset = assets.find((a) => a.id === label.id);
        if (!asset) return null;
        const device = s.devices.find((d) => d.id === asset.deviceIds[0]);
        const zones = s.zones.filter((z) => device?.zones.includes(z.id)).map((z) => z.name);
        const routine = s.routines.find((r) =>
          r.version.requiredDevices.some((id) => asset.deviceIds.includes(id)),
        );
        return (
          <Html
            key={asset.id}
            position={assetAnchor(layout, asset.id)}
            zIndexRange={selected === asset.id ? [8, 7] : [6, 5]}
            style={{ width: 0, height: 0 }}
          >
            <AssetPin
              asset={asset}
              projection={label}
              selected={selected === asset.id}
              zones={zones}
              onSelect={onSelect}
              onFocus={onFocus}
              onNavigate={onNavigate}
              operationsUrl={
                routine
                  ? `/greenhouse?tab=operations&routine=${encodeURIComponent(routine.id)}`
                  : undefined
              }
            />
          </Html>
        );
      })}
    </>
  );
}
