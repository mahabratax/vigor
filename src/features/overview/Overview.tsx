import { displayLabel } from '../../i18n/display';
import React from 'react';
import { Assistant } from '../ai/Assistant';
import { zoneName } from '../../domain/zones';
import { productionSummary } from '../../domain/production';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { TrendChart } from '../../components/charts';
import { SensorCard } from '../../components/monitoring';
import { Button, Card, Empty, Icon, Progress, Select } from '../../components/ui';
import { costMonths, resolvePeriod } from '../../domain/periods';
import { comparison, costSummary } from '../../domain/costs';
import {
  clockTime,
  duration,
  money,
  monthLabel,
  num,
  number,
  runLabels,
} from '../../domain/format';
import { kpis, todayUsage, trendData } from '../../domain/selectors';
import { ZoneWatch } from './ZoneWatch';
import { WorkQueue } from './WorkQueuePanel';

function Operations({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    k = kpis(s),
    run = k.active.find((r) => r.status === 'Running' || r.status === 'Verifying') ?? k.active[0];
  const step = run?.steps[run.stepIndex],
    elapsed = step?.startedAt === undefined ? 0 : s.clock - step.startedAt;
  const schedules = s.routines
    .filter((r) => r.trigger.type === 'schedule' && r.status === 'Active')
    .slice(0, 3);
  return (
    <Card
      title={'Farm routines'}
      className="routine-overview"
      variant="plain"
      subtitle={`${k.routines} active routines, ${k.active.length} executions running or queued`}
      tools={
        <Button small tone="ghost" onClick={() => ctx.nav('/otomasi')}>
          View automation
        </Button>
      }
    >
      {run ? (
        <div className="operation-focus">
          <div className="operation-status">
            <span className="live-line" />
            <span>{displayLabel(runLabels[run.status])}</span>
            <span className="mono">{displayLabel(run.id)}</span>
          </div>
          <h3>{displayLabel(run.routineName)}</h3>
          <p>{displayLabel(step?.label ?? run.reason)}</p>
          <Progress
            value={step?.duration ? (elapsed / step.duration) * 100 : 0}
            label={`${duration(elapsed)} / ${duration(step?.duration ?? 0)}`}
          />
          <div className="button-row">
            <Button small onClick={() => ctx.nav(`/otomasi?tab=executions&run=${run.id}`)}>
              View execution
            </Button>
            <Button
              permission="run"
              small
              tone="danger"
              icon="stop"
              disabled={!!s.readings}
              title={s.readings ? 'No live controller is connected.' : undefined}
              onClick={async () => await ctx.act({ type: 'stop', id: run.id })}
            >
              Stop
            </Button>
          </div>
        </div>
      ) : (
        <div className="operation-focus">
          <div className="operation-status">
            <Icon name="clock" size={14} />
            <span>Next schedule</span>
            <strong>{displayLabel(k.next ? `${clockTime(k.next.at)} WIB` : '—')}</strong>
          </div>
          <h3>{displayLabel(k.next?.routine.name ?? 'No active schedule')}</h3>
          <p>
            {displayLabel(
              k.next
                ? `Zone ${k.next.routine.version.zones.join(' and ')}. Follows the saved schedule and operating limits.`
                : 'Activate a routine in Automation.',
            )}
          </p>
          {k.next && (
            <Button
              small
              onClick={() => ctx.nav(`/otomasi?tab=routines&routine=${k.next.routine.id}`)}
            >
              View routine rules
            </Button>
          )}
        </div>
      )}
      <div className="agenda-list">
        {schedules.map((r) => (
          <button key={r.id} onClick={() => ctx.nav(`/otomasi?tab=routines&routine=${r.id}`)}>
            <time>
              {displayLabel(r.trigger.type === 'schedule' ? r.trigger.schedule.times[0] : '')}
            </time>
            <span>
              <strong>{displayLabel(r.name)}</strong>
              <small>Zone {displayLabel(r.version.zones.join(', '))}</small>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        ))}
      </div>
    </Card>
  );
}
function RecentActivity({ ctx }: { ctx: PageContext }) {
  const events = [...ctx.s.events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 4);
  return (
    <Card
      title={'Recent activity'}
      className="activity-panel"
      variant="register"
      tools={
        <Button small tone="ghost" onClick={() => ctx.nav('/riwayat')}>
          View history
        </Button>
      }
    >
      {!events.length && (
        <Empty
          title="No activity recorded"
          detail="Care tasks, automation runs, and record changes will appear here."
        />
      )}
      <div className="activity-register">
        {events.map((event) => (
          <button key={event.id} onClick={() => ctx.nav('/riwayat?event=' + event.id)}>
            <time>
              {displayLabel(clockTime(event.at))}
              <small>WIB</small>
            </time>
            <span>
              <strong>{displayLabel(event.title)}</strong>
              <small>{displayLabel(event.actor)}</small>
            </span>
            {displayLabel(
              event.zoneId && <span className="activity-zone">Zone {event.zoneId}</span>,
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}
export function Overview(ctx: PageContext) {
  const { s } = ctx,
    usage = todayUsage(s);
  const environmentalSensor = s.devices.find(
    (d) =>
      d.capabilities.includes('temperature') &&
      d.zones.some((id) => s.zones.some((z) => z.id === id && z.status !== 'inactive')),
  );
  const sensorZone = environmentalSensor?.zones[0];
  const zone = s.zones.some((z) => z.id === ctx.query.get('chartZone'))
      ? ctx.query.get('chartZone')!
      : 'all',
    period = ctx.query.get('chartPeriod') === '3' ? '3' : '6',
    costPeriod = resolvePeriod(
      s.clock,
      ctx.query.get('period')?.match(/^\d{4}-\d{2}$/)?.[0],
    ).period;
  const cost = costSummary(s, { period: costPeriod }),
    comp = comparison(s, { period: costPeriod }),
    chartData = trendData(s).slice(-Number(period)),
    availableZones = s.zones.filter((z) =>
      chartData.some((row) => typeof row[z.id] === 'number' && Number.isFinite(row[z.id])),
    ),
    missingZones = s.zones.filter((z) => !availableZones.includes(z));
  return (
    <div className="page-stack overview-page">
      <Assistant ctx={ctx} key={s.greenhouse.id + s.cycle.id} />
      <ZoneWatch ctx={ctx} />
      <button className="crop-dashboard-link" onClick={() => ctx.nav('/siklus')}>
        <Icon name="leaf" />
        <span>
          <strong>From crop cycle to business results</strong>
          <small>
            {displayLabel(ctx.s.cycle.id)}, {displayLabel(num(productionSummary(ctx.s).harvest, 1))}{' '}
            kg harvested, {displayLabel(num(productionSummary(ctx.s).stock, 1))} kg remaining in
            stock
          </small>
        </span>
        <span>Care, harvests & sales</span>
        <Icon name="chevron" />
      </button>

      <div className="overview-grid">
        <Card
          title={'Pest capture trends'}
          subtitle={'New captures per 24 hours'}
          className="trend-panel"
          tools={
            <div className="button-row">
              <Select
                label={'Chart zone filter'}
                value={zone}
                onChange={(v) => updateQuery(ctx, '/ringkasan', { chartZone: v })}
                options={[
                  { value: 'all', label: 'All zones' },
                  ...s.zones.map((z) => ({ value: z.id, label: z.name })),
                ]}
              />
              <Select
                label={'Observation period'}
                value={period}
                onChange={(v) => updateQuery(ctx, '/ringkasan', { chartPeriod: v })}
                options={[
                  { value: '6', label: '6 observations' },
                  { value: '3', label: '3 observations' },
                ]}
              />
            </div>
          }
        >
          <TrendChart
            data={chartData}
            keys={zone === 'all' ? availableZones.map((z) => z.id) : [zone]}
            height={265}
          />
          <div className="chart-context">
            <Icon name="info" size={14} />
            <p>
              {displayLabel(
                missingZones.length
                  ? `Zone ${missingZones.map((z) => z.id).join(', ')} do not have comparable data yet.`
                  : 'All zones have observations. Select a legend item to compare zones.',
              )}
            </p>
          </div>
        </Card>
        <WorkQueue key={s.greenhouse.id} ctx={ctx} />
        <Operations ctx={ctx} />
        <Card
          title={sensorZone ? `Sensor ${zoneName(s, sensorZone)}` : 'Environmental sensors'}
          className="environment-panel"
          subtitle="Each sensor shows its last recorded reading"
          tools={
            <Button
              small
              tone="ghost"
              icon="temp"
              ariaLabel={
                sensorZone ? `Details ${zoneName(s, sensorZone)}` : 'Configure zone sensors'
              }
              onClick={() =>
                ctx.nav(
                  sensorZone
                    ? `/greenhouse?zone=${sensorZone}`
                    : '/greenhouse?tab=zones&panel=devices',
                )
              }
            />
          }
        >
          <div className="two-sensors">
            {environmentalSensor ? (
              <>
                <SensorCard s={s} id={environmentalSensor.id} compact />
                <SensorCard s={s} id={environmentalSensor.id} humidity compact />
              </>
            ) : (
              <Empty
                title={'No temperature sensor'}
                detail={'Assign a sensor to the zone to set up monitoring.'}
              />
            )}
          </div>
          <div className="resource-line">
            <span>Simulated water use</span>
            <strong>
              {displayLabel(number(usage.water, 1))} <small>L</small>
            </strong>
          </div>
          <small className="muted">
            {displayLabel(
              usage.measured
                ? 'Volume from simulated executions.'
                : 'No executions with water measurements yet.',
            )}
          </small>
        </Card>
      </div>
      <div className="overview-bottom">
        <RecentActivity ctx={ctx} />
        <Card
          title={'Farm expenses'}
          tools={
            <Select
              label="Overview expense period"
              value={costPeriod}
              onChange={(period) => updateQuery(ctx, '/ringkasan', { period })}
              options={costMonths(s, costPeriod).map((period) => ({
                value: period,
                label: monthLabel(period),
              }))}
            />
          }
          className="spend-panel"
          variant="plain"
        >
          <div className="spend-value">
            <span>Recorded operating costs</span>
            <strong>
              {displayLabel(
                cost.rows.some((r) => r.record.category !== 'Investasi')
                  ? money(cost.operating)
                  : 'Not recorded',
              )}
            </strong>
          </div>
          <dl className="spend-breakdown">
            <div>
              <dt>Remaining budget</dt>
              <dd>
                {displayLabel(cost.remaining === null ? 'Not entered' : money(cost.remaining))}
              </dd>
            </div>
            <div>
              <dt>Baseline comparison</dt>
              <dd>
                {displayLabel(
                  comp.canCompare
                    ? `${money(Math.abs(comp.difference ?? 0))} ${(comp.difference ?? 0) < 0 ? 'higher' : 'lower'}`
                    : 'Not equivalent',
                )}
              </dd>
            </div>
          </dl>
          <p className="spend-caption">
            Comparison uses a manual baseline. Device investment is recorded separately.
          </p>
          <Button className="full-width" onClick={() => ctx.nav(`/biaya?period=${costPeriod}`)}>
            View expenses
          </Button>
        </Card>
      </div>
    </div>
  );
}
