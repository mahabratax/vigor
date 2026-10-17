import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { SensorCard } from '../../components/monitoring';
import { Alert, Badge, Button, Card, Empty, Icon, Meta, Progress, Stat } from '../../components/ui';
import { clockTime, duration, isActiveRun, number, runLabels } from '../../domain/format';
import { nextScheduled } from '../../domain/scheduler';
import { kindIcons } from './presentation';
import { RunOutcome } from '../greenhouse/RunOutcome';

export function RunDetails({ ctx, id }: { ctx: PageContext; id: string }) {
  const { s } = ctx,
    r = s.runs.find((r) => r.id === id);
  if (!r) return <Empty title={'Execution not found'} />;
  const step = r.steps[r.stepIndex],
    active = isActiveRun(r.status),
    done = r.steps.filter((x) => x.status === 'completed' || x.status === 'skipped').length,
    elapsed = step?.startedAt !== undefined ? Math.min(s.clock - step.startedAt, step.duration) : 0,
    usage = s.usages.filter((u) => u.runId === r.id),
    water = usage.reduce((a, u) => a + u.waterLiters, 0),
    nutrition = usage.reduce((a, u) => a + u.nutrientUnits, 0),
    energy = usage.reduce((a, u) => a + u.energyKwh, 0),
    exception = ['Blocked', 'Failed', 'Needs reconciliation'].includes(r.status),
    next = nextScheduled(s)[0];
  return (
    <div className="page-stack run-detail">
      <Card>
        <div className="run-heading">
          <span className="big-soft-icon">
            <Icon name={kindIcons[r.kind]} size={29} />
          </span>
          <div className="grow">
            <div className="inline-wrap">
              <h2>{displayLabel(r.routineName)}</h2>
              <Badge tone={exception ? 'amber' : active ? 'green' : 'gray'} dot>
                {displayLabel(runLabels[r.status])}
              </Badge>
            </div>
            <p>
              {displayLabel(r.id)}, {displayLabel(r.routineVersionId)},{' '}
              {displayLabel(
                r.source === 'schedule'
                  ? 'Automatic scheduled run'
                  : r.source === 'sensor'
                    ? 'Sensor episode'
                    : r.source === 'plan'
                      ? 'Control plan'
                      : 'One-time run',
              )}
            </p>
          </div>
          <div className="button-row wrap">
            <Button
              small
              icon="file"
              onClick={() =>
                ctx.nav(
                  r.planId
                    ? `/pengendalian?plan=${r.planId}`
                    : `/otomasi?tab=routines&routine=${r.routineId}`,
                )
              }
            >
              {displayLabel(r.planId ? 'View plan' : 'View routines')}
            </Button>
            {active && (
              <Button
                permission="run"
                small
                tone="danger"
                icon="stop"
                disabled={!!ctx.s.readings || r.stopRequestedAt !== undefined}
                title={ctx.s.readings ? 'No live controller is connected.' : undefined}
                onClick={async () => await ctx.act({ type: 'stop', id: r.id })}
              >
                {displayLabel(
                  r.stopRequestedAt !== undefined ? 'Awaiting stop…' : 'Stop execution',
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
      {exception && (
        <Alert
          tone={r.status === 'Needs reconciliation' ? 'red' : 'amber'}
          title={runLabels[r.status]}
          action={
            <Button
              permission="run"
              small
              onClick={() =>
                r.status === 'Needs reconciliation'
                  ? ctx.open('reconcile', r.id)
                  : ctx.nav(
                      `/perangkat?device=${r.snapshot.requiredDevices.find((id) => s.devices.find((d) => d.id === id)?.connection !== 'online') ?? 'FLOW-01'}`,
                    )
              }
            >
              {displayLabel(r.status === 'Needs reconciliation' ? 'Review state' : 'Check device')}
            </Button>
          }
        >
          {displayLabel(r.reason)}
        </Alert>
      )}
      <div className="run-layout">
        <div className="page-stack">
          <RunOutcome key={r.id} ctx={ctx} runId={r.id} />
          <Card>
            <div className="run-countdown">
              <div>
                <span className="step-caption">
                  {displayLabel(active ? 'Current step' : 'Execution result')}
                </span>
                <h3>{displayLabel(active ? (step?.label ?? r.reason) : runLabels[r.status])}</h3>
                <div className="timer">
                  <strong>
                    {displayLabel(
                      active
                        ? duration(elapsed)
                        : duration((r.finishedAt ?? s.clock) - (r.startedAt ?? r.createdAt)),
                    )}
                  </strong>
                  <span>
                    /{' '}
                    {displayLabel(
                      duration(
                        active
                          ? (step?.duration ?? 0)
                          : r.snapshot.steps.reduce((a, x) => a + x.duration, 0),
                      ),
                    )}{' '}
                    minutes
                  </span>
                </div>
              </div>
              <div>
                <small>{displayLabel(active ? 'Step limit' : 'Completed / stopped')}</small>
                <strong>
                  {displayLabel(
                    clockTime(
                      active
                        ? (step?.startedAt ?? s.clock) + (step?.duration ?? 0)
                        : (r.finishedAt ?? s.clock),
                    ),
                  )}{' '}
                  WIB
                </strong>
              </div>
            </div>
            <Progress
              value={
                active && step?.duration
                  ? (elapsed / step.duration) * 100
                  : (done / r.steps.length) * 100
              }
              label={`${done}/${r.steps.length} steps completed / skipped`}
            />
            <div className="run-steps">
              {r.steps.map((st, i) => (
                <div key={st.id} className={`run-step ${st.status}`}>
                  <span className="step-dot">
                    {displayLabel(
                      st.status === 'completed' ? (
                        <Icon name="check" size={13} />
                      ) : st.status === 'failed' ? (
                        <Icon name="alert" size={13} />
                      ) : st.status === 'skipped' ? (
                        '–'
                      ) : (
                        i + 1
                      ),
                    )}
                  </span>
                  <div>
                    <strong>{displayLabel(st.label)}</strong>
                    <small>
                      {displayLabel(
                        st.status === 'pending'
                          ? 'Queued'
                          : st.status === 'running'
                            ? 'Running'
                            : st.status === 'completed'
                              ? 'Completed'
                              : st.status === 'skipped'
                                ? st.reason
                                : 'Stopped / failed',
                      )}
                    </small>
                  </div>
                  <span>
                    {displayLabel(
                      st.startedAt ? clockTime(st.startedAt, true) : duration(st.duration),
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <div className="stats three compact-stats">
            <Stat
              icon="drop"
              label={'Water delivered'}
              value={`${number(water, 1)} L`}
              sub={
                usage.some((u) => u.waterSource === 'measured_demo')
                  ? 'Measured in simulation'
                  : 'No usage feedback yet'
              }
            />
            <Stat
              icon="flask"
              label={'Simulated nutrients'}
              value={
                usage.some((u) => !u.deliveryConfirmed)
                  ? 'Uncertain'
                  : `${number(nutrition, 2)} unit`
              }
              sub={'Simulation units, not a crop dose'}
            />
            <Stat
              icon="bolt"
              label={'Estimated energy'}
              value={`${number(energy, 3)} kWh`}
              sub={'Assumed power × runtime'}
            />
          </div>
          <Card title={'Device diagram'} icon="devices">
            <div className="device-flow">
              {(r.resource === 'PUMP-01'
                ? [
                    { id: 'LEVEL-01', label: 'Water tank', icon: 'drop' as const },
                    { id: 'PUMP-01', label: 'Pump', icon: 'devices' as const },
                    ...(r.kind === 'fertigation'
                      ? [{ id: 'DOSE-01', label: 'Sample injector', icon: 'flask' as const }]
                      : []),
                    {
                      id: `VALVE-${r.currentZone ?? r.snapshot.zones[0]}`,
                      label: `Zone ${r.currentZone ?? r.snapshot.zones[0]}`,
                      icon: 'leaf' as const,
                    },
                  ]
                : r.resource === 'FAN-01'
                  ? [
                      { id: 'TH-A-01', label: 'Temperature sensor', icon: 'temp' as const },
                      { id: 'FAN-01', label: 'Fan', icon: 'wind' as const },
                    ]
                  : [{ id: 'CTRL-01', label: 'Virtual test module', icon: 'shield' as const }]
              ).map((d, i) => (
                <React.Fragment key={d.id}>
                  {i > 0 && <Icon name="arrow" size={21} />}
                  <button
                    onClick={() => ctx.nav(`/perangkat?device=${d.id}`)}
                    className={active ? 'active' : ''}
                  >
                    <Icon name={d.icon} size={26} />
                    <strong>{displayLabel(d.label)}</strong>
                    <small>{displayLabel(d.id)}</small>
                  </button>
                </React.Fragment>
              ))}
            </div>
            <p className="micro muted">
              Simulator state diagram, not physical fluid simulation. Connectivity and actuation
              feedback are separate signals.
            </p>
          </Card>
          <Card
            title={'Execution notes'}
            icon="history"
            tools={
              <Button small tone="ghost" onClick={() => ctx.nav(`/riwayat?search=${r.id}`)}>
                View history
              </Button>
            }
          >
            <div className="process-log">
              {s.events
                .filter((e) => e.objectId === r.id)
                .slice(0, 10)
                .map((e) => (
                  <div key={e.id}>
                    <span className="tiny-dot" />
                    <time>{displayLabel(clockTime(e.at, true))}</time>
                    <strong>{displayLabel(e.title)}</strong>
                    <small>{displayLabel(e.detail)}</small>
                  </div>
                ))}
            </div>
          </Card>
        </div>
        <div className="page-stack">
          <Card title={'Next in queue'} icon="clock">
            {r.snapshot.zones.includes('B') &&
              r.steps.some((st) => st.zoneId === 'B' && st.status === 'pending') && (
                <div className="next-queue">
                  <span className="soft-icon">
                    <Icon name="drop" />
                  </span>
                  <span>
                    <strong>Zone B</strong>
                    <small>Waiting for the same pump.</small>
                  </span>
                </div>
              )}
            {s.runs
              .filter((x) => x.status === 'Queued' && x.id !== r.id)
              .map((x) => (
                <button
                  className="plain-row"
                  key={x.id}
                  onClick={() => updateQuery(ctx, '/otomasi', { run: x.id })}
                >
                  <span>
                    <strong>{displayLabel(x.routineName)}</strong>
                    <small>{displayLabel(x.reason)}</small>
                  </span>
                  <Icon name="chevron" size={14} />
                </button>
              ))}
            {next && (
              <button
                className="plain-row"
                onClick={() => ctx.nav(`/otomasi?tab=routines&routine=${next.routine.id}`)}
              >
                <span>
                  <strong>{displayLabel(clockTime(next.at))} WIB</strong>
                  <small>{displayLabel(next.routine.name)}</small>
                </span>
                <Icon name="chevron" size={14} />
              </button>
            )}
          </Card>
          <Card title={'Operating limits'} icon="settings">
            <Meta
              items={[
                {
                  label: 'Maximum duration',
                  value: duration(r.snapshot.maxDuration) + ' minutes / run',
                },
                { label: 'Daily cycles', value: `Maksimal ${r.snapshot.maxCyclesPerDay}` },
                { label: 'Water limit', value: `${r.snapshot.maxWaterPerDay} L / day / resource` },
                {
                  label: 'Nutrient limit',
                  value: `${r.snapshot.maxNutritionPerDay} simulation units / day`,
                },
                { label: 'Cycle interval', value: duration(r.snapshot.cooldownSeconds) },
                { label: 'Queue limit', value: duration(r.snapshot.queueTimeout) },
              ]}
            />
            <Alert tone="blue">Overrides cannot bypass operating limits or required sensors.</Alert>
            <Button
              permission="automation"
              small
              icon="file"
              onClick={() => ctx.open('override', r.routineId)}
            >
              Record temporary override
            </Button>
          </Card>
          {r.resource === 'PUMP-01' && (
            <Card title={'Device feedback'} icon="eye">
              <div className="page-stack tight">
                <SensorCard s={s} id="FLOW-01" compact />
                <SensorCard s={s} id="LEVEL-01" compact />
                {r.kind === 'fertigation' && <SensorCard s={s} id="EC-01" compact />}
              </div>
            </Card>
          )}
          <Alert tone="green" title={'One pump, one run at a time'}>
            Manual runs share locks and cumulative limits. They do not interrupt active runs.
          </Alert>
        </div>
      </div>
    </div>
  );
}
