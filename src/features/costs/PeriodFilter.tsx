import React from 'react';
import { Select } from '../../components/ui';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { costMonths, type PeriodScope } from '../../domain/periods';
import { localDate, monthLabel } from '../../domain/format';

export function PeriodFilter({
  ctx,
  scope,
  path,
  label,
}: {
  ctx: PageContext;
  scope: PeriodScope;
  path: string;
  label: string;
}) {
  const current = localDate(ctx.s.clock).slice(0, 7);
  return (
    <>
      <Select
        label={label}
        value={scope.period}
        onChange={(period) => updateQuery(ctx, path, { period, from: undefined, to: undefined })}
        options={[
          ...costMonths(ctx.s, scope.period).map((period) => ({
            value: period,
            label: `${monthLabel(period)}${period === current ? ', current month' : ''}`,
          })),
          { value: '3months', label: 'Last 3 months through today' },
          { value: 'custom', label: 'Custom range' },
        ]}
      />
      {scope.period === 'custom' && (
        <>
          <input
            aria-label="Cost start date"
            type="date"
            value={scope.from ?? ''}
            onChange={(e) => updateQuery(ctx, path, { from: e.currentTarget.value })}
          />
          <span aria-hidden="true">–</span>
          <input
            aria-label="Cost end date"
            type="date"
            value={scope.to ?? ''}
            onChange={(e) => updateQuery(ctx, path, { to: e.currentTarget.value })}
          />
        </>
      )}
    </>
  );
}
