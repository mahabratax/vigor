import { displayLabel, matchesSearch } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import {
  Button,
  Card,
  Empty,
  Icon,
  SearchField,
  Select,
  Stat,
  Stats,
  Tabs,
} from '../../components/ui';
import { clockTime, csv, dateLabel, downloadText, localDate } from '../../domain/format';
import { EventDetails } from './EventDetails';
import { eventTypes } from './presentation';
import { Report } from './Report';
export { EventDetails } from './EventDetails';
export { Report } from './Report';

export default function HistoryPage({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    type = ctx.query.get('type') ?? 'all',
    zone = ctx.query.get('zone') ?? 'all',
    search = ctx.query.get('search') ?? '',
    date = ctx.query.get('date') ?? '',
    actor = ctx.query.get('actor') ?? 'all',
    tab = ctx.query.get('tab') ?? 'timeline';
  const rows = s.events.filter(
      (e) =>
        (type === 'all' || e.type === type) &&
        (zone === 'all' || e.zoneId === zone) &&
        (!date || localDate(Date.parse(e.at) / 1000) === date) &&
        (actor === 'all' || e.actor === actor) &&
        matchesSearch(search, e.id, e.title, e.detail, e.objectId),
    ),
    selected = rows.find((e) => e.id === ctx.query.get('event'))?.id ?? rows[0]?.id;
  return (
    <div className="page-stack">
      <Stats>
        <Stat
          icon="history"
          label={'Saved activities'}
          value={s.events.length}
          sub="Changes and actions across the greenhouse"
        />
        <Stat
          icon="checkcircle"
          label={'Completed executions'}
          value={s.runs.filter((r) => r.status === 'Completed').length}
          sub={'Simulator execution verified'}
        />
        <Stat
          icon="alert"
          tone="amber"
          label={'State review needed'}
          value={s.runs.filter((r) => r.status === 'Needs reconciliation').length}
          sub={'Check devices before continuing'}
        />
        <Stat
          icon="file"
          label={'September cost records'}
          value={
            s.expenses.filter((e) => e.status === 'paid' && e.paidAt.startsWith('2026-09')).length
          }
          sub={'Same source as Costs'}
        />
      </Stats>
      <Tabs
        value={tab}
        onChange={(v) => updateQuery(ctx, '/riwayat', { tab: v })}
        items={[
          { id: 'timeline', label: 'Timeline' },
          { id: 'report', label: 'Operations report' },
        ]}
      />
      {tab === 'report' ? (
        <Card>
          <Report ctx={ctx} />
        </Card>
      ) : (
        <>
          <div className="filter-bar">
            <SearchField
              value={search}
              onChange={(v) => updateQuery(ctx, '/riwayat', { search: v })}
              placeholder={'Search activities or source IDs…'}
            />
            <Select
              label={'Activity type'}
              value={type}
              onChange={(v) => updateQuery(ctx, '/riwayat', { type: v, event: undefined })}
              options={[
                { value: 'all', label: 'All activities' },
                ...Object.entries(eventTypes).map(([value, x]) => ({ value, label: x.label })),
              ]}
            />
            <Select
              label={'History zone'}
              value={zone}
              onChange={(v) => updateQuery(ctx, '/riwayat', { zone: v, event: undefined })}
              options={[
                { value: 'all', label: 'All zones' },
                ...s.zones.map((z) => ({ value: z.id, label: z.name })),
              ]}
            />
            <Select
              label={'Activity operator'}
              value={actor}
              onChange={(v) => updateQuery(ctx, '/riwayat', { actor: v })}
              options={[
                { value: 'all', label: 'All operators' },
                ...Array.from(new Set(s.events.map((e) => e.actor))).map((a) => ({
                  value: a,
                  label: a,
                })),
              ]}
            />
            <input
              type="date"
              aria-label={'History date'}
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateQuery(ctx, '/riwayat', { date: e.currentTarget.value })
              }
            />
            <Button
              permission="export"
              small
              icon="download"
              onClick={() =>
                downloadText(
                  'Vigor-aktivitas.csv',
                  csv([
                    ['Sample records — ' + s.greenhouse.name],
                    ['ID', 'Time (WIB)', 'Type', 'Actor', 'Objek', 'Zone', 'Activity', 'Details'],
                    ...rows.map((e) => [
                      e.id,
                      dateLabel(e.at) + ' ' + clockTime(e.at, true),
                      e.type,
                      e.actor,
                      e.objectId,
                      e.zoneId ?? '',
                      e.title,
                      e.detail,
                    ]),
                  ]),
                )
              }
            >
              Export CSV
            </Button>
          </div>
          <div className="history-layout">
            <Card
              title={'Farm activity'}
              variant="register"
              subtitle={`${rows.length} events match these filters; local history`}
            >
              <div className="timeline-list">
                {rows.map((e, i) => (
                  <React.Fragment key={e.id}>
                    {(i === 0 || dateLabel(rows[i - 1].at) !== dateLabel(e.at)) && (
                      <div className="timeline-day">{displayLabel(dateLabel(e.at, true))}</div>
                    )}
                    <button
                      className={`timeline-event ${selected === e.id ? 'selected' : ''}`}
                      onClick={() => {
                        updateQuery(ctx, '/riwayat', { event: e.id });
                        if (ctx.mobile) ctx.open('event', e.id);
                      }}
                    >
                      <time>{displayLabel(clockTime(e.at))}</time>
                      <span className={`timeline-icon ${eventTypes[e.type].tone}`}>
                        <Icon name={eventTypes[e.type].icon} size={17} />
                      </span>
                      <span className="grow">
                        <strong>{displayLabel(e.title)}</strong>
                        <small>{displayLabel(e.detail)}</small>
                        <span className="event-meta">
                          {displayLabel(e.actor)}, {displayLabel(e.objectId)}
                          {displayLabel(e.zoneId ? `, Zone ${e.zoneId}` : '')}
                        </span>
                      </span>
                      <Icon name="chevron" size={16} />
                    </button>
                  </React.Fragment>
                ))}
              </div>
              {!rows.length && (
                <Empty
                  title={'No activities match these filters'}
                  action={<Button onClick={() => ctx.nav('/riwayat')}>Clear filters</Button>}
                />
              )}
            </Card>
            <Card className="inspector desktop-detail" title={'Activity details'}>
              {selected ? (
                <EventDetails ctx={ctx} id={selected} />
              ) : (
                <Empty title={'Select activity'} />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export { eventTypes, relatedUrl } from './presentation';
