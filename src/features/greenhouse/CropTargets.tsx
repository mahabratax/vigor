import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { value } from '../../app/context';
import { Alert, Badge, Button, Empty, Field, FormBox, Modal, Select } from '../../components/ui';
import { activeBatch } from '../../domain/zones';
import { PLANT_STAGES, type PlantStage } from '../../domain/zoneTypes';
import { TARGET_METRICS, type TargetLimits } from '../../domain/growingTypes';
import {
  activeTarget,
  metricInfo,
  targetState,
  zoneTargetReadings,
} from '../../domain/cropTargets';
import { dateLabel, number } from '../../domain/format';

export function CropTargets({ ctx, zoneId }: { ctx: PageContext; zoneId: string }) {
  const { s } = ctx,
    batch = activeBatch(s, zoneId);
  const [stage, setStage] = useState<PlantStage>(batch?.stage ?? 'Vegetatif'),
    [editing, setEditing] = useState(false);
  if (!batch)
    return (
      <Empty
        title={'Record a planting batch first'}
        detail={'Targets follow the crop, variety, and stage of the active batch.'}
        action={
          <Button onClick={() => ctx.nav(`/greenhouse?tab=zones&zone=${zoneId}&panel=plants`)}>
            Open crop details
          </Button>
        }
      />
    );
  const revisions = targetState(s).revisions.filter(
    (r) => r.batchId === batch.id && r.stage === stage,
  );
  const active = activeTarget(s, zoneId, stage),
    draft = revisions.find((r) => r.status === 'draft'),
    base = draft ?? active;
  const readings = zoneTargetReadings(s, zoneId),
    closed =
      s.production?.stage === 'closed' ||
      s.zones.find((z) => z.id === zoneId)?.status === 'inactive';
  return (
    <section className="growing-panel">
      <header className="growing-heading">
        <div>
          <h3>Crop targets</h3>
          <p>
            {displayLabel(batch.crop)}
            {displayLabel(batch.variety ? ` / ${batch.variety}` : '')} / {displayLabel(batch.id)}
          </p>
        </div>
        <Button
          permission="crop_review"
          icon="edit"
          disabled={closed}
          onClick={() => setEditing(true)}
        >
          {displayLabel(base ? 'Edit targets' : 'Set targets')}
        </Button>
      </header>
      <div className="growing-toolbar">
        <Select
          label={'Crop target stage'}
          value={stage}
          onChange={(v) => setStage(v as PlantStage)}
          options={PLANT_STAGES.map((v) => ({ value: v, label: v }))}
        />
        <span>
          Current batch stage: <strong>{displayLabel(batch.stage)}</strong>
        </span>
        <Badge tone={active ? 'green' : 'gray'}>
          {displayLabel(active ? `Target v${active.version}` : 'No active target')}
        </Badge>
      </div>
      {stage !== batch.stage && (
        <Alert tone="blue">
          Stage preview {displayLabel(stage)}. This target applies when the batch reaches the
          matching stage.
        </Alert>
      )}
      {!active && (
        <p className="growing-explanation">
          Enter ranges from your reviewed growing plan. Values are not selected automatically from
          the crop name.
        </p>
      )}
      <div className="growing-table-scroll">
        <table className="growing-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Active range</th>
              <th>Current reading</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r) => {
              const info = metricInfo[r.metric],
                range = active?.limits[r.metric];
              const state =
                r.value === null
                  ? 'No data yet'
                  : !range
                    ? 'Not set'
                    : stage !== batch.stage
                      ? 'Stage preview'
                      : r.value < range.min
                        ? 'Below target'
                        : r.value > range.max
                          ? 'Above target'
                          : 'Within range';
              return (
                <tr key={r.metric}>
                  <th>
                    {displayLabel(info.label)}
                    <small>{displayLabel(r.device?.id ?? 'Sensor unavailable')}</small>
                  </th>
                  <td>
                    {displayLabel(
                      range ? `${number(range.min, 2)}–${number(range.max, 2)} ${info.unit}` : '—',
                    )}
                  </td>
                  <td>
                    {displayLabel(r.value === null ? '—' : `${number(r.value, 2)} ${info.unit}`)}
                    <small>{displayLabel(r.quality)}</small>
                  </td>
                  <td>
                    <Badge
                      tone={
                        state === 'Within range'
                          ? 'green'
                          : ['Below target', 'Above target'].includes(state)
                            ? 'amber'
                            : 'gray'
                      }
                    >
                      {displayLabel(state)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {draft && (
        <div className="growing-review-bar">
          <div>
            <strong>Draft v{draft.version} awaiting review</strong>
            <p>{displayLabel(draft.notes)}</p>
            <small>
              {displayLabel(
                TARGET_METRICS.filter((m) => draft.limits[m])
                  .map(
                    (m) =>
                      `${displayLabel(metricInfo[m].label)}: ${draft.limits[m]!.min}–${draft.limits[m]!.max} ${metricInfo[m].unit}`,
                  )
                  .join(' / '),
              )}
            </small>
          </div>
          <Button
            permission="crop_review"
            disabled={closed}
            tone="primary"
            onClick={async () =>
              await ctx.act({ type: 'target_activate', id: draft.id, actor: ctx.actor })
            }
          >
            Review & activate target
          </Button>
        </div>
      )}
      <p className="growing-explanation">
        Targets guide monitoring; they are not automatic agronomic advice. Review trigger
        parameters, doses, and device limits in Automation.
      </p>
      <Button
        small
        icon="workflow"
        onClick={() => ctx.nav(`/greenhouse?tab=operations&zone=${zoneId}`)}
      >
        Review zone automation
      </Button>
      {!!revisions.length && (
        <details className="growing-history">
          <summary>Version history ({revisions.length})</summary>
          {revisions.map((r) => (
            <article key={r.id}>
              <strong>
                v{r.version} /{' '}
                {displayLabel(
                  r.status === 'active'
                    ? 'Reviewed'
                    : r.status === 'draft'
                      ? 'Draft'
                      : 'Superseded',
                )}
              </strong>
              <p>{displayLabel(r.notes)}</p>
              <small>
                {displayLabel(r.crop)}
                {displayLabel(r.variety ? ` / ${r.variety}` : '')},{' '}
                {displayLabel(dateLabel(r.createdAt))}.{' '}
                {displayLabel(
                  r.reviewedBy ? `Reviewed by ${r.reviewedBy}` : `Created ${r.createdBy}`,
                )}
              </small>
            </article>
          ))}
        </details>
      )}
      {editing && (
        <Modal
          title={`Target ${displayLabel(batch.crop)} / ${stage}`}
          onClose={() => setEditing(false)}
          description={'Enter the parameters you need. Leave both limits empty if no range is set.'}
        >
          <FormBox
            onSubmit={async (f) => {
              const limits: TargetLimits = {};
              for (const metric of TARGET_METRICS) {
                const min = value(f, `${metric}Min`),
                  max = value(f, `${metric}Max`);
                if (!min && !max) continue;
                if (!min || !max)
                  return {
                    ok: false,
                    message: `Enter both limits ${displayLabel(metricInfo[metric].label)}.`,
                  };
                limits[metric] = { min: Number(min), max: Number(max) };
              }
              const result = await ctx.act({
                type: 'target_save',
                batchId: batch.id,
                stage,
                limits,
                notes: value(f, 'notes'),
                actor: ctx.actor,
              });
              if (result.ok) setEditing(false);
              return result;
            }}
          >
            <div className="target-range-fields">
              {TARGET_METRICS.map((metric) => (
                <fieldset key={metric}>
                  <legend>
                    {displayLabel(metricInfo[metric].label)}{' '}
                    {displayLabel(metricInfo[metric].unit && `(${metricInfo[metric].unit})`)}
                  </legend>
                  <Field label="Minimum">
                    <input
                      aria-label={`${displayLabel(metricInfo[metric].label)} minimum`}
                      name={`${metric}Min`}
                      type="number"
                      step="0.1"
                      min={metricInfo[metric].min}
                      max={metricInfo[metric].max}
                      defaultValue={base?.limits[metric]?.min ?? ''}
                    />
                  </Field>
                  <Field label={'Maximum'}>
                    <input
                      aria-label={`${displayLabel(metricInfo[metric].label)} maximum`}
                      name={`${metric}Max`}
                      type="number"
                      step="0.1"
                      min={metricInfo[metric].min}
                      max={metricInfo[metric].max}
                      defaultValue={base?.limits[metric]?.max ?? ''}
                    />
                  </Field>
                </fieldset>
              ))}
            </div>
            <Field label={'Target basis & notes'}>
              <textarea
                name="notes"
                required
                minLength={8}
                defaultValue={base?.notes ?? ''}
                placeholder={'Growing plan source, local conditions, and review notes'}
              />
            </Field>
            <div className="form-actions">
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button permission="crop_review" type="submit" tone="primary">
                Save target draft
              </Button>
            </div>
          </FormBox>
        </Modal>
      )}
    </section>
  );
}
