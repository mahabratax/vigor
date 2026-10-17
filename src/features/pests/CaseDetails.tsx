import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { TrendChart } from '../../components/charts';
import { CameraPreview, SensorCard } from '../../components/monitoring';
import { Alert, Badge, Button, Card, Empty, Icon, Meta } from '../../components/ui';
import { clockTime, dateLabel } from '../../domain/format';
import { trendData } from '../../domain/selectors';
import { assessDetection } from '../../domain/detection';

export function CaseDetails({ ctx, id }: { ctx: PageContext; id: string }) {
  const { s } = ctx,
    c = s.cases.find((c) => c.id === id);
  if (!c)
    return (
      <Empty
        title="Case not found"
        detail={`${id} is not available in this greenhouse. Select a case from the current list.`}
        action={<Button onClick={() => ctx.nav('/hama?tab=cases')}>View available cases</Button>}
      />
    );
  const inspections = s.inspections.filter((i) => i.caseId === c.id);
  const plans = s.plans.filter((p) => p.caseId === c.id);
  const assessment = assessDetection(s, c.zoneId);
  return (
    <div className="page-stack case-details">
      <div className="detail-title">
        <div>
          <div className="inline-wrap">
            <span className="detail-reference">
              Case {displayLabel(c.id)}, Zone {displayLabel(c.zoneId)}
            </span>
            <Badge
              tone={c.status === 'closed' ? 'green' : c.status === 'monitoring' ? 'blue' : 'amber'}
            >
              {displayLabel(
                c.status === 'closed'
                  ? 'Completed'
                  : c.status === 'monitoring'
                    ? 'Follow-up monitoring'
                    : 'Inspection needed',
              )}
            </Badge>
          </div>
          <h2>{displayLabel(c.title)}</h2>
          <p>
            {displayLabel(dateLabel(c.createdAt))}, {displayLabel(clockTime(c.createdAt))} WIB,{' '}
            {displayLabel(c.sourceDeviceId)}
          </p>
        </div>
        <Button
          small
          icon="devices"
          onClick={() => ctx.nav(`/perangkat?device=${c.sourceDeviceId}`)}
        >
          Source device
        </Button>
      </div>
      <div className="evidence-grid">
        <div>
          <CameraPreview s={s} deviceId={c.sourceDeviceId} compact />
          <p className="evidence-caption">
            Trap reference image. Image markers are not AI analysis results.
          </p>
        </div>
        <Card
          title={'Observation trend'}
          subtitle={'Matching intervals: 24 hours.'}
          variant="plain"
        >
          <TrendChart data={trendData(s)} keys={[c.zoneId]} height={200} />
          <p className="micro muted">
            Traps are an observation indicator, not a standalone diagnosis.
          </p>
        </Card>
      </div>
      <Alert
        tone={c.verified ? 'green' : 'amber'}
        title={c.verified ? 'Inspection results recorded' : 'Suspected pest not verified'}
      >
        {displayLabel(
          c.verified
            ? 'Control decisions still require evidence and operator review.'
            : 'Analysis uses sample observations. Captured insects are not necessarily crop pests.',
        )}
      </Alert>
      <div className="case-signal-link">
        <div>
          <strong>
            {displayLabel(
              c.detectionSignal
                ? 'Monitoring trigger when the case was linked'
                : 'Review zone observations',
            )}
          </strong>
          <p>
            {displayLabel(
              c.detectionSignal
                ? `${c.detectionSignal.values.join(' → ')} captures per 24 hours. Recorded ${dateLabel(c.detectionSignal.triggeredAt)}, ${clockTime(c.detectionSignal.triggeredAt)} WIB. The rule snapshot is retained when data changes.`
                : 'Review source quality, observation comparisons, and follow-up reasons.',
            )}
          </p>
        </div>
        <Button
          small
          icon="eye"
          onClick={() => ctx.nav(`/hama?tab=detection&reviewZone=${c.zoneId}`)}
        >
          Review detection
        </Button>
      </div>
      <div className="analysis-grid">
        <Card title={'Observation summary'} variant="plain">
          <Meta
            items={[
              {
                label: 'Current observations',
                value: assessment.reason,
              },
              {
                label: 'Supporting evidence',
                value: `Trap reference photo, 24-hour interval, ${c.sourceDeviceId}.`,
              },
              {
                label: 'Unavailable',
                value: c.verified
                  ? 'Evaluate effectiveness after action.'
                  : 'Verify the insect type and inspect plants.',
              },
              {
                label: 'Next step',
                value: c.verified
                  ? 'Review the plan and schedule follow-up observations.'
                  : 'Assign an operator and inspect plants.',
              },
            ]}
          />
        </Card>
        <Card title={'Follow up'} variant="plain">
          <Meta
            items={[
              { label: 'Assigned to', value: c.assignedTo ?? 'Not set' },
              { label: 'Recorded inspections', value: `${inspections.length} inspeksi` },
              {
                label: 'Next evaluation',
                value: c.followUpAt ? dateLabel(c.followUpAt) : 'Not scheduled',
              },
            ]}
          />
          {!c.assignedTo && (
            <Button
              permission="inspection"
              small
              onClick={async () =>
                await ctx.act({
                  type: 'assign',
                  caseId: c.id,
                  operator: ctx.actor ?? 'Budi Santoso',
                })
              }
              icon="users"
            >
              Assign {displayLabel(ctx.actor ?? 'Budi Santoso')}
            </Button>
          )}
          <div className="two-sensors top-gap">
            <SensorCard s={s} id={`TH-${c.zoneId}-01`} compact />
            <SensorCard s={s} id={`TH-${c.zoneId}-01`} humidity compact />
          </div>
        </Card>
      </div>
      {inspections.length > 0 && (
        <Card title={'Plant inspection findings'} icon="file">
          {inspections.map((i) => (
            <div className="inspection-result" key={i.id}>
              <div>
                <strong>{displayLabel(i.operator)}</strong>
                <small>
                  {displayLabel(dateLabel(i.at))}, {displayLabel(clockTime(i.at))} WIB,{' '}
                  {displayLabel(i.id)}
                </small>
              </div>
              <Badge tone="blue">
                {i.examined} inspected, {i.affected} with symptoms
              </Badge>
              <p>{displayLabel(i.notes)}</p>
              <span className="micro muted">
                Decision:{' '}
                {displayLabel(
                  i.outcome === 'indication'
                    ? 'Signs found'
                    : i.outcome === 'not_found'
                      ? 'Not found'
                      : 'Inconclusive',
                )}
              </span>
              {displayLabel(
                i.attachmentName && <small>Session attachment: {i.attachmentName}</small>,
              )}
            </div>
          ))}
        </Card>
      )}
      {plans.length > 0 && (
        <div className="linked-items">
          {plans.map((p) => (
            <button key={p.id} onClick={() => ctx.nav(`/pengendalian?plan=${p.id}`)}>
              <Icon name="link" size={16} />
              {displayLabel(p.id)}, {displayLabel(p.title)}
            </button>
          ))}
        </div>
      )}
      <div className="detail-actions">
        <Button
          permission="inspection"
          tone="primary"
          icon="file"
          onClick={() => ctx.open('inspection', c.id)}
        >
          Record inspection
        </Button>
        <Button
          permission="control"
          icon="leaf"
          disabled={!inspections.length}
          title={!inspections.length ? 'Record a plant inspection first.' : undefined}
          onClick={() => ctx.open('plan', c.id)}
        >
          Create control plan
        </Button>
      </div>
    </div>
  );
}
