import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { value } from '../../app/context';
import { Alert, Badge, Button, Field, FormBox, Modal, Select } from '../../components/ui';
import { comparisonReadings, verdictLabels } from '../../domain/outcomes';
import type { OutcomeVerdict } from '../../domain/growingTypes';
import { metricInfo } from '../../domain/cropTargets';
import { clockTime, dateLabel, isActiveRun, number } from '../../domain/format';
export function RunOutcome({ ctx, runId }: { ctx: PageContext; runId: string }) {
  const [selected, setSelected] = useState(''),
    [reviewing, setReviewing] = useState(false),
    [reviewKey, setReviewKey] = useState('');
  const run = ctx.s.runs.find((r) => r.id === runId);
  if (!run) return null;
  const c = comparisonReadings(run, selected),
    latest = run.evidence?.reviews.filter((r) => r.afterId === c.after?.id).at(-1);
  const blocked =
    isActiveRun(run.status) || ['Scheduled', 'Needs reconciliation'].includes(run.status);
  return (
    <section className="run-outcome growing-panel" aria-label={`Outcome review ${run.id}`}>
      <header className="growing-heading">
        <div>
          <h3>Outcome review</h3>
          <p>{displayLabel(run.id)} / simulator readings and operator review</p>
        </div>
        {latest && <Badge tone="blue">Reviewed</Badge>}
      </header>
      {!c.before ? (
        <p className="growing-explanation">
          {displayLabel(
            run.policy === 'task'
              ? 'This run creates an operator task. Complete and record the work in Maintenance.'
              : 'No initial reading was captured for this run. New executions can capture evidence when started; historical evidence is not reconstructed.',
          )}
        </p>
      ) : (
        <>
          <div className="growing-toolbar">
            <span>
              Before: {displayLabel(dateLabel(c.before.at))},{' '}
              {displayLabel(clockTime(c.before.at, true))} WIB
            </span>
            {c.snapshots.length > 0 ? (
              <Select
                label={'After-reading for review'}
                value={c.after?.id ?? ''}
                onChange={setSelected}
                options={c.snapshots.map((x, i) => ({
                  value: x.id,
                  label: `${i === 0 ? 'At completion' : 'Follow-up ' + i} / ${dateLabel(x.at)}, ${clockTime(x.at, true)}`,
                }))}
              />
            ) : (
              <span>Awaiting completion</span>
            )}
          </div>
          {c.changedScenario && (
            <Alert tone="amber">
              The two readings use different sample scenarios. A numeric change does not prove an
              action's effect.
            </Alert>
          )}
          <div className="growing-table-scroll">
            <table className="growing-table">
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row) => (
                  <tr key={`${row.before.deviceId}-${row.before.metric}`}>
                    <th>
                      {displayLabel(metricInfo[row.before.metric].label)}
                      <small>
                        {displayLabel(row.before.deviceId)} /{' '}
                        {displayLabel(row.before.zoneIds.map((id) => `Zone ${id}`).join(', '))}
                      </small>
                    </th>
                    <td>
                      {displayLabel(
                        row.before.value === null
                          ? '—'
                          : `${number(row.before.value, 2)} ${row.before.unit}`,
                      )}
                      <small>{displayLabel(row.before.quality)}</small>
                    </td>
                    <td>
                      {displayLabel(
                        row.after?.value == null
                          ? '—'
                          : `${number(row.after.value, 2)} ${row.after.unit}`,
                      )}
                      <small>{displayLabel(row.after?.quality ?? 'Not captured')}</small>
                    </td>
                    <td>
                      {displayLabel(
                        row.delta === null
                          ? 'Insufficient data'
                          : `${row.delta > 0 ? '+' : ''}${number(row.delta, 2)} ${row.before.unit}`,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {c.rows.some((r) => r.before.targets.length > 0) && (
            <p className="growing-explanation">
              Target at start:{' '}
              {displayLabel(
                c.rows
                  .flatMap((r) =>
                    r.before.targets.map(
                      (t) =>
                        `${r.before.deviceId} ${displayLabel(metricInfo[r.before.metric].label)}, zone ${t.zoneId}: ${t.min}–${t.max} ${r.before.unit} (${t.revisionId})`,
                    ),
                  )
                  .join('; '),
              )}
              .
            </p>
          )}
          <div className="button-row">
            <Button
              small
              permission="cultivation"
              disabled={
                blocked ||
                !c.after ||
                ctx.s.clock <=
                  (run.evidence!.followUps.at(-1)?.at ?? run.evidence!.after?.at ?? 0) ||
                run.evidence!.followUps.length >= 12
              }
              onClick={async () => {
                const result = await ctx.act({ type: 'outcome_capture', runId, actor: ctx.actor });
                if (result.ok) setSelected(result.id ?? '');
              }}
            >
              Capture follow-up reading
            </Button>
            <Button
              small
              permission="cultivation"
              disabled={blocked || !c.after}
              onClick={() => {
                setReviewKey(`review-${Date.now()}-${Math.random().toString(36).slice(2)}`);
                setReviewing(true);
              }}
            >
              Record outcome review
            </Button>
          </div>
          {latest && (
            <div className="outcome-assessment">
              <strong>{displayLabel(verdictLabels[latest.verdict])}</strong>
              <p>{displayLabel(latest.notes)}</p>
              <small>
                {displayLabel(latest.actor)}, {displayLabel(dateLabel(latest.at))} / penilaian
                petugas
              </small>
            </div>
          )}
          {!!run.evidence?.reviews.length && (
            <details className="growing-history">
              <summary>Review history ({run.evidence.reviews.length})</summary>
              {run.evidence.reviews
                .slice()
                .reverse()
                .map((r) => (
                  <article key={r.id}>
                    <strong>{displayLabel(verdictLabels[r.verdict])}</strong>
                    <p>{displayLabel(r.notes)}</p>
                    <small>
                      {displayLabel(r.actor)} / {displayLabel(r.afterId)} /{' '}
                      {displayLabel(dateLabel(r.at))}
                    </small>
                  </article>
                ))}
            </details>
          )}
        </>
      )}
      <p className="growing-explanation">
        Values reflect the source at capture time. A follow-up must be later than the previous
        observation. Reviewing does not automatically close pest cases or prove crop recovery.
      </p>
      {reviewing && c.after && (
        <Modal
          title={'Record outcome review'}
          description={`${run.id} / ${clockTime(c.after.at, true)} WIB`}
          onClose={() => setReviewing(false)}
        >
          <FormBox
            onSubmit={async (f) => {
              const result = await ctx.act({
                type: 'outcome_review',
                runId,
                afterId: c.after!.id,
                verdict: value(f, 'verdict') as OutcomeVerdict,
                notes: value(f, 'notes'),
                key: reviewKey,
                actor: ctx.actor,
              });
              if (result.ok) setReviewing(false);
              return result;
            }}
          >
            <Field label={'Operator assessment'}>
              <select name="verdict" defaultValue="inconclusive">
                {Object.entries(verdictLabels).map(([id, label]) => (
                  <option key={id} value={id}>
                    {displayLabel(label)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={'Outcome notes'}>
              <textarea
                name="notes"
                minLength={8}
                required
                placeholder={'What changed, what remains unknown, and the next step'}
              />
            </Field>
            <div className="form-actions">
              <Button onClick={() => setReviewing(false)}>Cancel</Button>
              <Button type="submit" permission="cultivation" tone="primary">
                Save outcome review
              </Button>
            </div>
          </FormBox>
        </Modal>
      )}
    </section>
  );
}
