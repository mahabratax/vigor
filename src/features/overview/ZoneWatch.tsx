import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { Icon } from '../../components/ui';
import { clockTime, number } from '../../domain/format';
import { availableDevices, sensorValue } from '../../domain/scheduler';
import { kpis, zoneStatus } from '../../domain/selectors';

/** A monitoring register for real demo zones, not a plant-health score or a second floor plan. */
export function ZoneWatch({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    k = kpis(s),
    devices = availableDevices(s);
  return (
    <section className="zone-watch" data-tour="zone-monitoring" aria-labelledby="zone-watch-title">
      <div className="zone-watch-heading">
        <div className="crop-identity">
          <span className="crop-symbol">
            <Icon name="greenhouse" size={28} />
          </span>
          <div>
            <h2 id="zone-watch-title">{displayLabel(s.cycle.crop)}</h2>
            <p>
              {displayLabel(s.cycle.phase)}
              <span>{s.cycle.plants} plants</span>
            </p>
          </div>
        </div>
        <div className="watch-context">
          <span>Zone monitoring</span>
          <strong>
            {k.coverage} of {s.zones.length} validated zones
          </strong>
        </div>
      </div>
      <div className="growing-beds">
        {s.zones.map((zone) => {
          const status = zoneStatus(s, zone.id),
            sensor = devices.find(
              (d) => d.capabilities.includes('temperature') && d.zones.includes(zone.id),
            );
          const usable =
            zone.status !== 'inactive' &&
            zone.validated &&
            sensor?.calibrated &&
            sensor.connection === 'online';
          const temperature = usable ? sensorValue(s, sensor.id) : null;
          const humidity = usable ? sensorValue(s, sensor.id, 'humidity') : null;
          const camera = devices.find((d) => d.type === 'camera' && d.zones.includes(zone.id));
          return (
            <button
              key={zone.id}
              className={`growing-bed ${status.tone}`}
              onClick={() => ctx.nav(`/greenhouse?zone=${zone.id}`)}
              aria-label={`Open Zone ${zone.id}: ${displayLabel(status.label)}`}
            >
              <span className="bed-heading">
                <strong>Zone {displayLabel(zone.id)}</strong>
                <span className="bed-status-dot" />
              </span>
              <span className="bed-label">Air temperature</span>
              <span className="bed-reading">
                {displayLabel(temperature === null ? '—' : number(temperature, 1))}
                <small>{displayLabel(temperature === null ? 'Invalid data' : '°C')}</small>
              </span>
              <span className="bed-humidity">
                {displayLabel(humidity === null ? 'RH unavailable' : `${number(humidity)}% RH`)}
              </span>
              <span className="bed-camera">
                <Icon name="camera" size={13} />
                {displayLabel(
                  !camera
                    ? 'No camera registered'
                    : camera.connection === 'online'
                      ? 'Cameras online'
                      : camera?.connection === 'stale'
                        ? 'Camera data delayed'
                        : 'Camera offline',
                )}
              </span>
              <span className="bed-status">{displayLabel(status.label)}</span>
            </button>
          );
        })}
      </div>
      <div className="watch-summary">
        <button onClick={() => ctx.nav('/hama?status=inspection')}>
          <Icon name="bug" size={16} />
          <strong>{k.inspection}</strong> pending inspections
        </button>
        <button onClick={() => ctx.nav('/perangkat?group=observation')}>
          <Icon name="devices" size={16} />
          <strong>
            {k.observationsOnline}/{k.observationsTotal}
          </strong>{' '}
          observation devices online
        </button>
        <button onClick={() => ctx.nav('/hama?status=closed')}>
          <Icon name="checkcircle" size={16} />
          <strong>{k.closed}</strong> cases closed this week
        </button>
        <span>Stored sensor readings</span>
      </div>
    </section>
  );
}
