import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { Alert, Badge, Button, Card, Empty, Select } from '../../components/ui';
import { updateQuery } from '../../app/context';
import { previewRoutine } from '../../domain/routinePreview';
import { number } from '../../domain/format';
export function RoutinePreview({ ctx }: { ctx: PageContext }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const routine =
    ctx.s.routines.find((r) => r.id === ctx.query.get('routine')) ?? ctx.s.routines[0];
  if (!routine)
    return (
      <Card>
        <Empty
          title="No routines to preview"
          detail="Create a routine with its zones, devices and operating limits first."
          action={
            <Button permission="automation" onClick={() => ctx.nav('/otomasi?tab=builder')}>
              Create routine
            </Button>
          }
        />
      </Card>
    );
  const result = previewRoutine(ctx.s, routine.id, now);
  return (
    <div className="page-stack">
      <Card
        title="Routine preview"
        subtitle="Check the saved configuration against current data. This preview does not create executions or change stock and expenses."
      >
        <div className="button-row wrap">
          <Select
            label="Routine"
            value={routine.id}
            onChange={(id) => updateQuery(ctx, '/otomasi', { routine: id, tab: 'preview' })}
            options={ctx.s.routines.map((r) => ({ value: r.id, label: r.name }))}
          />
          <Button onClick={() => setNow(Math.floor(Date.now() / 1000))} icon="refresh">
            Check again
          </Button>
        </div>
        <Alert
          title={
            result.status === 'blocked'
              ? 'Resolve these conditions first'
              : 'Configuration checks passed'
          }
          tone={result.status === 'blocked' ? 'amber' : 'green'}
        >
          {displayLabel(
            result.blockers.length ? (
              <ul>
                {result.blockers.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              'The saved inputs pass the current checks. A live controller and scheduler are not connected.'
            ),
          )}
        </Alert>
        <div className="button-row wrap">
          <Button
            onClick={() => ctx.nav(`/otomasi?tab=builder&routine=${routine.id}`)}
            permission="automation"
          >
            Edit routine
          </Button>
          <Button onClick={() => ctx.nav('/settings?tab=ai')}>Review sensor evidence</Button>
        </div>
      </Card>
      <Card title="Planned steps" tools={<Badge>Read-only preview</Badge>}>
        <ol className="routine-preview-steps">
          {result.steps.map((step) => (
            <li key={step.id}>
              <strong>{displayLabel(step.label)}</strong>
              <span>
                {step.duration} sec · {displayLabel(step.deviceIds.join(', ') || 'Operator task')}
              </span>
            </li>
          ))}
        </ol>
        <p className="micro muted">
          Planned duration: {displayLabel(number(result.estimates.durationSeconds))} seconds.
          Estimated water: {displayLabel(number(result.estimates.waterLiters, 1))} L at the
          configured flow rate. These estimates are not recorded usage or savings.
        </p>
      </Card>
    </div>
  );
}
