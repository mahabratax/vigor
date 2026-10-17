import { displayLabel, matchesSearch } from '../../i18n/display';
import React from 'react';
import { RoutinePreview } from './RoutinePreview';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { SensorCard } from '../../components/monitoring';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Icon,
  Meta,
  Progress,
  SearchField,
  Select,
  SourceTag,
  Stat,
  Tabs,
} from '../../components/ui';
import { clockTime, dateLabel, isActiveRun, localDate, runLabels } from '../../domain/format';
import { nextScheduled } from '../../domain/scheduler';
import { kpis } from '../../domain/selectors';
import { RoutineBuilder } from './Builder';
import { kindIcons, kindLabels, routineStatus, triggerLabel } from './presentation';
import { RoutineDetails } from './RoutineDetails';
import { RunDetails } from './RunDetails';
export { RoutineDetails } from './RoutineDetails';
export { RunDetails } from './RunDetails';

export function Automation(ctx: PageContext) {
  const { s } = ctx,
    tab = ctx.query.get('tab') ?? 'schedule',
    k = kpis(s),
    selected = s.routines.find((r) => r.id === ctx.query.get('routine')) ?? s.routines[0],
    run =
      s.runs.find((r) => r.id === ctx.query.get('run')) ??
      s.runs.find((r) => isActiveRun(r.status)) ??
      s.runs[0],
    search = ctx.query.get('search') ?? '',
    kind = ctx.query.get('kind') ?? 'all';
  if (tab === 'builder')
    return ctx.can?.('automation') === false ? (
      <Card>
        <Empty
          icon="shield"
          title={'Automation settings require Manager or Owner access'}
          detail={'You can still view routines in the automation list.'}
          action={<Button onClick={() => ctx.nav('/otomasi?tab=routines')}>View routines</Button>}
        />
      </Card>
    ) : (
      <RoutineBuilder key={ctx.query.get('routine') ?? 'new'} ctx={ctx} />
    );
  const list = s.routines.filter(
    (r) => (kind === 'all' || r.kind === kind) && matchesSearch(search, r.name),
  );
  return (
    <div className="page-stack">
      <div className="stats">
        <Stat
          icon="workflow"
          label={'Active routines'}
          value={k.routines}
          sub={`${s.routines.length} configured routines`}
        />
        <Stat
          icon="play"
          label={'Running / queued'}
          value={k.active.length}
          sub={'Physical devices are not connected'}
        />
        <Stat
          icon="calendar"
          label={'Next schedule'}
          value={k.next ? clockTime(k.next.at) : '—'}
          sub={k.next?.routine.name ?? 'No active schedule'}
        />
        <Stat
          icon="alert"
          tone="amber"
          label={'Exceptions'}
          value={k.exceptions.length}
          sub="Blocked, failed, or unconfirmed"
          onClick={() =>
            updateQuery(ctx, '/otomasi', { tab: 'executions', run: k.exceptions[0]?.id })
          }
        />
      </div>
      <Tabs
        label={'Automation sections'}
        value={tab}
        onChange={(v) => updateQuery(ctx, '/otomasi', { tab: v })}
        items={[
          { id: 'schedule', label: 'Schedule' },
          { id: 'routines', label: 'Routine' },
          { id: 'executions', label: 'Executions', count: k.active.length || undefined },
          { id: 'nutrition', label: 'Nutrient profiles' },
          { id: 'preview', label: 'Preview' },
        ]}
      />
      {tab === 'preview' && <RoutinePreview key={s.greenhouse.id} ctx={ctx} />}
      {tab === 'schedule' && (
        <div className="schedule-layout">
          <Card
            title={"Today's schedule"}
            data-tour="automation-schedule"
            icon="calendar"
            subtitle={`${dateLabel(s.clock, true)}, all times WIB`}
            tools={
              <Select
                label={'Schedule view'}
                value={ctx.query.get('agenda') ?? 'day'}
                onChange={(v) => updateQuery(ctx, '/otomasi', { agenda: v })}
                options={[
                  { value: 'day', label: '24-hour timeline' },
                  { value: 'week', label: '7-day agenda' },
                ]}
              />
            }
          >
            {ctx.query.get('agenda') === 'week' ? (
              <div className="weekly-agenda">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = localDate(s.clock + i * 86400);
                  return (
                    <div key={date}>
                      <strong>{displayLabel(dateLabel(date))}</strong>
                      <div>
                        {s.routines
                          .filter((r) => r.trigger.type === 'schedule' && r.status === 'Active')
                          .map((r) => (
                            <button key={r.id} onClick={() => ctx.open('routine', r.id)}>
                              <span className={`tiny-dot ${r.kind}`} />
                              {displayLabel(triggerLabel(r))}, {displayLabel(r.name)}
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="schedule-chart">
                <div className="schedule-hours">
                  <span>Routine</span>
                  <div>
                    {[0, 6, 12, 18, 24].map((h) => (
                      <span key={h}>{displayLabel(String(h).padStart(2, '0'))}:00</span>
                    ))}
                  </div>
                </div>
                {s.routines
                  .filter((r) => r.status === 'Active')
                  .map((r) => {
                    const hour =
                      r.trigger.type === 'schedule'
                        ? Number(r.trigger.schedule.times[0]?.split(':')[0] ?? 0)
                        : 8;
                    const current = s.runs.find(
                      (x) => x.routineId === r.id && localDate(x.createdAt) === localDate(s.clock),
                    );
                    return (
                      <div className="schedule-row" key={r.id}>
                        <button onClick={() => ctx.open('routine', r.id)}>
                          <Icon name={kindIcons[r.kind]} size={16} />
                          <span>
                            {displayLabel(r.name)}
                            <small>
                              {displayLabel(r.policy === 'task' ? 'Operator task' : 'Automatic')}
                            </small>
                          </span>
                        </button>
                        <div className="schedule-track">
                          <span
                            className="now-line"
                            style={{ left: `${(((s.clock + 7 * 3600) % 86400) / 86400) * 100}%` }}
                          />
                          <button
                            className={`schedule-event ${r.kind} ${current?.status === 'Running' ? 'running' : ''}`}
                            style={{
                              left: `${(hour / 24) * 100}%`,
                              width: r.trigger.type === 'sensor' ? '38%' : undefined,
                            }}
                            onClick={() =>
                              current
                                ? ctx.nav(`/otomasi?tab=executions&run=${current.id}`)
                                : ctx.open('routine', r.id)
                            }
                          >
                            {displayLabel(
                              current
                                ? runLabels[current.status]
                                : r.trigger.type === 'sensor'
                                  ? 'Condition window'
                                  : r.trigger.type === 'schedule'
                                    ? r.trigger.schedule.times[0]
                                    : '',
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                <div className="schedule-legend">
                  <span>
                    <i className="green" />
                    Automatic
                  </span>
                  <span>
                    <i className="amber" />
                    Sample nutrients
                  </span>
                  <span>
                    <i className="purple" />
                    Operator task
                  </span>
                </div>
              </div>
            )}
            <div className="section-label">Upcoming agenda</div>
            <div className="agenda-list">
              {nextScheduled(s)
                .slice(0, 5)
                .map((x) => (
                  <div key={x.routine.id}>
                    <time>{displayLabel(clockTime(x.at))}</time>
                    <span
                      className={`soft-icon ${x.routine.kind === 'fertigation' ? 'amber' : ''}`}
                    >
                      <Icon name={kindIcons[x.routine.kind]} />
                    </span>
                    <span className="grow">
                      <strong>{displayLabel(x.routine.name)}</strong>
                      <small>
                        Zone {displayLabel(x.routine.version.zones.join(', '))},{' '}
                        {displayLabel(
                          x.routine.policy === 'task'
                            ? 'Creates an operator task'
                            : 'Automatic; no per-run approval',
                        )}
                      </small>
                    </span>
                    <Button small tone="ghost" onClick={() => ctx.open('routine', x.routine.id)}>
                      View details
                    </Button>
                  </div>
                ))}
            </div>
          </Card>
          <div className="page-stack">
            <Card title={'Running now'} icon="play">
              {k.active.length ? (
                k.active.map((r) => (
                  <button
                    key={r.id}
                    className="live-run-tile"
                    onClick={() => ctx.nav(`/otomasi?tab=executions&run=${r.id}`)}
                  >
                    <div>
                      <Icon name={kindIcons[r.kind]} size={24} />
                      <span>
                        <strong>{displayLabel(r.routineName)}</strong>
                        <small>
                          {displayLabel(r.id)}, {displayLabel(runLabels[r.status])}
                        </small>
                      </span>
                      <Icon name="chevron" size={16} />
                    </div>
                    <p>{displayLabel(r.steps[r.stepIndex]?.label ?? r.reason)}</p>
                    <Progress value={(r.stepIndex / r.steps.length) * 100} />
                  </button>
                ))
              ) : (
                <Empty
                  title={'No active runs'}
                  detail="Review routine conditions and planned steps before connecting a controller."
                  icon="clock"
                  action={
                    <Button
                      permission="run"
                      small
                      tone="primary"
                      icon="play"
                      onClick={() => ctx.nav('/otomasi?tab=preview')}
                    >
                      Preview a routine
                    </Button>
                  }
                />
              )}
            </Card>
            <Card title={'Needs attention'} icon="alert">
              {k.exceptions.length ? (
                k.exceptions.slice(0, 3).map((r) => (
                  <button
                    className="exception-tile"
                    key={r.id}
                    onClick={() => ctx.nav(`/otomasi?tab=executions&run=${r.id}`)}
                  >
                    <Badge tone="amber">{displayLabel(runLabels[r.status])}</Badge>
                    <strong>{displayLabel(r.routineName)}</strong>
                    <small>{displayLabel(r.reason)}</small>
                  </button>
                ))
              ) : (
                <p className="muted">No automation exceptions recorded.</p>
              )}
            </Card>
            <Alert tone="blue" title="Controller not connected">
              Schedules are saved configuration. They do not run in the background or send device
              commands.
            </Alert>
          </div>
        </div>
      )}
      {tab === 'routines' && (
        <>
          <div className="filter-bar">
            <SearchField
              value={search}
              onChange={(v) => updateQuery(ctx, '/otomasi', { search: v })}
              placeholder={'Search routines…'}
            />
            <Select
              label={'Routine type'}
              value={kind}
              onChange={(v) => updateQuery(ctx, '/otomasi', { kind: v })}
              options={[
                { value: 'all', label: 'All types' },
                ...Object.entries(kindLabels).map(([value, label]) => ({ value, label })),
              ]}
            />
            <span className="micro muted">Activation is reviewed once per version.</span>
          </div>
          <div className="routine-layout">
            <Card
              title={'Farm routines'}
              data-tour="routine-register"
              variant="register"
              subtitle={`${list.length} routines with configuration and operating limits`}
            >
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Routine</th>
                      <th>Zone / trigger</th>
                      <th>Policy</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.id} className={selected.id === r.id ? 'selected' : ''}>
                        <td>
                          <button
                            className="device-name"
                            onClick={() => updateQuery(ctx, '/otomasi', { routine: r.id })}
                          >
                            <span className="soft-icon">
                              <Icon name={kindIcons[r.kind]} />
                            </span>
                            <span>
                              <strong>{displayLabel(r.name)}</strong>
                              <small>
                                {displayLabel(kindLabels[r.kind])}, v
                                {displayLabel(r.version.number)}
                              </small>
                            </span>
                          </button>
                        </td>
                        <td>
                          Zone {displayLabel(r.version.zones.join(', '))}
                          <small className="cell-sub">{displayLabel(triggerLabel(r))}</small>
                        </td>
                        <td>
                          <Badge tone={r.policy === 'task' ? 'purple' : 'gray'}>
                            {displayLabel(
                              r.policy === 'automatic'
                                ? 'Automatic'
                                : r.policy === 'task'
                                  ? 'Create task'
                                  : 'Approval',
                            )}
                          </Badge>
                        </td>
                        <td>
                          <button
                            disabled={ctx.can?.('automation') === false}
                            className={`switch ${r.status === 'Active' ? 'on' : ''}`}
                            role="switch"
                            aria-checked={r.status === 'Active'}
                            aria-label={`${r.status === 'Active' ? 'Pause' : 'Aktifkan'} ${displayLabel(r.name)}`}
                            onClick={async () =>
                              r.status === 'Active' || r.status === 'Paused'
                                ? await ctx.act({ type: 'routine_toggle', id: r.id })
                                : ctx.open('activate-routine', r.id)
                            }
                          >
                            <span />
                          </button>
                          <small className="cell-sub">{displayLabel(routineStatus(r))}</small>
                        </td>
                        <td>
                          <Button
                            small
                            tone="ghost"
                            icon="chevron"
                            ariaLabel={`Details ${displayLabel(r.name)}`}
                            onClick={() => {
                              updateQuery(ctx, '/otomasi', { routine: r.id });
                              if (ctx.mobile) ctx.open('routine', r.id);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!list.length && (
                <Empty
                  title={s.routines.length ? 'No routines match these filters' : 'No routines yet'}
                  illustration={!s.routines.length ? 'irrigation' : undefined}
                  detail={
                    !s.routines.length ? 'Start with a scheduled plant inspection task.' : undefined
                  }
                />
              )}
            </Card>
            {selected && (
              <Card className="inspector desktop-detail">
                <RoutineDetails ctx={ctx} id={selected.id} />
              </Card>
            )}
          </div>
        </>
      )}
      {tab === 'executions' && (
        <>
          {s.runs.length > 0 && (
            <div className="filter-bar">
              <Select
                label={'Select execution'}
                value={run?.id ?? ''}
                onChange={(v) => updateQuery(ctx, '/otomasi', { run: v })}
                options={s.runs.map((r) => ({
                  value: r.id,
                  label: `${r.id}, ${displayLabel(r.routineName)}, ${runLabels[r.status]}`,
                }))}
              />
              <span className="micro muted">
                {s.runs.length} recorded executions. Select one to review its steps.
              </span>
              <Button small icon="download" onClick={() => ctx.nav('/riwayat?type=run')}>
                Automation report
              </Button>
            </div>
          )}
          {run ? (
            <RunDetails ctx={ctx} id={run.id} />
          ) : (
            <Card>
              <Empty
                title={'Executions will appear here'}
                detail="Recorded executions will appear here. Use the read-only preview to check a routine without creating an execution."
                icon="workflow"
                action={
                  <Button
                    permission="run"
                    tone="primary"
                    icon="play"
                    onClick={() => ctx.nav('/otomasi?tab=preview')}
                  >
                    Preview a routine
                  </Button>
                }
              />
            </Card>
          )}
        </>
      )}
      {tab === 'nutrition' && !s.nutrientProfiles.length && (
        <Card>
          <Empty
            icon="flask"
            title={'No nutrient profiles yet'}
            detail={
              'Creating new nutrient profiles is not supported yet. You can create care task routines; sample fertigation profiles are included in the initial greenhouses.'
            }
            action={
              <Button permission="automation" onClick={() => ctx.nav('/otomasi?tab=builder')}>
                Create routine
              </Button>
            }
          />
        </Card>
      )}
      {tab === 'nutrition' && s.nutrientProfiles.length > 0 && (
        <>
          <Alert title={'Simulation parameters, not a growing recipe'}>
            EC/pH readings are sample values. No fertilizer formulation, automatic pH correction, or
            image-based concentration recommendation is provided.
          </Alert>
          <div className="nutrition-layout">
            <Card title={'Nutrient profiles'}>
              <div className="routine-list">
                {s.nutrientProfiles.map((p) => (
                  <button
                    key={p.id}
                    className={`routine-item ${(ctx.query.get('profile') ?? 'NP-001') === p.id ? 'selected' : ''}`}
                    onClick={() => updateQuery(ctx, '/otomasi', { profile: p.id })}
                  >
                    <span className="soft-icon">
                      <Icon name="flask" />
                    </span>
                    <span>
                      <strong>{displayLabel(p.name)}</strong>
                      <small>
                        v{displayLabel(p.version)}, Zone {displayLabel(p.zones.join(', '))}
                      </small>
                      <Badge tone={p.status === 'active' ? 'green' : 'gray'}>
                        {displayLabel(
                          p.status === 'active'
                            ? 'Active'
                            : p.status === 'draft'
                              ? 'Draft'
                              : 'Needs review',
                        )}
                      </Badge>
                    </span>
                  </button>
                ))}
              </div>
            </Card>
            <Card
              title={
                s.nutrientProfiles.find((p) => p.id === (ctx.query.get('profile') ?? 'NP-001'))
                  ?.name ?? 'Nutrient profiles'
              }
              icon="flask"
              tools={
                <Button
                  permission="automation"
                  small
                  icon="edit"
                  onClick={() =>
                    ctx.open('nutrition-profile', ctx.query.get('profile') ?? 'NP-001')
                  }
                >
                  Edit profile
                </Button>
              }
            >
              <Meta
                items={[
                  {
                    label: 'Crop / stage',
                    value: `${displayLabel(s.cycle.crop)}, ${displayLabel(s.cycle.phase)}`,
                  },
                  { label: 'Target zone', value: 'Zone A' },
                  {
                    label: 'Active profile',
                    value: `${ctx.query.get('profile') ?? 'NP-001'} v${(s.nutrientProfiles.find((p) => p.id === (ctx.query.get('profile') ?? 'NP-001')) ?? s.nutrientProfiles[0]).version}`,
                  },
                  {
                    label: 'Simulator target',
                    value: `${(s.nutrientProfiles.find((p) => p.id === (ctx.query.get('profile') ?? 'NP-001')) ?? s.nutrientProfiles[0]).demoUnits} simulation units; not a field dose`,
                  },
                ]}
              />
              <h3>Fertigation sequence</h3>
              <div className="compact-steps">
                {s.routines
                  .find((r) => r.id === 'RTN-002')
                  ?.version.steps.map((st, i) => (
                    <div key={st.id}>
                      <span>{i + 1}</span>
                      <div>
                        <strong>{displayLabel(st.label)}</strong>
                        <small>{displayLabel(st.deviceIds.join(', '))}</small>
                      </div>
                    </div>
                  ))}
              </div>
              <Alert tone="green" title={'Dosing requires confirmed flow'}>
                Loss of flow stops dosing. Flushing is not forced when water is unavailable or the
                line has a fault.
              </Alert>
              <Button small onClick={() => ctx.nav('/otomasi?tab=routines&routine=RTN-002')}>
                View fertigation routine
              </Button>
            </Card>
            <div className="page-stack">
              <Card title={'Solution readings'} icon="eye">
                <div className="page-stack tight">
                  <SensorCard s={s} id="EC-01" />
                  <SensorCard s={s} id="PH-01" />
                  <SensorCard s={s} id="NUTRI-LEVEL-01" compact />
                </div>
              </Card>
              <Card title={'Next schedule'} icon="calendar">
                <h3>10:30 WIB</h3>
                <p>Zone A fertigation, RTN-002</p>
                <SourceTag>Each run retains its profile version</SourceTag>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { kindIcons, kindLabels, routineStatus, triggerLabel } from './presentation';
