import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { CameraPreview, DeviceSymbol, SensorCard } from '../../components/monitoring';
import { Alert, Badge, Button, Empty, Icon, Meta, SourceTag, Tabs } from '../../components/ui';
import { costSummary, deviceUsage, expenseRows } from '../../domain/costs';
import { clockTime, dateLabel, money, num } from '../../domain/format';
import { periodError, periodLabel, periodQuery, resolvePeriod } from '../../domain/periods';
import { deviceActivity } from '../../domain/selectors';
import type { CostScope } from '../../domain/types';

export function DeviceDetails({ ctx, id }: { ctx: PageContext; id: string }) {
  const { s } = ctx,
    d = s.devices.find((x) => x.id === id);
  if (!d) return <Empty title={'Device not found'} />;
  const scope: CostScope = {
      ...resolvePeriod(
        s.clock,
        ctx.query.get('period'),
        ctx.query.get('from'),
        ctx.query.get('to'),
      ),
      deviceId: id,
    },
    cost = costSummary(s, scope),
    usage = deviceUsage(s, id, scope),
    tab = ctx.query.get('detailTab') ?? 'cost',
    related = s.routines.filter((r) => r.version.requiredDevices.includes(id)),
    rows = expenseRows(s, scope),
    ticket = s.maintenance.find((m) => m.deviceId === id && m.status !== 'completed'),
    activity = deviceActivity(s, id);
  const allocated = rows.filter((r) => r.source === 'Alokasi' && r.record.category === 'Listrik');
  return (
    <div className="detail-stack">
      <div className="detail-device-head">
        <span className="device-hero">
          <DeviceSymbol device={d} />
        </span>
        <div>
          <h2>{displayLabel(d.label)}</h2>
          <p>
            {displayLabel(d.id)},{' '}
            {displayLabel(d.zones.length > 1 ? 'Shared device' : `Zone ${d.zones[0] ?? '—'}`)}
          </p>
        </div>
        <Badge
          tone={d.connection === 'online' ? 'green' : d.connection === 'stale' ? 'amber' : 'red'}
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
      </div>
      <Tabs
        items={[
          { id: 'condition', label: 'Condition' },
          { id: 'usage', label: 'Usage' },
          { id: 'cost', label: 'Linked costs' },
        ]}
        value={tab}
        onChange={(v) => updateQuery(ctx, '/perangkat', { device: id, detailTab: v })}
      />
      {tab === 'condition' && (
        <>
          <Meta
            items={[
              {
                label: 'Current connection',
                value: `${dateLabel(d.lastSeen)}, ${clockTime(d.lastSeen)} WIB`,
              },
              { label: 'Zone', value: d.zones.join(', ') || 'Greenhouse' },
              {
                label: 'Calibration',
                value: d.calibrated ? 'Validated for sample data' : 'Not calibrated / validated',
              },
              { label: 'Resource', value: d.resource ?? 'Independent' },
              { label: 'Activity', value: activity.label },
              { label: 'Assumed power', value: `${d.watts} W, estimated` },
              { label: 'Maintenance schedule', value: dateLabel(d.nextMaintenance) },
            ]}
          />
          {d.type === 'camera' ? (
            <CameraPreview s={s} deviceId={d.id} />
          ) : ['sensor', 'nutrition'].includes(d.type) &&
            d.capabilities.some((c) =>
              ['temperature', 'media', 'flow', 'level', 'ec', 'ph'].includes(c),
            ) ? (
            <SensorCard s={s} id={id} />
          ) : null}
          {ticket && (
            <Alert
              title={ticket.id + ', ' + ticket.title}
              action={
                <Button
                  permission="maintenance"
                  small
                  onClick={() => ctx.open('maintenance', id, ticket.id)}
                >
                  Record follow-up
                </Button>
              }
            >
              {displayLabel(ticket.operator ?? 'No operator assigned')},{' '}
              {displayLabel(dateLabel(ticket.dueAt))}
            </Alert>
          )}
          <h3>Used by</h3>
          {related.length ? (
            <div className="link-list">
              {related.map((r) => (
                <button key={r.id} onClick={() => ctx.nav(`/otomasi?tab=routines&routine=${r.id}`)}>
                  <Icon name="workflow" size={16} />
                  <span>
                    {displayLabel(r.name)}
                    <small>
                      v{displayLabel(r.version.number)}, {displayLabel(r.version.zones.join(', '))}
                    </small>
                  </span>
                  <Icon name="chevron" size={15} />
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">Observation device; not automatically required for actuation.</p>
          )}
          <div className="capability-list">
            {d.capabilities.map((c) => (
              <span key={c}>{displayLabel(c)}</span>
            ))}
          </div>
          <div className="button-row">
            {d.connection !== 'online' && (
              <Button
                permission="devices"
                small
                icon="refresh"
                tone="primary"
                onClick={() => ctx.open('maintenance', id)}
              >
                Review connection
              </Button>
            )}
            <Button
              permission="maintenance"
              small
              icon="wrench"
              onClick={() => ctx.open('maintenance', id)}
            >
              Record maintenance
            </Button>
            <Button permission="devices" small onClick={() => ctx.open('maintenance-mode', id)}>
              {displayLabel(d.maintenance ? 'End maintenance' : 'Maintenance mode')}
            </Button>
          </div>
          <Button
            permission="devices"
            small
            tone="ghost"
            onClick={() => ctx.open('deactivate', id)}
          >
            {displayLabel(d.active ? 'Deactivate asset' : 'Reactivate asset')}
          </Button>
        </>
      )}
      {tab !== 'condition' && periodError(scope) && (
        <Alert title="Check the date range">
          {periodError(scope)} Change the cost period in the device filters.
        </Alert>
      )}
      {tab === 'usage' && !periodError(scope) && (
        <>
          <Alert tone="gray" title={`Usage ${periodLabel(scope)}`}>
            Separate from the current connection snapshot. Usage does not automatically create a
            payment.
          </Alert>
          <div className="mini-metrics">
            <div>
              <span>Runtime</span>
              <strong>
                {displayLabel(num(usage.seconds / 3600, 1))} <small>hours</small>
              </strong>
            </div>
            <div>
              <span>Estimated energy</span>
              <strong>
                {displayLabel(num(usage.kwh, 1))} <small>kWh</small>
              </strong>
            </div>
          </div>
          {usage.rows.length ? (
            <>
              <Meta
                items={[
                  {
                    label: 'Source',
                    value: 'Saved execution feedback, linked to the routine version at that time',
                  },
                  { label: 'Energy basis', value: `${d.watts} W × operating duration` },
                  {
                    label: 'Water',
                    value:
                      usage.water > 0
                        ? `${num(usage.water, 1)} L, ${usage.rows.some((u) => u.waterSource === 'measured_demo') ? 'measured in simulation' : 'estimated'}`
                        : 'No measured volume for this historical record',
                  },
                  { label: 'Usage records', value: usage.rows.length },
                ]}
              />
              <details>
                <summary>View runtime details ({usage.rows.length})</summary>
                <div className="table-scroll usage-history">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Run / version</th>
                        <th>Runtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.rows.map((u) => (
                        <tr key={u.id}>
                          <td>{displayLabel(dateLabel(u.at))}</td>
                          <td>
                            {displayLabel(u.runId)}
                            <small className="cell-sub">{displayLabel(u.routineVersionId)}</small>
                          </td>
                          <td>{displayLabel(num(u.seconds / 60))} minutes</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          ) : (
            <Empty
              title={'No usage records'}
              detail={'This does not mean zero usage for the entire period.'}
            />
          )}
          <Button small icon="workflow" onClick={() => ctx.nav('/otomasi?tab=executions')}>
            View automation executions
          </Button>
        </>
      )}
      {tab === 'cost' && !periodError(scope) && (
        <>
          <div className="period-note">
            <Icon name="calendar" size={16} />
            {displayLabel(periodLabel(scope))}, costs follow the period rather than current
            connectivity
          </div>
          <div className="cost-total">
            <span>Device-related costs</span>
            <strong>{displayLabel(rows.length ? money(cost.total) : 'Not recorded')}</strong>
            <SourceTag>Recorded + allocated; not additional bills</SourceTag>
          </div>
          {rows.map((row) => (
            <button
              className="expense-source"
              key={row.record.id}
              onClick={() => ctx.open('expense-detail', row.record.id, id)}
            >
              <span className="soft-icon">
                <Icon name={row.record.category === 'Listrik' ? 'bolt' : 'wrench'} />
              </span>
              <span className="grow">
                <strong>
                  {displayLabel(
                    row.record.category === 'Listrik'
                      ? 'Electricity bill allocation'
                      : row.record.note,
                  )}
                </strong>
                <small>
                  {displayLabel(row.record.id)}, {displayLabel(dateLabel(row.record.paidAt))}
                </small>
                <SourceTag>{displayLabel(row.source)}</SourceTag>
              </span>
              <strong>{displayLabel(money(row.amount))}</strong>
              <Icon name="chevron" size={16} />
            </button>
          ))}
          {allocated.length > 0 && (
            <Alert tone="gray" title={'Allocated from greenhouse bill'}>
              This device's electricity share{' '}
              {displayLabel(money(allocated.reduce((total, row) => total + row.amount, 0)))} of bill{' '}
              {displayLabel(money(allocated.reduce((total, row) => total + row.record.amount, 0)))}.
              This allocation is already included in the greenhouse bill and counted once.
            </Alert>
          )}
          {!rows.length && (
            <Empty
              title={'No linked expenses'}
              detail={
                'Greenhouse-level costs are not charged in full to devices without an allocation.'
              }
            />
          )}
          <div className="button-row">
            <Button
              small
              tone="primary"
              icon="wallet"
              onClick={() =>
                ctx.nav(
                  `/biaya?tab=expenses&${periodQuery(scope)}&device=${encodeURIComponent(id)}`,
                )
              }
            >
              View expenses
            </Button>
            <Button
              permission="maintenance"
              small
              icon="plus"
              onClick={() => ctx.open('maintenance', id)}
            >
              Record maintenance
            </Button>
          </div>
          {d.acquiredAmount !== undefined && (
            <p className="micro muted">
              Acquisition cost: {displayLabel(money(d.acquiredAmount))}, separate from recurring
              period costs.
            </p>
          )}
        </>
      )}
    </div>
  );
}
