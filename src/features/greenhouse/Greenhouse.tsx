import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { isPortable } from '../../components/charts';
import { CameraPreview, SensorCard } from '../../components/monitoring';
import { Alert, Badge, Button, Card, Icon, Meta, SourceTag, Tabs } from '../../components/ui';
import { GreenhouseManagement } from './GreenhouseManagement';
import { ZoneManagement } from './ZoneManagement';
import { activeBatch, zoneName } from '../../domain/zones';
import { dateLabel } from '../../domain/format';
import { zoneStatus } from '../../domain/selectors';
import type { ZoneId } from '../../domain/types';
import { SpatialView } from './SpatialView';
import { spatialLayer } from './spatialModel';
import { Energy } from './Energy';
import { Operations } from './Operations';
export { ZoneMap } from './ZoneMap';
export function ZoneDetails({ ctx, id }: { ctx: PageContext; id: ZoneId }) {
  const { s } = ctx,
    z = s.zones.find((z) => z.id === id);
  if (!z) return null;
  const st = zoneStatus(s, id),
    batch = activeBatch(s, id),
    sensor = s.devices.find(
      (d) => d.active && d.capabilities.includes('temperature') && d.zones.includes(id),
    ),
    camera = s.devices.find((d) => d.type === 'camera' && d.zones.includes(id)),
    c = s.cases.find((c) => c.zoneId === id && c.status !== 'closed');
  return (
    <div className="page-stack">
      <div className="detail-title">
        <div>
          <h2>{displayLabel(z.name)}</h2>
          <p>
            {displayLabel(
              batch
                ? `${displayLabel(batch.crop)}${batch.variety ? ` / ${batch.variety}` : ''}, ${displayLabel(batch.stage)}`
                : 'No planting batch yet',
            )}
          </p>
        </div>
        <span className="plant-detail-icon">
          <Icon name="greenhouse" size={32} />
        </span>
      </div>
      <Badge tone={st.tone} dot>
        {displayLabel(st.label)}
      </Badge>
      <Meta
        items={[
          { label: 'Planted area', value: `${z.area} m²` },
          { label: 'Recorded plants', value: `${z.plants} plants` },
          {
            label: 'Planting date',
            value: batch?.plantedOn ? dateLabel(batch.plantedOn) : 'Not recorded',
          },
          { label: 'Crop cycle', value: s.cycle.id },
        ]}
      />
      <Button icon="settings" onClick={() => ctx.nav(`/greenhouse?tab=zones&zone=${id}`)}>
        Manage zones & crops
      </Button>
      <div className="two-sensors">
        <SensorCard s={s} id={sensor?.id ?? `TH-${id}-01`} compact />
        <SensorCard s={s} id={sensor?.id ?? `TH-${id}-01`} humidity compact />
      </div>
      {camera && (
        <CameraPreview
          s={s}
          deviceId={camera.id}
          compact
          onDetails={() => ctx.nav(`/perangkat?device=${camera.id}`)}
        />
      )}
      <div className="linked-items">
        {c && (
          <button onClick={() => ctx.nav(`/hama?case=${c.id}`)}>
            <Icon name="bug" size={15} />
            {displayLabel(c.id)},{' '}
            {displayLabel(c.status === 'inspection' ? 'Inspection needed' : 'Follow-up monitoring')}
          </button>
        )}
        {id === 'E' && camera?.id === 'CAM-E-01' && (
          <button onClick={() => ctx.nav('/perangkat?device=CAM-E-01')}>
            <Icon name="wrench" size={15} />
            DEV-008, Camera E-01
          </button>
        )}
      </div>
      {!camera && (
        <Alert title={'Start zone monitoring'}>
          Add cameras and sensors to this zone.
          <Button permission="devices" small onClick={() => ctx.nav(`/perangkat?zone=${id}`)}>
            View device
          </Button>
        </Alert>
      )}
      {!z.validated && camera && (
        <Alert title={'Observation validation needed'}>
          Online devices alone are insufficient. Confirm installation and data quality.
          <Button permission="devices" small onClick={() => ctx.open('validate-zone', id)}>
            Check installation
          </Button>
        </Alert>
      )}
      <div>
        <h3>Zone routines</h3>
        {s.routines
          .filter((r) => r.version.zones.includes(id))
          .slice(0, 3)
          .map((r) => (
            <button
              className="plain-row"
              key={r.id}
              onClick={() => ctx.nav(`/otomasi?tab=routines&routine=${r.id}`)}
            >
              <span>
                {displayLabel(r.name)}
                <small>
                  {displayLabel(
                    r.status === 'Active'
                      ? 'Active'
                      : r.status === 'Paused'
                        ? 'Paused'
                        : 'Needs review',
                  )}
                </small>
              </span>
              <Icon name="chevron" size={14} />
            </button>
          ))}
        {!s.routines.some((r) => r.version.zones.includes(id)) && (
          <p className="micro muted">No actuators or routines for this zone yet.</p>
        )}
      </div>
      <Button
        className="full-width"
        icon="devices"
        onClick={() => ctx.nav(`/perangkat?zone=${id}`)}
      >
        View zone devices
      </Button>
    </div>
  );
}
export function Greenhouse(ctx: PageContext) {
  const tab = ctx.query.get('tab') ?? 'monitoring';
  const tabs = (
    <Tabs
      label={'Greenhouse sections'}
      value={tab}
      onChange={(value) => updateQuery(ctx, '/greenhouse', { tab: value, zone: undefined })}
      items={[
        { id: 'monitoring', label: 'Monitoring' },
        { id: 'operations', label: 'Operations' },
        { id: 'zones', label: 'Zones & crops' },
        { id: 'energy', label: 'Energy & solar' },
        { id: 'manage', label: 'Greenhouses' },
      ]}
    />
  );
  if (tab === 'operations')
    return (
      <div className="page-stack">
        {tabs}
        <Operations key={ctx.s.greenhouse.id} ctx={ctx} />
      </div>
    );
  if (tab === 'energy')
    return (
      <div className="page-stack">
        {tabs}
        <Energy key={ctx.s.greenhouse.id} ctx={ctx} />
      </div>
    );
  if (tab === 'manage')
    return (
      <div className="page-stack">
        {tabs}
        <GreenhouseManagement ctx={ctx} />
      </div>
    );
  if (tab === 'zones')
    return (
      <div className="page-stack">
        {tabs}
        <ZoneManagement key={ctx.s.greenhouse.id} ctx={ctx} />
      </div>
    );
  const { s } = ctx,
    selected =
      s.zones.find((z) => z.id === ctx.query.get('zone'))?.id ??
      s.zones.find((z) => z.id === 'B')?.id ??
      s.zones[0].id,
    layer = spatialLayer(ctx.query.get('layer')),
    view =
      ctx.query.get('view') ??
      (ctx.mobile || isPortable() || s.greenhouse.source === 'custom' ? '2d' : '3d');
  const select = (id: ZoneId) => {
    updateQuery(ctx, '/greenhouse', { zone: id });
    if (ctx.mobile) ctx.open('zone-detail', id);
  };
  return (
    <div className="page-stack">
      {tabs}
      {!s.devices.length && (
        <Alert tone="blue" title={'Greenhouse ready for setup'}>
          Add devices, then validate installation to set up monitoring.
          <Button permission="devices" small onClick={() => ctx.nav('/perangkat')}>
            Add device
          </Button>
        </Alert>
      )}
      <div className="farm-summary card">
        <div>
          <span className="big-soft-icon">
            <Icon name="greenhouse" size={27} />
          </span>
          <span>
            <strong>
              {displayLabel(s.greenhouse.location)} / {displayLabel(s.greenhouse.name)}
            </strong>
            <small>
              {displayLabel(s.cycle.crop)}, {displayLabel(s.cycle.phase.toLowerCase())}
            </small>
          </span>
        </div>
        <div>
          <Icon name="grid" />
          <span>
            <small>Total area</small>
            <strong>{s.greenhouse.area} m²</strong>
          </span>
        </div>
        <div>
          <Icon name="leaf" />
          <span>
            <small>Planted area</small>
            <strong>{s.greenhouse.plantedArea} m²</strong>
          </span>
        </div>
        <div>
          <Icon name="greenhouse" />
          <span>
            <small>Crop</small>
            <strong>{s.cycle.plants}</strong>
          </span>
        </div>
        <SourceTag>{displayLabel(s.cycle.id)}</SourceTag>
      </div>
      <div className="greenhouse-layout">
        <div className="page-stack">
          <Card
            title={'Greenhouse plan'}
            icon="layers"
            className="greenhouse-map-card"
            data-tour="greenhouse-map"
          >
            <SpatialView
              key={s.greenhouse.id}
              s={s}
              selected={selected}
              onSelect={select}
              layer={layer}
              view={view === '3d' ? '3d' : '2d'}
              onLayer={(layer) => updateQuery(ctx, '/greenhouse', { layer })}
              onView={(view) => updateQuery(ctx, '/greenhouse', { view })}
              onNavigate={ctx.nav}
            />
          </Card>
          <Card
            title={'Zone list'}
            subtitle={`${s.zones.length} zones registered in this greenhouse.`}
            tools={
              <Button small onClick={() => ctx.nav(`/greenhouse?tab=zones&zone=${selected}`)}>
                Manage {displayLabel(zoneName(s, selected))}
              </Button>
            }
          >
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Crop</th>
                    <th>Monitoring</th>
                    <th>Observation devices</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {s.zones.map((z) => {
                    const st = zoneStatus(s, z.id);
                    return (
                      <tr className={selected === z.id ? 'selected' : ''} key={z.id}>
                        <td>
                          <button className="text-link" onClick={() => select(z.id)}>
                            {displayLabel(z.name)}
                          </button>
                        </td>
                        <td>
                          {z.plants}, {z.area} m²
                        </td>
                        <td>
                          <Badge tone={st.tone} dot>
                            {displayLabel(st.label)}
                          </Badge>
                        </td>
                        <td>
                          {
                            s.devices.filter(
                              (d) =>
                                d.zones.includes(z.id) &&
                                ['camera', 'sensor'].includes(d.type) &&
                                d.connection === 'online',
                            ).length
                          }{' '}
                          / 2 online
                        </td>
                        <td>
                          <Button
                            small
                            tone="ghost"
                            icon="chevron"
                            ariaLabel={`Zone details ${z.id}`}
                            onClick={() => select(z.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <Card className="inspector desktop-detail">
          <ZoneDetails ctx={ctx} id={selected} />
        </Card>
      </div>
    </div>
  );
}
