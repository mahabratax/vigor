import { displayLabel } from '../../i18n/display';
import React, { useMemo, useState } from 'react';
import type { PageContext } from '../../app/context';
import { Alert, Badge, Button, Card } from '../../components/ui';
import { buildAiInput, createAiSnapshot } from './foundation';
import { getWorkspaceRevision } from '../../store/persistence';
import { dateLabel, clockTime } from '../../domain/format';
import { useGatewayStatus } from './useGemini';

const qualityLabels: Record<string, string> = {
  ready: 'Available',
  missing: 'No reading',
  offline: 'Offline',
  stale: 'Expired',
  uncalibrated: 'Calibration needed',
  maintenance: 'Under maintenance',
  invalid: 'Invalid data',
  future: 'Future timestamp',
  unsupported: 'Unavailable',
};
export function AiReadiness({ ctx, compact = false }: { ctx: PageContext; compact?: boolean }) {
  const gateway = useGatewayStatus();
  const [checkedAt, setCheckedAt] = useState(() => Math.floor(Date.now() / 1000));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const revision = getWorkspaceRevision();
  const input = useMemo(
    () => buildAiInput(ctx.s, revision, checkedAt),
    [ctx.s, revision, checkedAt],
  );
  const check = () => {
    setCheckedAt(Math.floor(Date.now() / 1000));
    setError('');
    gateway.refresh();
  };
  async function download() {
    setBusy(true);
    setError('');
    try {
      const snapshot = await createAiSnapshot(ctx.s, getWorkspaceRevision());
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `vigor-ai-input-${snapshot.greenhouseId}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not prepare the AI input file.');
    } finally {
      setBusy(false);
    }
  }
  if (compact)
    return (
      <Card title="AI readiness" variant="plain" tools={<Badge>Not connected</Badge>}>
        <p>
          {input.readiness.usableReadings} of {input.readiness.totalReadings} sensor readings meet
          the freshness and quality checks.
        </p>
        <p className="micro muted">Review the inputs before connecting AI analysis.</p>
        <Button small onClick={() => ctx.nav('/settings?tab=ai')}>
          Review AI inputs
        </Button>
      </Card>
    );
  return (
    <div className="page-stack">
      <Card
        title="Google Gemini"
        data-tour="ai-readiness"
        tools={
          <Badge tone={gateway.status?.configured ? 'green' : 'amber'}>
            {gateway.status?.configured ? 'Configured' : 'Setup required'}
          </Badge>
        }
      >
        <p>{gateway.status?.message ?? 'Checking this deployment’s AI gateway…'}</p>
        <p className="micro muted">
          Select Gemini in the assistant to explain a priority, compare next steps and review its
          evidence. Supported actions still use Vigor’s existing forms and checks. A successful
          response includes the model, token usage and an exportable analysis record.
        </p>
        <dl className="settings-facts">
          <div>
            <dt>Greenhouse</dt>
            <dd>{displayLabel(ctx.s.greenhouse.name)}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{gateway.status?.model ?? 'Not configured'}</dd>
          </div>
          <div>
            <dt>Hosting</dt>
            <dd>
              {gateway.status?.hosting === 'cloud-run' ? 'Google Cloud Run' : 'Private review Site'}
            </dd>
          </div>
          <div>
            <dt>Execution</dt>
            <dd>Advisory only</dd>
          </div>
          <div>
            <dt>Checked at</dt>
            <dd>
              {displayLabel(dateLabel(checkedAt))}, {displayLabel(clockTime(checkedAt))} WIB
            </dd>
          </div>
          <div>
            <dt>Reading freshness</dt>
            <dd>30 minutes</dd>
          </div>
        </dl>
        <div className="button-row wrap">
          <Button onClick={() => ctx.nav('/ringkasan')}>Open dashboard assistant</Button>
          <Button onClick={check} icon="refresh">
            Check inputs again
          </Button>
          <Button permission="export" onClick={download} disabled={busy} icon="download">
            {displayLabel(busy ? 'Preparing input…' : 'Export AI input')}
          </Button>
        </div>
        {displayLabel(error && <Alert title="Input export failed">{error}</Alert>)}
      </Card>
      <Card title="What Gemini receives" variant="plain">
        <p>
          Your question and selected greenhouse’s findings, crop stages, reading-quality counts,
          record amounts and available follow-up actions. Customer profiles, member identities, task
          notes, images and credentials are excluded from this automatic snapshot.
        </p>
        <p className="micro muted">
          Record labels and anything you type in your question are included. Keep personal details
          out of questions. Local record lookup does not send data to Google. The exported AI input
          below is the separate sensor-readiness contract; analysis exports are available with each
          successful Gemini response.
        </p>
      </Card>
      <Card
        title="Sensor evidence"
        subtitle={`${input.readiness.usableReadings} available readings out of ${input.readiness.totalReadings}. Missing values are never treated as zero.`}
      >
        {!input.readings.length ? (
          <p>No sensors are registered. Add a sensor in Devices and assign it to a zone.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Metric</th>
                  <th>Reading</th>
                  <th>Captured at</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {input.readings.map((r) => (
                  <tr key={r.id}>
                    <td>{displayLabel(r.deviceId)}</td>
                    <td>{displayLabel(r.metric)}</td>
                    <td>{displayLabel(r.value === null ? '—' : `${r.value} ${r.unit}`)}</td>
                    <td>
                      {displayLabel(
                        r.capturedAt && Number.isFinite(Date.parse(r.capturedAt))
                          ? `${dateLabel(r.capturedAt)}, ${clockTime(r.capturedAt)}`
                          : '—',
                      )}
                    </td>
                    <td>
                      <Badge tone={r.quality === 'ready' ? 'green' : 'amber'}>
                        {displayLabel(qualityLabels[r.quality])}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="micro muted">
          The 30-minute limit is a technical default for this prototype. It must be reviewed for
          each sensor before field use. Imported sample readings remain historical records.
        </p>
      </Card>
      <Card title="Crop targets and automation">
        <p>
          {displayLabel(
            input.readiness.missingTargets.length
              ? `Zones without reviewed crop targets: ${input.readiness.missingTargets.join(', ')}.`
              : 'Every active zone has a reviewed crop target.',
          )}
        </p>
        <p>
          Existing rules determine device limits and routine checks. Gemini can explain and
          prioritize evidence-linked reviews; it cannot issue device commands or change a nutrient
          dose.
        </p>
        <div className="button-row wrap">
          <Button onClick={() => ctx.nav('/greenhouse?tab=zones')}>Review crop targets</Button>
          <Button onClick={() => ctx.nav('/otomasi?tab=preview')}>Preview a routine</Button>
        </div>
      </Card>
    </div>
  );
}
