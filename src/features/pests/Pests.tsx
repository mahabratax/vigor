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
  SearchField,
  Select,
  Stat,
  Tabs,
} from '../../components/ui';
import { assets } from '../../data/assets';
import { kpis } from '../../domain/selectors';
import { CaseDetails } from './CaseDetails';
import { DetectionReview } from './DetectionReview';
import { detectionSummary } from '../../domain/detection';
import { caseSelection } from './caseSelection';
export { CaseDetails } from './CaseDetails';

export function Pests(ctx: PageContext) {
  const tab = ctx.query.get('tab') ?? 'cases';
  return (
    <div className="page-stack">
      <Tabs
        value={tab}
        onChange={(v) => updateQuery(ctx, '/hama', { tab: v, case: undefined })}
        items={[
          { id: 'cases', label: 'Cases & inspections' },
          {
            id: 'detection',
            label: 'Detection review',
            count: detectionSummary(ctx.s).review || undefined,
          },
        ]}
      />
      {tab === 'detection' ? <DetectionReview ctx={ctx} /> : <CaseQueue {...ctx} />}
    </div>
  );
}
function CaseQueue(ctx: PageContext) {
  const { s } = ctx,
    k = kpis(s),
    status = ctx.query.get('status') ?? 'all',
    zone = ctx.query.get('zone') ?? 'all',
    search = ctx.query.get('search') ?? '';
  const { cases, selected, requested, hidden } = caseSelection(s, ctx.query);
  return (
    <div className="page-stack">
      <div className="stats three">
        <Stat
          label={'Inspection needed'}
          value={k.inspection}
          icon="alert"
          tone="amber"
          sub={'Awaiting plant inspection'}
        />
        <Stat
          label={'Follow-up monitoring'}
          value={k.monitoring}
          icon="eye"
          sub={'Follow-up observations needed'}
        />
        <Stat
          label={'Completed after review'}
          value={k.closed}
          icon="checkcircle"
          sub={'Last 7 days'}
        />
      </div>
      <div className="filter-bar">
        <SearchField
          value={search}
          onChange={(v) => updateQuery(ctx, '/hama', { search: v, case: undefined })}
          placeholder={'Search cases, zones, or findings…'}
        />
        <Select
          label={'Case status'}
          value={status}
          onChange={(v) => updateQuery(ctx, '/hama', { status: v, case: undefined })}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'inspection', label: 'Inspection needed' },
            { value: 'monitoring', label: 'Follow-up monitoring' },
            { value: 'closed', label: 'Completed' },
          ]}
        />
        <Select
          label={'Case zone'}
          value={zone}
          onChange={(v) => updateQuery(ctx, '/hama', { zone: v, case: undefined })}
          options={[
            { value: 'all', label: 'All zones' },
            ...s.zones.map((z) => ({ value: z.id, label: z.name })),
          ]}
        />
        <span className="micro muted">Insect identification awaits inspection</span>
      </div>
      {requested && !selected && (
        <Alert
          title={hidden ? 'Case hidden by filters' : 'Case not found'}
          action={
            <Button
              small
              onClick={() =>
                updateQuery(
                  ctx,
                  '/hama',
                  hidden
                    ? { search: undefined, status: undefined, zone: undefined }
                    : { case: undefined },
                )
              }
            >
              {hidden ? 'Show selected case' : 'View available cases'}
            </Button>
          }
        >
          {hidden
            ? `${requested} does not match the current filters.`
            : `${requested} is not available in this greenhouse. Check the greenhouse selection or choose another case.`}
        </Alert>
      )}
      <div className="master-detail">
        <Card
          title={'Cases'}
          tools={<span className="count-pill">{cases.length}</span>}
          className="master-list"
        >
          <div className="case-list">
            {cases.map((c) => (
              <button
                key={c.id}
                className={`case-item ${selected?.id === c.id ? 'selected' : ''}`}
                onClick={() => {
                  updateQuery(ctx, '/hama', { case: c.id });
                  if (ctx.mobile) ctx.open('case-detail', c.id);
                }}
              >
                <img
                  src={c.zoneId === 'B' ? assets.evidence : assets.camera}
                  alt="Reference monitoring image"
                />
                <span>
                  <strong>{displayLabel(c.title)}</strong>
                  <small>
                    {displayLabel(c.id)}, Zone {displayLabel(c.zoneId)}
                  </small>
                  <Badge
                    tone={
                      c.status === 'closed' ? 'green' : c.status === 'monitoring' ? 'blue' : 'amber'
                    }
                  >
                    {displayLabel(
                      c.status === 'closed'
                        ? 'Completed'
                        : c.status === 'monitoring'
                          ? 'Follow-up monitoring'
                          : 'Inspection needed',
                    )}
                  </Badge>
                </span>
                <Icon name="chevron" size={15} />
              </button>
            ))}
            {!cases.length && (
              <Empty
                title={s.cases.length ? 'No cases match these filters' : 'No inspection cases yet'}
                illustration={!s.cases.length ? 'inspection' : undefined}
                detail={
                  s.cases.length
                    ? 'Change filters to view other cases.'
                    : 'Record an observation when a crop needs attention.'
                }
              />
            )}
          </div>
        </Card>
        <Card className="desktop-detail">
          {selected ? (
            <CaseDetails ctx={ctx} id={selected.id} />
          ) : (
            <Empty title={'Select a case to view evidence'} icon="bug" />
          )}
        </Card>
      </div>
    </div>
  );
}
