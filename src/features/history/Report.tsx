import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { Badge, Button, Meta } from '../../components/ui';
import { comparison, costSummary } from '../../domain/costs';
import { clockTime, dateLabel, money, num, runLabels } from '../../domain/format';
import { todayUsage } from '../../domain/selectors';
import { scopeFrom } from '../costs/Costs';
import { detectionSummary } from '../../domain/detection';
import { productionSummary } from '../../domain/production';

export function Report({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    scope = scopeFrom(ctx),
    cost = costSummary(s, scope),
    comp = comparison(s, scope),
    usage = todayUsage(s),
    detection = detectionSummary(s),
    crop = productionSummary(s),
    complete = s.runs.filter((r) => r.status === 'Completed').length,
    skipped = s.runs.filter((r) => r.status === 'Skipped').length,
    terminal = s.runs.filter((r) =>
      ['Completed', 'Skipped', 'Blocked', 'Failed', 'Stopped', 'Needs reconciliation'].includes(
        r.status,
      ),
    );
  return (
    <article className="print-report">
      <div className="report-heading">
        <div>
          <h1>Vigor, Operations report</h1>
          <p>
            {displayLabel(s.greenhouse.name)}, {displayLabel(s.greenhouse.location)}
          </p>
        </div>
        <Badge>Initial data</Badge>
      </div>
      <Meta
        items={[
          {
            label: 'Operations snapshot',
            value: `${dateLabel(s.clock, true)} ${clockTime(s.clock)} WIB`,
          },
          { label: 'Expense period', value: scope.period },
          {
            label: 'Scope',
            value:
              scope.deviceId ??
              (scope.zoneId
                ? `Zone ${scope.zoneId}`
                : `${s.zones.length} zones, ${s.greenhouse.plantedArea} m² planted`),
          },
        ]}
      />
      <h2>Observations & follow-up</h2>
      <p>
        {s.cases.filter((c) => c.status === 'inspection').length} cases need inspection;{' '}
        {s.cases.filter((c) => c.status === 'monitoring').length} under follow-up monitoring. Camera
        E-01 and Zone F validation reflect device conditions when this report was created.
      </p>
      <p>
        {detection.usable}/{s.zones.length} zones have comparable data; {detection.review} trigger
        review rules and {detection.unavailable} cannot be assessed. Rules use stored observations,
        not AI inference. Missing readings are not treated as zero.
      </p>
      <h2>Automation</h2>
      <p>
        {complete} completed runs out of {terminal.length} finished runs; {skipped} validly skipped.
        Skipping sufficiently wet media is not a failure.
      </p>
      <table>
        <thead>
          <tr>
            <th>Run</th>
            <th>Routine</th>
            <th>Status</th>
            <th>Reason / outcome</th>
          </tr>
        </thead>
        <tbody>
          {s.runs.map((r) => (
            <tr key={r.id}>
              <td>{displayLabel(r.id)}</td>
              <td>{displayLabel(r.routineName)}</td>
              <td>{displayLabel(runLabels[r.status])}</td>
              <td>{displayLabel(r.reason)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Today's simulated usage: {displayLabel(num(usage.water, 1))} L water,{' '}
        {displayLabel(num(usage.nutrition, 2))} simulation nutrient units,{' '}
        {displayLabel(num(usage.energy, 3))} kWh estimated energy.{' '}
        {displayLabel(usage.uncertain ? 'Some delivery remains unconfirmed.' : '')} Volumes use
        sample feedback or assumed flow, not pump runtime alone.
      </p>
      <h2>Expenses</h2>
      <p>
        Operations {displayLabel(money(cost.operating))}; investment{' '}
        {displayLabel(money(cost.investment))}; total cash outflow {displayLabel(money(cost.total))}
        . Allocations are not counted as additional bills. Budget{' '}
        {displayLabel(cost.budget === null ? 'unavailable' : money(cost.budget))}.
      </p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category / notes</th>
            <th>Source</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {cost.rows.map((r) => (
            <tr key={r.record.id}>
              <td>{displayLabel(r.record.id)}</td>
              <td>
                {displayLabel(r.record.category)}, {displayLabel(r.record.note)}
              </td>
              <td>{displayLabel(r.source)}</td>
              <td>{displayLabel(money(r.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        {displayLabel(
          comp.difference === null
            ? 'Savings cannot be compared yet.'
            : `Estimated difference ${money(comp.difference)} (${num(comp.percent ?? 0, 1)}%).`,
        )}{' '}
        {displayLabel(comp.reason)} Unrecorded categories:{' '}
        {displayLabel(comp.missing.join(', ') || 'none in this sample')}.
      </p>
      <h2>Crop cycle and business results</h2>
      <p>
        Cycle {displayLabel(s.cycle.id)}, started {displayLabel(s.cycle.plantedOn)}, all zones.
        Harvest {displayLabel(num(crop.harvest, 1))} kg; rejects and losses{' '}
        {displayLabel(num(crop.rejected + crop.loss, 1))} kg; sold {displayLabel(num(crop.sold, 1))}{' '}
        kg; remaining stock {displayLabel(num(crop.stock, 1))} kg.
      </p>
      <p>
        Sales {displayLabel(money(crop.revenue))}, cash received{' '}
        {displayLabel(money(crop.received))}, receivables {displayLabel(money(crop.receivable))}.
        Allocated costs {displayLabel(money(crop.charge))}; provisional result{' '}
        {displayLabel(money(crop.profit))}.{' '}
        {displayLabel(
          crop.reviewed
            ? 'Costs reviewed by user.'
            : 'Costs are incomplete or need another review.',
        )}{' '}
        Cycle scope differs from the expense filters above. Savings are not added as revenue.
      </p>
      <h2>Report limitations</h2>
      <p>
        Records include presentation samples and operator entries. AI is not connected; no live
        device inference or payment processing is active. Before-and-after differences do not prove
        biological effectiveness or savings caused by Vigor. Nutrient values are not crop recipes.
      </p>
      <Button
        permission="export"
        className="no-print"
        icon="print"
        tone="primary"
        onClick={() => window.print()}
      >
        Print / save through browser
      </Button>
    </article>
  );
}
