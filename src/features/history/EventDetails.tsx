import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { Alert, Badge, Button, Empty, Meta } from '../../components/ui';
import { clockTime, dateLabel } from '../../domain/format';
import { eventTypes, relatedUrl } from './presentation';

export function EventDetails({ ctx, id }: { ctx: PageContext; id: string }) {
  const e = ctx.s.events.find((e) => e.id === id);
  if (!e) return <Empty title={'Activity not found'} />;
  return (
    <div className="detail-stack">
      <Badge tone={eventTypes[e.type].tone}>{displayLabel(eventTypes[e.type].label)}</Badge>
      <h2>{displayLabel(e.title)}</h2>
      <p>{displayLabel(e.detail)}</p>
      <Meta
        items={[
          { label: 'Time', value: `${dateLabel(e.at, true)}, ${clockTime(e.at, true)} WIB` },
          { label: 'Actor', value: e.actor },
          { label: 'Source record', value: e.objectId },
          { label: 'Zone', value: e.zoneId ? `Zone ${e.zoneId}` : 'Greenhouse' },
          { label: 'Previous status', value: e.before ?? 'Not captured for this event' },
          { label: 'Resulting status', value: e.after ?? 'View linked record' },
        ]}
      />
      <Button
        icon="link"
        tone="primary"
        onClick={() =>
          e.type === 'expense' && e.objectId.startsWith('EXP-')
            ? ctx.open('expense-detail', e.objectId)
            : ctx.nav(relatedUrl(e.objectId, e.zoneId))
        }
      >
        Open related record
      </Button>
      <Alert tone="gray">
        Local history is a prototype activity log, not a production-grade immutable audit trail.
      </Alert>
    </div>
  );
}
