import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { Button, Card, Empty, Icon } from '../../components/ui';
import { workQueue } from './workQueue';
export function WorkQueue({ ctx }: { ctx: PageContext }) {
  const [expanded, setExpanded] = useState(false),
    items = workQueue(ctx.s).filter((item) =>
      ['care:', 'maintenance:', 'run:', 'outcome:', 'device:'].some((prefix) =>
        item.id.startsWith(prefix),
      ),
    );
  const shown = expanded ? items : items.slice(0, 4);
  return (
    <Card
      title={'Assigned work & reviews'}
      subtitle={`${items.length} open tasks / selected greenhouse`}
      className="priority-panel"
      data-tour="work-queue"
      variant="register"
    >
      {items.length ? (
        <>
          <div className="work-queue">
            {shown.map((item) => (
              <button key={item.id} className="work-queue-item" onClick={() => ctx.nav(item.url)}>
                <span className={`queue-symbol ${item.priority < 3 ? 'attention' : ''}`}>
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="queue-copy">
                  <small className="queue-state">{displayLabel(item.label)}</small>
                  <strong>{displayLabel(item.title)}</strong>
                  <span>{displayLabel(item.detail)}</span>
                  <small>{displayLabel(item.meta)}</small>
                </span>
                <Icon name="chevron" size={15} />
              </button>
            ))}
          </div>
          {items.length > 4 && (
            <button
              className="queue-footer text-link"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              {displayLabel(expanded ? 'Show top priorities' : `View all ${items.length} tasks`)}
            </button>
          )}
        </>
      ) : (
        <Empty
          icon={ctx.s.devices.length ? 'checkcircle' : 'greenhouse'}
          title={ctx.s.devices.length ? 'No open follow-up tasks' : 'Set up your greenhouse'}
          detail={
            ctx.s.devices.length
              ? 'Continue checking monitoring quality and routine schedules.'
              : 'Complete zones, planting batches, and devices to begin.'
          }
          action={
            <Button
              small
              onClick={() =>
                ctx.s.devices.length ? ctx.nav('/otomasi?tab=schedule') : ctx.open('help')
              }
            >
              {displayLabel(ctx.s.devices.length ? 'View schedule' : 'Open setup guide')}
            </Button>
          }
        />
      )}
    </Card>
  );
}
