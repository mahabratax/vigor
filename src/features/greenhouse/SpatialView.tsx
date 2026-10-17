import { displayLabel } from '../../i18n/display';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Icon, Select } from '../../components/ui';
import { isPortable } from '../../components/charts';
import { number } from '../../domain/format';
import type { DomainState, ZoneId } from '../../domain/types';
import {
  layerLegend,
  layers,
  spatialColors,
  zoneVisual,
  type CameraCommand,
  type CameraMode,
  type SpatialLayer,
  type SpatialTone,
} from './spatialModel';
import { ZoneMap } from './ZoneMap';
import { serviceAssets, type ServiceId } from './serviceModel';
import { ServiceDetails } from './ServiceDetails';
import { FarmObject } from '../../components/FarmObject';

export class SceneBoundary extends React.Component<
  { children: React.ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function SpatialView({
  s,
  selected,
  onSelect,
  layer,
  view,
  onLayer,
  onView,
  onNavigate,
}: {
  s: DomainState;
  selected: ZoneId;
  onSelect: (id: ZoneId) => void;
  layer: SpatialLayer;
  view: '2d' | '3d';
  onLayer: (layer: SpatialLayer) => void;
  onView: (view: '2d' | '3d') => void;
  onNavigate?: (url: string) => void;
}) {
  const [failed, setFailed] = useState(false),
    [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState<CameraMode>('isometric'),
    [structure, setStructure] = useState(true),
    [devices, setDevices] = useState(true);
  const [command, setCommand] = useState<CameraCommand>({ action: 'fit', sequence: 0 });
  const [selectedAsset, setSelectedAsset] = useState<ServiceId | null>(null);
  const assets = devices ? serviceAssets(s) : [];
  const asset = assets.find((a) => a.id === selectedAsset);
  const Scene = useMemo(() => React.lazy(() => import('./Scene')), [attempt]);
  const unavailable = useCallback(() => setFailed(true), []);
  const show3D = view === '3d' && !failed && !isPortable();
  const z = s.zones.find((zone) => zone.id === selected) ?? s.zones[0],
    visual = zoneVisual(s, z, layer);
  const changeView = (next: '2d' | '3d') => {
    if (next === '3d') {
      setFailed(false);
      if (failed) setAttempt((n) => n + 1);
    }
    onView(next);
  };
  const camera = (action: CameraCommand['action']) =>
    setCommand((previous) => ({ action, sequence: previous.sequence + 1 }));
  const selectZone = (id: ZoneId) => {
    setSelectedAsset(null);
    onSelect(id);
  };
  return (
    <div className="spatial-view">
      <div className="spatial-toolbar">
        <div className="layer-pills" role="group" aria-label={'Plan layer'}>
          {layers.map((item) => (
            <button
              type="button"
              key={item.id}
              className={layer === item.id ? 'active' : ''}
              aria-pressed={layer === item.id}
              onClick={() => onLayer(item.id)}
            >
              <Icon name={item.icon} size={14} />
              {displayLabel(item.label)}
            </button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label={'Plan type'}>
          <button
            type="button"
            className={!show3D ? 'active' : ''}
            aria-pressed={!show3D}
            onClick={() => changeView('2d')}
          >
            2D
          </button>
          <button
            type="button"
            className={show3D ? 'active' : ''}
            aria-pressed={show3D}
            onClick={() => changeView('3d')}
          >
            3D
          </button>
        </div>
      </div>
      {failed && (
        <Alert tone="blue" title={'3D view unavailable'}>
          The 2D plan remains available. Retry 3D or check your browser's graphics support.
          <Button small onClick={() => changeView('3d')}>
            Retry 3D
          </Button>
        </Alert>
      )}
      {view === '3d' && isPortable() && (
        <Alert tone="blue">The portable version uses a 2D plan. Open the Vigor Site for 3D.</Alert>
      )}
      {show3D ? (
        <>
          <div className="scene-controls" aria-label={'3D model controls'}>
            <div className="segmented" role="group" aria-label={'View angle'}>
              <button
                type="button"
                aria-pressed={mode === 'isometric'}
                className={mode === 'isometric' ? 'active' : ''}
                onClick={() => setMode('isometric')}
              >
                Isometric
              </button>
              <button
                type="button"
                aria-pressed={mode === 'top'}
                className={mode === 'top' ? 'active' : ''}
                onClick={() => setMode('top')}
              >
                Top view
              </button>
            </div>
            <label className="scene-structure">
              <input
                type="checkbox"
                checked={structure}
                onChange={(event) => setStructure(event.target.checked)}
              />
              Frame
            </label>
            <div className="scene-zoom">
              <button type="button" aria-label={'Zoom out'} onClick={() => camera('out')}>
                −
              </button>
              <button type="button" aria-label={'Zoom in'} onClick={() => camera('in')}>
                +
              </button>
              <Button small icon="eye" onClick={() => camera('focus')}>
                Focus zone
              </Button>
              {asset && (
                <Button small icon="eye" onClick={() => camera('focus_asset')}>
                  Focus asset
                </Button>
              )}
              <Button small icon="fullscreen" onClick={() => camera('fit')}>
                Fit view
              </Button>
            </div>
          </div>
          <SceneBoundary key={attempt} onFailure={unavailable}>
            <React.Suspense
              fallback={
                <div className="scene-loading" role="status">
                  <span className="loader" />
                  Loading greenhouse model…
                </div>
              }
            >
              <Scene
                s={s}
                selected={z.id}
                onSelect={selectZone}
                layer={layer}
                mode={mode}
                command={command}
                structure={structure}
                devices={devices}
                selectedAsset={selectedAsset}
                onSelectAsset={setSelectedAsset}
                onFocusAsset={() => camera('focus_asset')}
                onNavigate={onNavigate}
                onUnavailable={unavailable}
              />
            </React.Suspense>
          </SceneBoundary>
        </>
      ) : (
        <ZoneMap
          s={s}
          selected={z.id}
          onSelect={selectZone}
          layer={layer}
          devices={devices}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
        />
      )}
      {show3D && !!assets.length && (
        <div className="service-selector" role="group" aria-label={'Select a service asset'}>
          {assets.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={a.id === selectedAsset}
              onClick={() => setSelectedAsset(a.id)}
            >
              <FarmObject name={a.id} />
              {displayLabel(a.title)}
            </button>
          ))}
          {onNavigate && (
            <button
              type="button"
              className="service-energy-link"
              onClick={() => onNavigate('/greenhouse?tab=energy')}
            >
              Energy & solar
              <Icon name="chevron" size={14} />
            </button>
          )}
        </div>
      )}
      {asset && (
        <ServiceDetails
          s={s}
          asset={asset}
          onNavigate={onNavigate}
          onClose={() => setSelectedAsset(null)}
        />
      )}
      <div className="spatial-selection">
        <Select
          label={'Plan zones'}
          value={z.id}
          onChange={selectZone}
          options={s.zones.map((zone) => ({ value: zone.id, label: zone.name }))}
        />
        <div className="spatial-selection-copy">
          <strong>{displayLabel(visual.crop)}</strong>
          <span>
            {displayLabel(number(z.plants))} plants / {displayLabel(number(z.area, 2))} m²
          </span>
        </div>
        <span className={`spatial-status tone-${visual.tone}`}>
          <i />
          {displayLabel(visual.label)}
        </span>
      </div>
      <div className="spatial-map-footer">
        <label className="scene-structure">
          <input
            type="checkbox"
            checked={devices}
            onChange={(event) => setDevices(event.target.checked)}
          />
          Devices
        </label>
        <div
          className="spatial-legend"
          aria-label={`Legend ${displayLabel(layers.find((item) => item.id === layer)!.label)}`}
        >
          {layerLegend(layer).map((item) => (
            <span key={item.label}>
              <i style={{ background: spatialColors[item.tone as SpatialTone].mark }} />
              {displayLabel(item.label)}
            </span>
          ))}
        </div>
      </div>
      <p className="spatial-note">
        {displayLabel(
          show3D
            ? mode === 'top'
              ? 'Drag to move the plan, pinch to zoom, and select a bed or zone label.'
              : 'Drag to rotate, pinch to zoom, and select a bed or zone label.'
            : 'Select a bed for zone details. Drag within the plan if zones extend beyond the screen.',
        )}{' '}
        {displayLabel(
          layer === 'temperature'
            ? '30 °C is a sample indicator, not a crop recommendation.'
            : 'Positions and plants are illustrative, not construction-scale drawings.',
        )}
      </p>
    </div>
  );
}
