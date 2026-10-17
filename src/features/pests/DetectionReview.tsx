import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { Badge, Button, Icon } from '../../components/ui';
import { CameraPreview } from '../../components/monitoring';
import { dateLabel, clockTime, number } from '../../domain/format';
import {
  DETECTION_RULE,
  detectionSummary,
  type DetectionAssessment,
  type DetectionCheck,
} from '../../domain/detection';

const tone = (a: DetectionAssessment) =>
  a.status === 'review' || a.status === 'watch'
    ? 'amber'
    : a.status === 'normal'
      ? 'green'
      : 'gray';

function ObservationProof({ assessment: a }: { assessment: DetectionAssessment }) {
  const rows = a.readings;
  const max = Math.max(
    30,
    ...rows.map((o) => o.newCaptures ?? 0).filter((n) => Number.isFinite(n) && n >= 0),
  );
  const y = (value: number) => 145 - (value / max) * 104;
  return (
    <figure className="observation-proof">
      <div className="observation-proof-heading">
        <h3>Three latest observations</h3>
        <span>New captures per 24 hours</span>
      </div>
      <svg
        viewBox="0 0 440 205"
        role="img"
        aria-label={`Zone ${a.zoneId}: ${rows.map((o) => o.newCaptures ?? 'missing data').join(', ')} captures. Sample count threshold: 20.`}
      >
        <line x1="27" x2="414" y1="145" y2="145" stroke="var(--line)" />
        <line
          x1="27"
          x2="414"
          y1={y(DETECTION_RULE.minimumCount)}
          y2={y(DETECTION_RULE.minimumCount)}
          stroke="var(--amber)"
          strokeDasharray="4 4"
        />
        <text
          x="413"
          y={y(DETECTION_RULE.minimumCount) - 7}
          textAnchor="end"
          className="proof-threshold"
        >
          Sample threshold: 20
        </text>
        {rows.map((o, i) => {
          const x = 82 + i * 132,
            value = o.newCaptures;
          const valid = value !== null && Number.isInteger(value) && value >= 0;
          return (
            <g key={o.id}>
              {valid ? (
                <rect
                  x={x - 24}
                  y={y(value!)}
                  width="48"
                  height={Math.max(1, 145 - y(value!))}
                  rx="4"
                  fill={i === 2 ? 'var(--green)' : 'var(--sage)'}
                  stroke="var(--green)"
                  strokeOpacity={i === 2 ? 0 : 0.35}
                />
              ) : (
                <rect
                  x={x - 24}
                  y="100"
                  width="48"
                  height="45"
                  rx="4"
                  fill="none"
                  stroke="var(--muted)"
                  strokeDasharray="3 3"
                />
              )}
              <text
                x={x}
                y={valid ? y(value!) - 9 : 90}
                textAnchor="middle"
                className="proof-value"
              >
                {displayLabel(valid ? value : '—')}
              </text>
              <text x={x} y="167" textAnchor="middle" className="proof-date">
                {displayLabel(
                  Number.isFinite(Date.parse(o.at))
                    ? dateLabel(o.at).replace(/ \d{4}$/, '')
                    : 'Invalid timestamp',
                )}
              </text>
              <text x={x} y="187" textAnchor="middle" className="proof-period">
                {displayLabel(valid ? `${o.intervalHours} hours` : 'Missing data')}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        {displayLabel(
          a.baseline === null
            ? 'Comparison is held until data meets quality requirements.'
            : `Two-interval baseline: ${number(a.baseline, 1)}. ${a.growthPercent === null ? 'A percentage cannot be calculated from a zero baseline.' : `Latest change ${a.growthPercent > 0 ? '+' : ''}${number(a.growthPercent, 1)}%.`}`,
        )}
      </figcaption>
    </figure>
  );
}

function Checks({
  title,
  checks,
  quality = false,
}: {
  title: string;
  checks: DetectionCheck[];
  quality?: boolean;
}) {
  return (
    <section className="detection-checks">
      <h3>{displayLabel(title)}</h3>
      <ul>
        {checks.map((c) => (
          <li key={c.id}>
            <span className={`detection-check-icon ${c.pass ? 'passed' : 'pending'}`}>
              <Icon name={c.pass ? 'checkcircle' : 'info'} size={17} />
            </span>
            <span>
              <strong>{displayLabel(c.label)}</strong>
              <small>{displayLabel(c.detail)}</small>
            </span>
            <span className="detection-check-state">
              {displayLabel(c.pass ? 'Terpenuhi' : quality ? 'Needs inspection' : 'Not met')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DetectionReview({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    summary = detectionSummary(s);
  const a =
    summary.zones.find((z) => z.zoneId === ctx.query.get('reviewZone')) ??
    summary.zones.find((z) => z.status === 'review') ??
    summary.zones[0];
  const quality = a.checks.slice(0, 6),
    rules = a.checks.slice(6);
  const last = a.readings.at(-1),
    linked = a.linkedCase;
  return (
    <div className="detection-review">
      <div className="detection-intro">
        <div>
          <h2>Decisions from observations</h2>
          <p>Review capture trends, data quality, and follow-up by zone.</p>
        </div>
        <Badge>Prototype rule</Badge>
      </div>
      <div className="detection-coverage" aria-label={'Detection review scope'}>
        <span>
          <Icon name="camera" size={16} />
          <strong>
            {summary.usable}/{s.zones.length}
          </strong>{' '}
          comparable zones
        </span>
        <span>
          <Icon name="bug" size={16} />
          <strong>{summary.review}</strong> need review
        </span>
        <span>
          <Icon name="info" size={16} />
          <strong>{summary.unavailable}</strong> cannot be assessed
        </span>
      </div>
      <div className="detection-workspace">
        <aside className="detection-zones" aria-label={'Select a zone to review'}>
          {summary.zones.map((z) => (
            <button
              key={z.zoneId}
              className={`detection-zone ${z.zoneId === a.zoneId ? 'selected' : ''}`}
              aria-label={`Review Zone ${z.zoneId}: ${z.title}`}
              aria-pressed={z.zoneId === a.zoneId}
              onClick={() =>
                updateQuery(ctx, '/hama', {
                  tab: 'detection',
                  reviewZone: z.zoneId,
                  case: undefined,
                })
              }
            >
              <span className="detection-zone-heading">
                <strong>Zone {displayLabel(z.zoneId)}</strong>
                <Icon
                  name={
                    z.status === 'review' ? 'alert' : z.status === 'unavailable' ? 'info' : 'eye'
                  }
                  size={17}
                />
              </span>
              <span className="detection-zone-count">
                {displayLabel(z.status === 'unavailable' ? '—' : z.latest)}
                <small>
                  {displayLabel(
                    z.status === 'unavailable' ? 'Data needs review' : 'captures / 24 hours',
                  )}
                </small>
              </span>
              <Badge tone={tone(z)}>{displayLabel(z.title)}</Badge>
            </button>
          ))}
        </aside>
        <section
          className="detection-detail"
          data-tour="inspection-review"
          aria-labelledby="detection-zone-title"
        >
          <div className="detection-detail-heading">
            <div>
              <h2 id="detection-zone-title">Zone {displayLabel(a.zoneId)}</h2>
              <p>
                {displayLabel(a.deviceId ?? 'Camera unavailable')}
                {displayLabel(
                  last && Number.isFinite(Date.parse(last.at))
                    ? `, ${dateLabel(last.at)}, ${clockTime(last.at)} WIB`
                    : '',
                )}
              </p>
            </div>
            <Button
              small
              icon="devices"
              disabled={!a.deviceId}
              onClick={() => ctx.nav(`/perangkat?device=${a.deviceId}&detailTab=condition`)}
            >
              Source device
            </Button>
          </div>
          <div className={`detection-verdict ${a.status}`} role="status">
            <Icon
              name={a.status === 'review' ? 'alert' : a.status === 'normal' ? 'eye' : 'info'}
              size={22}
            />
            <div>
              <h3>{displayLabel(a.title)}</h3>
              <p>{displayLabel(a.reason)}</p>
            </div>
          </div>
          <div className="detection-evidence">
            <ObservationProof assessment={a} />
            <figure className="detection-source">
              <CameraPreview s={s} deviceId={a.deviceId ?? ''} compact />
              <figcaption>
                Trap reference image. Counts come from sample observations, not analysis of this
                image.
              </figcaption>
            </figure>
          </div>
          {rules.length > 0 && <Checks title={'Decision reasons'} checks={rules} />}
          <details
            className="detection-quality"
            open={a.status === 'unavailable'}
            key={`${a.zoneId}-${a.status === 'unavailable'}`}
          >
            <summary>
              <span>Data quality</span>
              <span>
                {quality.filter((c) => c.pass).length}/{quality.length} conditions met
              </span>
              <Icon name="down" size={16} />
            </summary>
            <Checks title={'Source and interval readiness'} checks={quality} quality />
          </details>
          <div className="detection-followup">
            <div>
              <h3>Follow up</h3>
              <p>
                {displayLabel(
                  linked
                    ? `${linked.id} already ${linked.status === 'closed' ? 'reviewed' : "contains this zone's work"}. Normal or missing readings do not automatically close cases.`
                    : a.status === 'review'
                      ? 'This signal can create one inspection case. Later evaluations reuse the same open case.'
                      : a.status === 'unavailable'
                        ? 'Check the data source before making crop decisions.'
                        : 'Continue observations. New cases are created only when review rules are met.',
                )}
              </p>
            </div>
            {linked ? (
              <Button
                tone="primary"
                icon="file"
                onClick={() => ctx.nav(`/hama?tab=cases&case=${linked.id}`)}
              >
                Open case {displayLabel(linked.id)}
              </Button>
            ) : a.status === 'review' ? (
              <Button
                permission="inspection"
                tone="primary"
                icon="file"
                onClick={async () => {
                  const result = await ctx.act({ type: 'evaluate_detection', zoneId: a.zoneId });
                  if (result.ok && result.id) ctx.nav(`/hama?tab=cases&case=${result.id}`);
                }}
              >
                Evaluate & open case
              </Button>
            ) : a.status === 'unavailable' && a.deviceId ? (
              <Button
                icon="wrench"
                onClick={() => ctx.nav(`/perangkat?device=${a.deviceId}&detailTab=condition`)}
              >
                Check device
              </Button>
            ) : null}
          </div>
          <p className="micro muted">
            Initial observations are saved for reference. Camera connection and inference are not
            enabled.
          </p>
          <p className="detection-limit">
            <Icon name="info" size={15} />
            These prototype rules and thresholds are not field-validated. This detection performs no
            AI inference or device actuation. Plant inspection determines control actions.
          </p>
        </section>
      </div>
    </div>
  );
}
