import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { Alert, Badge, Button, Empty, Icon, Meta } from '../../components/ui';
import { clockTime, dateLabel, duration } from '../../domain/format';
import { availableDevices, nextOccurrence } from '../../domain/scheduler';
import { kindIcons, routineStatus, triggerLabel } from './presentation';

export function RoutineDetails({ ctx, id }: { ctx: PageContext; id: string }) {
  const { s } = ctx,
    r = s.routines.find((r) => r.id === id);
  if (!r) return <Empty title={'Routine not found'} />;
  const next = nextOccurrence(r, s.clock),
    devices = availableDevices(s),
    missing = r.version.requiredDevices.filter(
      (id) =>
        !devices.some(
          (d) => d.id === id && d.connection === 'online' && d.calibrated && !d.maintenance,
        ),
    );
  return (
    <div className="page-stack">
      <div className="detail-title">
        <span className="big-soft-icon">
          <Icon name={kindIcons[r.kind]} size={27} />
        </span>
        <div>
          <h2>{displayLabel(r.name)}</h2>
          <p>
            {displayLabel(r.id)}, version {displayLabel(r.version.number)}
          </p>
        </div>
        <Badge
          tone={r.status === 'Active' ? 'green' : r.status === 'Needs review' ? 'amber' : 'gray'}
          dot
        >
          {displayLabel(routineStatus(r))}
        </Badge>
      </div>
      <p className="muted">{displayLabel(r.description)}</p>
      <Meta
        items={[
          { label: 'Zone', value: r.version.zones.map((z) => 'Zone ' + z).join(', ') },
          { label: 'Trigger', value: triggerLabel(r) },
          {
            label: 'Policy',
            value:
              r.policy === 'automatic'
                ? 'Automatic after activation'
                : r.policy === 'approval'
                  ? 'Request approval per occurrence'
                  : 'Create operator task',
          },
          {
            label: 'Next',
            value: next
              ? `${dateLabel(next)}, ${clockTime(next)} WIB`
              : 'Triggered by sensor condition / another run',
          },
          { label: 'Shared resource', value: r.version.resource ?? 'No actuator' },
          {
            label: 'Daily limits',
            value: `${r.version.maxCyclesPerDay} cycles, ${r.version.maxWaterPerDay} L (estimated)`,
          },
        ]}
      />
      <div>
        <h3>Step sequence</h3>
        <div className="compact-steps">
          {r.version.steps.map((step, i) => (
            <div key={step.id}>
              <span>{i + 1}</span>
              <div>
                <strong>{displayLabel(step.label)}</strong>
                <small>
                  {displayLabel(
                    step.duration ? duration(step.duration) + ' minutes' : 'Operator task',
                  )}
                  , {displayLabel(step.deviceIds.join(', ') || 'Local check')}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3>Devices used</h3>
        <div className="chip-list">
          {r.version.requiredDevices.map((id) => (
            <button
              key={id}
              onClick={() => ctx.nav(`/perangkat?device=${id}`)}
              className={missing.includes(id) ? 'warning' : ''}
            >
              {displayLabel(id)}
              <Icon name="external" size={12} />
            </button>
          ))}
        </div>
      </div>
      {missing.length > 0 ? (
        <Alert title={'Operating conditions unavailable'}>
          {displayLabel(missing.join(', '))}. Execution will be held until required data is
          available.
        </Alert>
      ) : (
        <Alert tone="green" title={'Initial conditions available'}>
          Flow feedback and operating limits must still be checked during execution.
        </Alert>
      )}
      <div className="button-row wrap">
        <Button
          permission="automation"
          tone="primary"
          small
          icon={r.status === 'Active' ? 'pause' : 'play'}
          onClick={async () =>
            r.status === 'Active' || r.status === 'Paused'
              ? await ctx.act({ type: 'routine_toggle', id: r.id })
              : ctx.open('activate-routine', r.id)
          }
        >
          {displayLabel(
            r.status === 'Active'
              ? 'Pause routine'
              : r.status === 'Paused'
                ? 'Resume'
                : 'Review & activate',
          )}
        </Button>
        <Button
          permission="automation"
          small
          icon="edit"
          onClick={() => ctx.nav(`/otomasi?tab=builder&routine=${r.id}`)}
        >
          Edit
        </Button>
        <Button small onClick={() => ctx.open('dry-run', r.id)}>
          Check rules
        </Button>
      </div>
      <div className="button-row">
        <Button
          permission="run"
          small
          icon="play"
          onClick={() => ctx.nav(`/otomasi?tab=preview&routine=${r.id}`)}
        >
          Preview routine
        </Button>
        {r.trigger.type === 'schedule' && (
          <Button
            permission="automation"
            small
            icon="clock"
            onClick={async () => await ctx.act({ type: 'skip_once', id: r.id })}
          >
            Skip once
          </Button>
        )}
      </div>
    </div>
  );
}
