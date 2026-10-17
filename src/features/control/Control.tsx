import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Icon,
  Meta,
  SourceTag,
  Stat,
  Tabs,
} from '../../components/ui';
import { assets } from '../../data/assets';
import { dateLabel, duration, runLabels } from '../../domain/format';
const labels = {
  draft: 'Draft',
  awaiting_approval: 'Awaiting approval',
  approved: 'Disetujui',
  running: 'In progress',
  monitoring: 'Follow-up monitoring',
  completed: 'Completed',
  cancelled: 'Voided',
};
export function Control(ctx: PageContext) {
  const { s } = ctx,
    tab = ctx.query.get('tab') ?? 'plans',
    p = s.plans.find((p) => p.id === ctx.query.get('plan')) ?? s.plans[0];
  const run = p?.runId ? s.runs.find((r) => r.id === p.runId) : null;
  return (
    <div className="page-stack">
      <div className="stats three">
        <Stat
          icon="alert"
          tone="amber"
          label={'Awaiting approval'}
          value={s.plans.filter((p) => p.status === 'awaiting_approval').length}
          sub={'Awaiting operator review'}
        />
        <Stat
          icon="shield"
          label={'Execution & monitoring'}
          value={s.plans.filter((p) => ['running', 'monitoring'].includes(p.status)).length}
          sub="Effectiveness still needs review"
        />
        <Stat
          icon="checkcircle"
          label={'Completed after evaluation'}
          value={s.plans.filter((p) => p.status === 'completed').length}
          sub={'Closed by operator'}
        />
      </div>
      <Tabs
        value={tab}
        onChange={(v) => updateQuery(ctx, '/pengendalian', { tab: v })}
        items={[
          { id: 'plans', label: 'Action plan' },
          { id: 'simulator', label: 'Control device' },
          { id: 'evaluation', label: 'Evaluation' },
        ]}
      />
      {tab === 'plans' && (
        <div className="control-grid">
          <div className="page-stack">
            <Card title={'Active case'} icon="bug">
              <div className="case-list">
                {s.cases
                  .filter((c) => c.status !== 'closed')
                  .map((c) => (
                    <button
                      className="case-item compact"
                      key={c.id}
                      onClick={() => ctx.nav(`/hama?case=${c.id}`)}
                    >
                      <img
                        src={c.zoneId === 'B' ? assets.evidence : assets.camera}
                        alt="Gambar referensi desain"
                      />
                      <span>
                        <strong>Zone {displayLabel(c.zoneId)}</strong>
                        <small>{displayLabel(c.id)}</small>
                        <Badge tone={c.verified ? 'green' : 'amber'}>
                          {displayLabel(c.verified ? 'Verified by operator' : 'Inspection needed')}
                        </Badge>
                      </span>
                      <Icon name="chevron" size={14} />
                    </button>
                  ))}
              </div>
            </Card>
            <Card
              title={'Control plan'}
              tools={
                <Button
                  permission="control"
                  small
                  tone="ghost"
                  icon="plus"
                  ariaLabel="Create plan"
                  onClick={() => ctx.open('plan', 'INS-024')}
                />
              }
            >
              <div className="routine-list">
                {s.plans.map((plan) => (
                  <button
                    key={plan.id}
                    className={`routine-item ${p?.id === plan.id ? 'selected' : ''}`}
                    onClick={() => updateQuery(ctx, '/pengendalian', { plan: plan.id })}
                  >
                    <span className="soft-icon">
                      <Icon name={plan.kind === 'simulator' ? 'devices' : 'leaf'} />
                    </span>
                    <span>
                      <strong>{displayLabel(plan.title)}</strong>
                      <small>
                        {displayLabel(plan.id)}, Zone {displayLabel(plan.zoneId)}
                      </small>
                      <Badge tone={plan.status === 'awaiting_approval' ? 'amber' : 'green'}>
                        {displayLabel(labels[plan.status])}
                      </Badge>
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
          {p ? (
            <Card
              title={`Plan for Zone ${p.zoneId}`}
              subtitle={`${p.id}, ${p.caseId}`}
              tools={
                <Badge tone={p.status === 'awaiting_approval' ? 'amber' : 'green'}>
                  {displayLabel(labels[p.status])}
                </Badge>
              }
            >
              <div className="stage-track">
                {['Inspection', 'Plan', 'Pelaksanaan', 'Evaluation'].map((x, i) => (
                  <div
                    key={x}
                    className={
                      i <
                      (['approved', 'running', 'monitoring', 'completed'].includes(p.status)
                        ? 3
                        : 2)
                        ? 'done'
                        : ''
                    }
                  >
                    <span>{i < 2 ? <Icon name="check" size={12} /> : i + 1}</span>
                    <small>{displayLabel(x)}</small>
                  </div>
                ))}
              </div>
              <h3>{displayLabel(p.title)}</h3>
              <p className="muted">{displayLabel(p.notes)}</p>
              <Meta
                items={[
                  {
                    label: 'Method',
                    value:
                      p.kind === 'manual'
                        ? 'Manual nonchemical task'
                        : p.kind === 'simulator'
                          ? 'Virtual test module on CTRL-01'
                          : 'Expert review plan',
                  },
                  { label: 'Assigned to', value: p.operator },
                  {
                    label: 'Source evidence',
                    value: (
                      <button
                        className="text-link"
                        onClick={() => ctx.nav(`/hama?case=${p.caseId}`)}
                      >
                        {displayLabel(p.caseId)}
                        <Icon name="external" size={13} />
                      </button>
                    ),
                  },
                ]}
              />
              {p.kind === 'manual' ? (
                <div className="task-list">
                  {p.tasks.map((t) => (
                    <label key={t.id} className={`task ${t.done ? 'done' : ''}`}>
                      <input
                        type="checkbox"
                        checked={t.done}
                        disabled={['draft', 'awaiting_approval', 'completed'].includes(p.status)}
                        onChange={async () =>
                          await ctx.act({ type: 'plan_task', id: p.id, taskId: t.id })
                        }
                      />
                      <span>
                        <strong>{displayLabel(t.label)}</strong>
                        <small>
                          {displayLabel(
                            t.done
                              ? 'Marked completed by operator'
                              : 'Physical tasks do not complete just because time has elapsed',
                          )}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="simulation-profile">
                  <span className="big-soft-icon">
                    <Icon name="shield" size={30} />
                  </span>
                  <div>
                    <h3>Pest deterrent simulator</h3>
                    <p>Mechanism not selected / test module.</p>
                    <div className="inline-wrap">
                      <SourceTag>{displayLabel(duration(p.durationSeconds))} minutes</SourceTag>
                      <SourceTag>Effectiveness not evaluated</SourceTag>
                    </div>
                  </div>
                </div>
              )}
              {run && (
                <Alert
                  tone={run.status === 'Needs reconciliation' ? 'red' : 'blue'}
                  title={`${run.id}, ${runLabels[run.status]}`}
                  action={
                    <Button small onClick={() => ctx.nav(`/otomasi?tab=executions&run=${run.id}`)}>
                      View execution
                    </Button>
                  }
                >
                  {displayLabel(run.reason)}
                </Alert>
              )}
              {p.status === 'awaiting_approval' && (
                <Button
                  permission="control"
                  tone="primary"
                  icon="shield"
                  className="full-width"
                  onClick={() => ctx.open('approve-plan', p.id)}
                >
                  Review and approve plan
                </Button>
              )}
              {p.status === 'approved' && p.kind === 'simulator' && (
                <Button
                  permission="run"
                  tone="primary"
                  icon="play"
                  className="full-width"
                  disabled={!!s.readings}
                  title={s.readings ? 'Gateway not connected.' : undefined}
                  onClick={() => ctx.open('start-plan', p.id)}
                >
                  Start simulation
                </Button>
              )}
              <div className="detail-actions">
                <Button
                  permission="control"
                  icon="calendar"
                  onClick={() => ctx.open('evaluate', p.id)}
                >
                  Schedule / record evaluation
                </Button>
                <Button
                  icon="history"
                  tone="ghost"
                  onClick={() => ctx.nav(`/riwayat?search=${p.id}`)}
                >
                  View history
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <Empty
                title={'No plans yet'}
                illustration="inspection"
                detail={'Start by inspecting plants in the related case.'}
                action={<Button onClick={() => ctx.nav('/hama')}>Open inspection</Button>}
              />
            </Card>
          )}
          <div className="page-stack">
            <Card title={'Next evaluation'} icon="calendar">
              {p?.evaluationAt ? (
                <>
                  <div className="next-evaluation">
                    <strong>{displayLabel(dateLabel(p.evaluationAt, true))}</strong>
                    <span>{displayLabel(p.operator)}</span>
                  </div>
                  <div className="task-list">
                    <div className="task">
                      <Icon name="check" size={16} />
                      <span>Use matching observation intervals.</span>
                    </div>
                    <div className="task">
                      <Icon name="eye" size={16} />
                      <span>Compare trap evidence with plant inspection findings.</span>
                    </div>
                  </div>
                  <Button
                    permission="control"
                    small
                    className="full-width"
                    onClick={() => ctx.open('evaluate', p.id)}
                  >
                    Record evaluation
                  </Button>
                </>
              ) : (
                <Empty title={'Not scheduled'} icon="calendar" />
              )}
            </Card>
            <Alert tone="blue" title={'Execution is only one step'}>
              A completed action does not prove pest removal. Close the case after reviewing
              outcomes.
            </Alert>
            <Card title={'Preventive routines'} icon="workflow">
              <p className="muted">
                Reviewed routines can follow an automatic policy without approval for every
                execution.
              </p>
              <Button
                small
                icon="arrow"
                onClick={() => ctx.nav('/otomasi?tab=routines&routine=RTN-005')}
              >
                Open linked routine
              </Button>
            </Card>
          </div>
        </div>
      )}
      {tab === 'simulator' && (
        <div className="two-column">
          <Card
            title={'Pest deterrent simulator'}
            icon="shield"
            tools={
              <Badge
                tone={
                  s.devices.find((d) => d.id === 'CTRL-01')?.connection === 'online'
                    ? 'green'
                    : 'amber'
                }
                dot
              >
                {displayLabel(
                  s.devices.find((d) => d.id === 'CTRL-01')?.connection === 'online'
                    ? 'Controller online'
                    : 'Controller offline',
                )}
              </Badge>
            }
          >
            <div className="simulation-profile">
              <span className="device-illustration">
                <Icon name="devices" size={72} />
              </span>
              <div>
                <h3>Test device profile</h3>
                <p>Linked to sample controller CTRL-01</p>
                <Meta
                  items={[
                    { label: 'Mechanism', value: 'Not selected / test module' },
                    { label: 'Assumed controller power', value: '5 W, estimated' },
                    { label: 'Target pest', value: 'Belum ditentukan' },
                    { label: 'Effectiveness', value: 'Not evaluated' },
                  ]}
                />
              </div>
            </div>
            <Alert tone="blue">
              No physical device control or pesticide spraying. No universal pest deterrence
              mechanism is claimed.
            </Alert>
            <div className="detail-actions">
              <Button onClick={() => ctx.nav('/perangkat?device=CTRL-01')} icon="devices">
                Controller details
              </Button>
              <Button
                onClick={() => ctx.nav('/otomasi?tab=routines&routine=RTN-005')}
                icon="workflow"
              >
                Preventive routines
              </Button>
            </div>
          </Card>
          <Card title={'Plans ready for simulation'} icon="play">
            {s.plans.filter((p) => p.kind === 'simulator' && p.status === 'approved').length ? (
              s.plans
                .filter((p) => p.kind === 'simulator' && p.status === 'approved')
                .map((p) => (
                  <div className="action-row" key={p.id}>
                    <span>
                      <strong>{displayLabel(p.title)}</strong>
                      <small>
                        {displayLabel(p.id)}, {displayLabel(p.caseId)}, Zone{' '}
                        {displayLabel(p.zoneId)}
                      </small>
                    </span>
                    <Button
                      permission="run"
                      tone="primary"
                      small
                      disabled={!!s.readings}
                      title={s.readings ? 'Gateway not connected.' : undefined}
                      onClick={() => ctx.open('start-plan', p.id)}
                    >
                      Review & start
                    </Button>
                  </div>
                ))
            ) : (
              <Empty
                title={'No approved plans'}
                detail={
                  'Record an inspection, create a test-module plan, then review and approve it.'
                }
                action={
                  <Button onClick={() => ctx.nav('/hama?case=INS-024')}>Open Zone B case</Button>
                }
              />
            )}
          </Card>
        </div>
      )}
      {tab === 'evaluation' && (
        <div className="two-column">
          <Card title={'Control outcome evaluation'} icon="eye">
            {s.plans
              .filter((p) => p.evaluationAt)
              .map((p) => (
                <div className="action-row" key={p.id}>
                  <span>
                    <strong>{displayLabel(p.title)}</strong>
                    <small>
                      {displayLabel(p.id)},{' '}
                      {displayLabel(p.evaluationAt ? dateLabel(p.evaluationAt) : 'Not scheduled')},{' '}
                      {displayLabel(p.operator)}
                    </small>
                  </span>
                  <Button
                    permission="control"
                    small
                    icon="file"
                    onClick={() => ctx.open('evaluate', p.id)}
                  >
                    Record outcome
                  </Button>
                </div>
              ))}
          </Card>
          <Card title={'Before & after'} icon="bug">
            <Empty
              title={'Awaiting follow-up observations'}
              detail={'Comparisons require matching intervals and available data.'}
              icon="history"
            />
            <Alert tone="blue">
              A drop in captures alone does not prove that Vigor's actions caused it.
            </Alert>
          </Card>
        </div>
      )}
    </div>
  );
}
