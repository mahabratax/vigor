import { displayLabel, matchesSearch } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { boundedPage } from '../../app/navigation';
import { CameraPreview, DeviceSymbol, SensorCard } from '../../components/monitoring';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Icon,
  SearchField,
  Select,
  Stat,
  Stats,
  Tabs,
} from '../../components/ui';
import { expenseRows } from '../../domain/costs';
import { dateLabel, money } from '../../domain/format';
import { PeriodFilter } from '../costs/PeriodFilter';
import { periodError, periodLabel, periodQuery, resolvePeriod } from '../../domain/periods';
import { availableDevices } from '../../domain/scheduler';
import type { ZoneId } from '../../domain/types';
import { DeviceDetails } from './DeviceDetails';
import { Supplies } from './Supplies';
export { DeviceDetails } from './DeviceDetails';
const types: Record<string, string> = {
  camera: 'Camera',
  sensor: 'Sensor',
  irrigation: 'Irigasi',
  nutrition: 'Nutrisi',
  environment: 'Lingkungan',
  controller: 'Controller',
};

export default function Devices({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    tab = ctx.query.get('tab') ?? 'inventory',
    scope = resolvePeriod(
      s.clock,
      ctx.query.get('period'),
      ctx.query.get('from'),
      ctx.query.get('to'),
    ),
    search = ctx.query.get('search') ?? '',
    group = ctx.query.get('group') ?? 'all',
    status = ctx.query.get('status') ?? 'all',
    zone = ctx.query.get('zone') ?? 'all';
  const devices = availableDevices(s),
    filtered = devices
      .filter(
        (d) =>
          (group === 'all' || group === 'observation'
            ? group === 'all' || ['camera', 'sensor'].includes(d.type)
            : d.type === group) &&
          (status === 'all' || d.connection === status) &&
          (zone === 'all' || d.zones.includes(zone as ZoneId)) &&
          matchesSearch(search, d.id, d.label),
      )
      .sort((a, b) =>
        a.id === 'PUMP-01' ? -1 : b.id === 'PUMP-01' ? 1 : a.id.localeCompare(b.id),
      ),
    selected = ctx.query.get('device') ?? filtered[0]?.id ?? '',
    page = boundedPage(ctx.query.get('page'), filtered.length),
    shown = filtered.slice((page - 1) * 10, page * 10),
    cameras = devices.filter(
      (d) => d.type === 'camera' && (zone === 'all' || d.zones.includes(zone as ZoneId)),
    ),
    camera =
      cameras.find((d) => d.id === ctx.query.get('camera'))?.id ??
      cameras.find((d) => d.id === 'CAM-B-02')?.id ??
      cameras[0]?.id ??
      '',
    cameraZone = cameras.find((d) => d.id === camera)?.zones[0] ?? (zone === 'all' ? 'B' : zone),
    tickets = s.maintenance.filter(
      (m) =>
        zone === 'all' ||
        s.devices.find((d) => d.id === m.deviceId)?.zones.includes(zone as ZoneId),
    );
  return (
    <div className="page-stack">
      <Tabs
        label={'Device sections'}
        items={[
          { id: 'inventory', label: 'Inventory' },
          { id: 'cameras', label: 'Cameras & sensors' },
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'supplies', label: 'Supplies' },
        ]}
        value={tab}
        onChange={(v) => updateQuery(ctx, '/perangkat', { tab: v, page: undefined })}
      />
      {tab === 'inventory' && (
        <Stats>
          <Stat
            icon="devices"
            label={'Installed devices'}
            value={devices.length}
            sub={`${devices.filter((d) => ['camera', 'sensor'].includes(d.type)).length} kamera/sensor, ${devices.filter((d) => !['camera', 'sensor'].includes(d.type)).length} other devices`}
          />
          <Stat
            icon="wifi"
            label="Online"
            value={`${devices.filter((d) => d.connection === 'online').length}/${devices.length}`}
            sub={'Status at the recorded time'}
          />
          <Stat
            icon="alert"
            tone="amber"
            label={'Needs inspection'}
            value={devices.filter((d) => d.connection !== 'online' || !d.calibrated).length}
            sub="Connection or installation checks"
          />
          <Stat
            icon="wrench"
            label={'Maintenance tasks'}
            value={s.maintenance.filter((m) => m.status !== 'completed').length}
            sub={'Awaiting operator action'}
          />
        </Stats>
      )}
      {tab === 'supplies' && <Supplies key={s.greenhouse.id} ctx={ctx} />}
      {tab !== 'supplies' && (
        <div className="filter-bar">
          {tab !== 'cameras' && (
            <SearchField
              value={search}
              onChange={(v) => updateQuery(ctx, '/perangkat', { search: v, page: undefined })}
              placeholder={
                tab === 'maintenance' ? 'Search tickets or tasks…' : 'Search device name or ID…'
              }
            />
          )}
          <Select
            label={'Device zone'}
            value={zone}
            onChange={(v) => updateQuery(ctx, '/perangkat', { zone: v, page: undefined })}
            options={[
              { value: 'all', label: 'All zones' },
              ...s.zones.map((z) => ({ value: z.id, label: z.name })),
            ]}
          />
          {tab === 'inventory' && (
            <PeriodFilter ctx={ctx} scope={scope} path="/perangkat" label="Device cost period" />
          )}
          <span className="micro muted">
            Connection status follows each device's last reading.
            {tab === 'inventory' ? ` Costs: ${periodLabel(scope)}.` : ''}
          </span>
        </div>
      )}
      {tab === 'inventory' && (
        <>
          {periodError(scope) && (
            <Alert title="Check the date range">
              {periodError(scope)} Costs are hidden until the dates are corrected.
            </Alert>
          )}
          <div className="devices-layout">
            <Card
              title={'Device inventory'}
              data-tour="device-register"
              variant="register"
              subtitle={`${filtered.length} devices match these filters`}
              tools={
                <Select
                  label={'Device type'}
                  value={group}
                  onChange={(v) => updateQuery(ctx, '/perangkat', { group: v, page: undefined })}
                  options={[
                    { value: 'all', label: 'All types' },
                    { value: 'observation', label: 'Camera & temperature/RH' },
                    ...Object.entries(types).map(([value, label]) => ({ value, label })),
                  ]}
                />
              }
            >
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Devices</th>
                      <th>Zone</th>
                      <th>Status</th>
                      <th>Linked period costs</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((d) => {
                      const rows = expenseRows(s, { ...scope, deviceId: d.id });
                      return (
                        <tr key={d.id} className={selected === d.id ? 'selected' : ''}>
                          <td>
                            <button
                              className="device-name"
                              onClick={() => {
                                updateQuery(ctx, '/perangkat', { device: d.id });
                                if (ctx.mobile) ctx.open('device-detail', d.id);
                              }}
                            >
                              <span className="device-thumbnail">
                                <DeviceSymbol device={d} />
                              </span>
                              <span>
                                <strong>{displayLabel(d.label)}</strong>
                                <small>
                                  {displayLabel(d.id)}, {displayLabel(types[d.type])}
                                </small>
                              </span>
                            </button>
                          </td>
                          <td>
                            {displayLabel(d.zones.length > 2 ? 'All zones' : d.zones.join(', '))}
                          </td>
                          <td>
                            <Badge
                              tone={
                                d.connection === 'online'
                                  ? 'green'
                                  : d.connection === 'stale'
                                    ? 'amber'
                                    : 'red'
                              }
                              dot
                            >
                              {displayLabel(
                                d.connection === 'online'
                                  ? 'Online'
                                  : d.connection === 'stale'
                                    ? 'Old data'
                                    : 'Offline',
                              )}
                            </Badge>
                            {d.maintenance && <small className="cell-sub">Maintenance</small>}
                          </td>
                          <td>
                            <strong>
                              {displayLabel(
                                periodError(scope)
                                  ? 'Check date range'
                                  : rows.length
                                    ? money(rows.reduce((t, r) => t + r.amount, 0))
                                    : 'Not recorded',
                              )}
                            </strong>
                            <small className="cell-sub">
                              {displayLabel(
                                rows.some((r) => r.source === 'Alokasi')
                                  ? 'Recorded / allocated'
                                  : rows.length
                                    ? 'Tercatat'
                                    : 'Not assumed to be zero',
                              )}
                            </small>
                          </td>
                          <td>
                            <Button
                              small
                              icon="chevron"
                              tone="ghost"
                              ariaLabel={`Details ${d.id}`}
                              onClick={() => {
                                updateQuery(ctx, '/perangkat', { device: d.id });
                                if (ctx.mobile) ctx.open('device-detail', d.id);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!shown.length && (
                <Empty
                  title={
                    devices.length
                      ? 'No devices match these filters'
                      : s.devices.length
                        ? 'No active devices'
                        : 'Add your first device'
                  }
                  illustration={!s.devices.length ? 'irrigation' : undefined}
                  detail={
                    !devices.length
                      ? 'Register a sensor, camera, or pump to connect its zone, maintenance, and costs.'
                      : undefined
                  }
                  action={
                    devices.length ? (
                      <Button onClick={() => ctx.nav('/perangkat')}>Clear filters</Button>
                    ) : (
                      <Button permission="devices" onClick={() => ctx.open('device-create')}>
                        Add device
                      </Button>
                    )
                  }
                />
              )}
              <div className="table-footer">
                <span>
                  {displayLabel(
                    filtered.length
                      ? `${(page - 1) * 10 + 1}–${Math.min(page * 10, filtered.length)}`
                      : '0',
                  )}{' '}
                  of {filtered.length} devices
                </span>
                <div className="button-row">
                  <Button
                    small
                    disabled={page <= 1}
                    onClick={() => updateQuery(ctx, '/perangkat', { page: String(page - 1) })}
                  >
                    Previous
                  </Button>
                  <Button
                    small
                    disabled={page * 10 >= filtered.length}
                    onClick={() => updateQuery(ctx, '/perangkat', { page: String(page + 1) })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
            <Card className="inspector desktop-detail">
              <DeviceDetails ctx={ctx} id={selected} />
            </Card>
          </div>
          <Alert tone="gray" title={'One device, one record source'}>
            Maintenance costs and allocations use the same expense records. Previously purchased
            devices are not recorded as new expenses again.
          </Alert>
        </>
      )}
      {tab === 'cameras' && (
        <div className="camera-layout">
          <Card
            title={'Monitoring camera'}
            subtitle={'Camera reference image. Monitoring video is not available yet.'}
          >
            <CameraPreview s={s} deviceId={camera} />
            <div className="camera-picker">
              {devices
                .filter(
                  (d) =>
                    d.type === 'camera' && (zone === 'all' || d.zones.includes(zone as ZoneId)),
                )
                .map((d) => (
                  <button
                    key={d.id}
                    className={camera === d.id ? 'selected' : ''}
                    onClick={() => updateQuery(ctx, '/perangkat', { camera: d.id })}
                  >
                    <Icon name="camera" />
                    <strong>{displayLabel(d.id.replace('CAM-', ''))}</strong>
                    <small>Zone {displayLabel(d.zones[0])}</small>
                    <Badge tone={d.connection === 'online' ? 'green' : 'red'}>
                      {displayLabel(d.connection === 'online' ? 'Online' : 'Offline')}
                    </Badge>
                  </button>
                ))}
            </div>
            <Alert tone="gray">
              No MP4/WebM video is available. The reference image is shown without a live indicator
              or fabricated snapshot.
            </Alert>
          </Card>
          <div className="page-stack">
            <Card title={'Environmental conditions'} subtitle={`Zone ${cameraZone}`} icon="temp">
              <SensorCard s={s} id={`TH-${cameraZone}-01`} />
              <SensorCard s={s} id={`TH-${cameraZone}-01`} humidity />
            </Card>
            <Card title={'Growing sensors'} subtitle={'Available according to device capabilities'}>
              <div className="sensor-grid">
                <SensorCard s={s} id="MEDIA-A" compact />
                <SensorCard s={s} id="LEVEL-01" compact />
                <SensorCard s={s} id="EC-01" compact />
                <SensorCard s={s} id="PH-01" compact />
              </div>
            </Card>
          </div>
        </div>
      )}
      {tab === 'maintenance' && (
        <Card
          title={'Maintenance & follow-up'}
          data-tour="device-maintenance"
          subtitle={'A task is not completed just because its scheduled time has passed.'}
          tools={
            <Button
              permission="maintenance"
              small
              icon="plus"
              disabled={!devices.length}
              onClick={() => ctx.open('maintenance', devices[0]?.id)}
            >
              Record maintenance
            </Button>
          }
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ticket / task</th>
                  <th>Devices</th>
                  <th>Operator</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tickets
                  .filter((m) => matchesSearch(search, m.id, m.title))
                  .map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{displayLabel(m.title)}</strong>
                        <small className="cell-sub">{displayLabel(m.id)}</small>
                      </td>
                      <td>
                        <button
                          className="text-link"
                          onClick={() =>
                            ctx.nav(
                              `/perangkat?device=${encodeURIComponent(m.deviceId)}&${periodQuery(scope)}`,
                            )
                          }
                        >
                          {displayLabel(m.deviceId)}
                        </button>
                      </td>
                      <td>{displayLabel(m.operator ?? 'Unassigned')}</td>
                      <td>{displayLabel(dateLabel(m.dueAt))}</td>
                      <td>
                        <Badge tone={m.status === 'completed' ? 'green' : 'amber'}>
                          {displayLabel(
                            m.status === 'completed'
                              ? 'Completed'
                              : m.status === 'scheduled'
                                ? 'Scheduled'
                                : 'Terbuka',
                          )}
                        </Badge>
                        {displayLabel(
                          m.expenseId && (
                            <button
                              className="cell-sub text-link"
                              onClick={() => ctx.open('expense-detail', m.expenseId)}
                            >
                              {m.expenseId}
                            </button>
                          ),
                        )}
                      </td>
                      <td>
                        <Button
                          permission="maintenance"
                          small
                          onClick={() => ctx.open('maintenance', m.deviceId, m.id)}
                        >
                          Follow up
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
