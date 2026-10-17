import { displayLabel } from '../../i18n/display';
import React, { useLayoutEffect, useRef } from 'react';
import { Icon } from '../../components/ui';
import { isActiveRun, number } from '../../domain/format';
import type { DomainState, ZoneId } from '../../domain/types';
import { greenhouseLayout, spatialLayer, zoneVisual } from './spatialModel';
import { cropAppearance } from './botanicalModel';
import { PlanBedArt } from './PlanBedArt';
import { ServicePlan } from './ServicePlan';
import { serviceAssets, type ServiceId } from './serviceModel';
import { energyConfig } from '../../domain/energy';

export function ZoneMap({
  s,
  selected,
  onSelect,
  layer = 'coverage',
  devices = true,
  selectedAsset = null,
  onSelectAsset,
}: {
  s: DomainState;
  selected: ZoneId;
  onSelect: (id: ZoneId) => void;
  layer?: string;
  devices?: boolean;
  selectedAsset?: ServiceId | null;
  onSelectAsset?: (id: ServiceId) => void;
}) {
  const layout = greenhouseLayout(s.zones.length),
    viewport = useRef<HTMLDivElement>(null);
  const chosen = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const container = viewport.current;
    if (!container) return;
    const reveal = () => {
      const target = chosen.current;
      if (!target) return;
      const c = container.getBoundingClientRect(),
        t = target.getBoundingClientRect();
      // Keep scroll local: selection and viewport changes must not move the page.
      if (t.left < c.left || t.right > c.right)
        container.scrollLeft += t.left - c.left - (c.width - t.width) / 2;
      if (t.top < c.top || t.bottom > c.bottom)
        container.scrollTop += t.top - c.top - (c.height - t.height) / 2;
    };
    reveal();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(reveal);
    observer.observe(container);
    return () => observer.disconnect();
  }, [selected, s.greenhouse.id, s.zones.length]);
  const pump = s.devices.find((d) => d.capabilities.includes('pump') && d.active);
  const running = pump && s.runs.some((r) => isActiveRun(r.status) && r.resource === pump.id);
  const assets = devices ? serviceAssets(s) : [];
  return (
    <div
      className="zone-map"
      ref={viewport}
      role="region"
      aria-label={'Greenhouse 2D plan'}
      tabIndex={0}
    >
      <div
        className="plan-building"
        data-services={assets.length > 0 && !!onSelectAsset}
        style={
          { '--plan-columns': layout.columns, '--plan-rows': layout.rows } as React.CSSProperties
        }
      >
        <div className="plan-orientation">
          <span>
            Planting plan
            <span className="plan-subtitle">
              {s.zones.length} zones / {displayLabel(number(s.greenhouse.plantedArea))} m² planted
              area
            </span>
          </span>
          <span>
            <span aria-hidden="true">↑</span> North
          </span>
        </div>
        <div className="plan-campus">
          <div className="plan-footprint" data-irrigation={!!(devices && pump)}>
            <div className="plan-beds">
              {s.zones.map((z, index) => {
                const visual = zoneVisual(s, z, spatialLayer(layer)),
                  active = z.id === selected,
                  crop = cropAppearance(s, z);
                const camera = s.devices.find(
                  (d) => d.type === 'camera' && d.active && d.zones.includes(z.id),
                );
                return (
                  <button
                    type="button"
                    key={z.id}
                    ref={active ? chosen : undefined}
                    className="map-zone"
                    aria-pressed={active}
                    aria-label={`${displayLabel(z.name)}: ${displayLabel(visual.label)}, ${number(z.plants)} plants`}
                    title={`${displayLabel(z.name)} / ${displayLabel(visual.crop)}`}
                    data-zone={z.id}
                    data-tone={visual.tone}
                    data-crop={crop.kind}
                    data-method={crop.bed}
                    onClick={() => onSelect(z.id)}
                    style={
                      {
                        gridRow: layout.positions[index].row + 1,
                        gridColumn: layout.positions[index].column + 1,
                        '--zone-fill': visual.fill,
                        '--zone-ink': visual.ink,
                        '--zone-mark': visual.mark,
                      } as React.CSSProperties
                    }
                  >
                    <span className="plan-zone-heading">
                      <span className="plan-zone-code">{displayLabel(z.id)}</span>
                      <strong>{displayLabel(z.name)}</strong>
                      {devices && camera && (
                        <span
                          className={`plan-camera ${camera.connection !== 'online' ? 'offline' : ''}`}
                          title={`${displayLabel(camera.label)}: ${camera.connection}`}
                        >
                          <Icon name="camera" size={14} />
                        </span>
                      )}
                    </span>
                    <span className="plan-bed">
                      <PlanBedArt crop={crop} />
                    </span>
                    <span className="plan-crop-name">{displayLabel(visual.crop)}</span>
                    <span className="plan-zone-facts">
                      <span>{displayLabel(number(z.plants))} plants</span>
                      <span>{displayLabel(number(z.area, 2))} m²</span>
                    </span>
                    <span className="plan-zone-status">
                      <i />
                      {displayLabel(visual.label)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="plan-service">
              <span>
                <Icon name="drop" size={15} />
                {displayLabel(
                  devices && pump
                    ? `${pump.id} / ${running ? 'Digunakan' : pump.connection === 'online' ? 'Standby' : 'Offline'}`
                    : devices
                      ? 'No pump registered'
                      : 'Service path',
                )}
              </span>
              <span className="plan-entrance">
                <Icon name="chevron" size={14} /> Greenhouse access
              </span>
            </div>
          </div>
          {!!assets.length && onSelectAsset && (
            <ServicePlan
              assets={assets}
              selected={selectedAsset}
              onSelect={onSelectAsset}
              panels={energyConfig(s).panelCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
