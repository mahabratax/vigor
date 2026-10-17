import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { Alert, Badge, Button, Empty, Icon, Meta } from '../../components/ui';
import { periodQuery, resolvePeriod } from '../../domain/periods';
import { dateLabel, money, monthLabel } from '../../domain/format';
export function ExpenseDetails({
  ctx,
  id,
  deviceId,
}: {
  ctx: PageContext;
  id: string;
  deviceId?: string;
}) {
  const { s } = ctx,
    e = s.expenses.find((e) => e.id === id);
  if (!e) return <Empty title={'Expense not found'} />;
  const allocations = s.allocations.filter((a) => a.expenseId === id),
    allocated = allocations.reduce((t, a) => t + a.amount, 0),
    scope = resolvePeriod(
      s.clock,
      ctx.query.get('period') ?? e.paidAt.slice(0, 7),
      ctx.query.get('from'),
      ctx.query.get('to'),
    ),
    device = deviceId ?? e.deviceId;
  return (
    <div className="detail-stack">
      <div className="expense-detail-title">
        <span className="soft-icon large">
          <Icon
            name={
              e.category === 'Perawatan' ? 'wrench' : e.category === 'Listrik' ? 'bolt' : 'wallet'
            }
            size={27}
          />
        </span>
        <div>
          <Badge tone={e.status === 'void' ? 'red' : e.status === 'draft' ? 'amber' : 'green'}>
            {displayLabel(
              e.status === 'void'
                ? 'Voided'
                : e.status === 'draft'
                  ? 'Draft; unpaid'
                  : 'Sample record',
            )}
          </Badge>
          <h2>{displayLabel(e.note)}</h2>
          <p>
            {displayLabel(e.id)}, {displayLabel(dateLabel(e.paidAt))}
          </p>
        </div>
      </div>
      <div className="cost-total">
        <span>{displayLabel(e.status === 'draft' ? 'Amount unconfirmed' : 'Recorded amount')}</span>
        <strong>
          {displayLabel(e.status === 'draft' && !e.amount ? 'Not entered' : money(e.amount))}
        </strong>
        <small>
          {displayLabel(
            allocations.length
              ? 'One bill. The allocations below are not additional expenses.'
              : 'Sample record or operator entry saved in this browser.',
          )}
        </small>
      </div>
      <Meta
        items={[
          { label: 'Category', value: e.category },
          { label: 'Greenhouse', value: s.greenhouse.name },
          { label: 'Payment date', value: dateLabel(e.paidAt) },
          {
            label: 'Usage period',
            value: e.usageSlices
              ? e.usageSlices.map((a) => `${monthLabel(a.period)}: ${money(a.amount)}`).join('; ')
              : monthLabel(e.paidAt.slice(0, 7)),
          },
          {
            label: 'Source',
            value:
              e.source === 'demo_ledger'
                ? 'Sample expense record'
                : 'Recorded by an operator in the prototype',
          },
          { label: 'Reference', value: e.reference ?? 'Not provided' },
          {
            label: 'Attachment',
            value: e.attachmentName
              ? `${e.attachmentName}, filename only; file is local to this session`
              : 'No attachment',
          },
        ]}
      />
      {displayLabel(
        device && (
          <button
            className="linked-asset"
            onClick={() =>
              ctx.nav(
                `/perangkat?device=${encodeURIComponent(device!)}&${periodQuery(scope)}&detailTab=cost`,
              )
            }
          >
            <span className="soft-icon">
              <Icon name="devices" />
            </span>
            <span>
              <small>Linked device</small>
              <strong>{s.devices.find((d) => d.id === device)?.label ?? device}</strong>
              <small>{device}, review condition and costs for the same period</small>
            </span>
          </button>
        ),
      )}
      {displayLabel(
        e.maintenanceId && (
          <button
            disabled={ctx.can?.('maintenance') === false}
            className="text-link"
            onClick={() => ctx.open('maintenance', e.deviceId, e.maintenanceId)}
          >
            View maintenance record {e.maintenanceId}
          </button>
        ),
      )}
      {allocations.length > 0 && (
        <>
          <h3>Bill allocation</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Allocation basis</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {displayLabel(
                        a.deviceId ? (
                          <button
                            className="text-link"
                            onClick={() =>
                              ctx.nav(
                                `/perangkat?device=${encodeURIComponent(a.deviceId!)}&${periodQuery(scope)}&detailTab=cost`,
                              )
                            }
                          >
                            {a.deviceId}
                          </button>
                        ) : (
                          a.label
                        ),
                      )}
                    </td>
                    <td>
                      {displayLabel(
                        a.basis === 'estimated_power_runtime'
                          ? 'Estimated power × runtime'
                          : a.basis === 'submeter'
                            ? 'Submeter reading'
                            : 'Manual allocation',
                      )}
                    </td>
                    <td>{displayLabel(money(a.amount))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total allocated</td>
                  <td>{displayLabel(money(allocated))}</td>
                </tr>
                <tr>
                  <td colSpan={2}>Unallocated</td>
                  <td>{displayLabel(money(e.amount - allocated))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Alert tone="gray">
            Device allocations are part of {displayLabel(e.id)}. Total expenses count bill{' '}
            {displayLabel(money(e.amount))} once.
          </Alert>
        </>
      )}
      {e.usageSlices && (
        <Alert tone="blue" title={'Payments and period costs can differ'}>
          Cash flow records the full amount on the payment date. Operating comparisons use your
          period allocations without duplicating the payment.
        </Alert>
      )}
      {e.status === 'void' && (
        <Alert tone="red" title={'Record voided'}>
          {displayLabel(e.voidReason)}
        </Alert>
      )}
      <div className="button-row">
        {e.status === 'void' ? (
          <Button
            permission="finance"
            tone="primary"
            icon="undo"
            onClick={async () => await ctx.act({ type: 'undo_void', id })}
          >
            Restore record
          </Button>
        ) : (
          <>
            <Button
              permission="finance"
              tone="primary"
              icon="edit"
              onClick={() => ctx.open('expense', id)}
            >
              {displayLabel(e.status === 'draft' ? 'Complete & confirm' : 'Edit record')}
            </Button>
            <Button
              permission="finance"
              icon="trash"
              tone="danger"
              onClick={() => ctx.open('void-expense', id)}
            >
              Void
            </Button>
          </>
        )}
      </div>
      <p className="micro muted">
        Recording a cost does not complete maintenance work. No money is transferred.
      </p>
    </div>
  );
}
