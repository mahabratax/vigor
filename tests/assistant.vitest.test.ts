import { describe, expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { addStarterRecords } from '../src/data/starterRecords';
import { materialize } from '../db/codec';
import { assistantIssues, assistantTaskKey } from '../src/domain/assistant';
import { applyAssistantTask } from '../src/domain/assistantActions';
import type { AssistantTaskAction } from '../src/domain/assistantActions';
import { applyProduction, production } from '../src/domain/production';
import { applyTarget } from '../src/domain/cropTargets';
import { activeBatch } from '../src/domain/zones';
import { localDate } from '../src/domain/format';
import { actionPermission, can } from '../src/features/access/permissions';

function state() {
  const s = materialize(createFixture());
  s.clock = Date.parse('2026-10-16T03:00:00Z') / 1000;
  addStarterRecords({ [s.greenhouse.id]: s });
  return s;
}
function assignment(s = state(), id = 'case:INS-024'): AssistantTaskAction {
  const i = assistantIssues(s).find((x) => x.id.endsWith(id))!;
  return {
    type: 'assistant_task',
    greenhouseId: s.greenhouse.id,
    issueId: i.id,
    fingerprint: i.fingerprint,
    operator: 'Budi Santoso',
    dueOn: localDate(s.clock),
  };
}
describe('record-driven assistant decisions', () => {
  it('ranks the pest case by its actual blocked stock without duplicating the harvest action', () => {
    const s = state(),
      before = JSON.stringify(s),
      issues = assistantIssues(s);
    expect(issues[0].id).toContain('case:INS-024');
    expect(issues[0].impact.value).toBe('16 kg');
    expect(issues[0].focus).toEqual(['health', 'business']);
    const lot = production(s).lots.find((l) => l.zoneId === 'B')!;
    expect(issues.find((i) => i.id.endsWith(`lot:${lot.id}`))).toBeUndefined();
    expect(JSON.stringify(s)).toBe(before);
  });
  it('creates one normalized linked task, reuses it on retry, and does not equate work with outcome', () => {
    const s = state(),
      a = assignment(s),
      count = production(s).tasks.length;
    const result = applyAssistantTask(s, a);
    const task = production(s).tasks.find((t) => t.id === result.id)!;
    expect(task.key).toBe(assistantTaskKey(a.issueId));
    expect(task.plantingId).toBe(activeBatch(s, 'B')!.id);
    expect(task.zoneId).toBe('B');
    expect(applyAssistantTask(s, a).id).toBe(result.id);
    expect(production(s).tasks).toHaveLength(count + 1);
    applyProduction(s, {
      type: 'crop_task_done',
      id: task.id,
      notes: 'Plants inspected and sticky traps replaced.',
    });
    expect(assistantIssues(s).find((i) => i.id === a.issueId)).toMatchObject({
      resolved: false,
      task: { status: 'done' },
    });
    expect(s.cases.find((c) => c.id === 'INS-024')!.status).toBe('inspection');
    s.cases.find((c) => c.id === 'INS-024')!.status = 'closed';
    expect(assistantIssues(s).find((i) => i.id === a.issueId)!.resolved).toBe(true);
    expect(production(s).lots.find((l) => l.zoneId === 'B')!.status).toBe('held');
    expect(
      assistantIssues(s).find((i) => i.id.includes('lot:') && i.actions[0].kind === 'release'),
    ).toBeTruthy();
  });
  it('rejects changed evidence, an incorrect greenhouse, inactive zones and closed cycles without creating tasks', () => {
    const s = state(),
      a = assignment(s),
      count = production(s).tasks.length;
    expect(() => applyAssistantTask(s, { ...a, greenhouseId: 'GH-02' })).toThrow(
      'greenhouse changed',
    );
    const lot = production(s).lots.find((l) => l.zoneId === 'B')!;
    applyProduction(s, {
      type: 'crop_loss',
      loss: {
        lotId: lot.id,
        grade: 'A',
        kg: 1,
        date: localDate(s.clock),
        reason: 'Recorded damaged produce',
        key: 'assistant-stock-change',
      },
    });
    expect(() => applyAssistantTask(s, a)).toThrow('evidence changed');
    s.cases.find((c) => c.id === 'INS-024')!.verified = true;
    expect(() => applyAssistantTask(s, a)).toThrow('evidence changed');
    const b = assignment(s);
    s.zones.find((z) => z.id === 'B')!.status = 'inactive';
    expect(() => applyAssistantTask(s, b)).toThrow('evidence changed');
    s.zones.find((z) => z.id === 'B')!.status = 'active';
    s.production!.stage = 'closed';
    expect(() => applyAssistantTask(s, assignment(s))).toThrow();
    expect(production(s).tasks).toHaveLength(count);
    expect(actionPermission(a)).toBe('cultivation');
    expect(can('Viewer', actionPermission(a)!)).toBe(false);
    expect(can('Operator', actionPermission(a)!)).toBe(true);
  });
  it('uses the actual latest inspection across different timestamp offsets', () => {
    const s = state();
    s.inspections.push({
      ...s.inspections[0],
      id: 'CHK-TIME',
      at: '2026-10-12T10:00:00Z',
      affected: 9,
    });
    const i = assistantIssues(s).find((i) => i.id.endsWith('case:INS-023'))!;
    expect(i.evidence.find((e) => e.label === 'Latest inspection')!.value).toContain('9 affected');
  });
  it('uses only fresh stored readings and reviewed crop targets, then verifies with new evidence', () => {
    const s = state(),
      batch = activeBatch(s, 'A')!;
    const device = s.devices.find((d) => d.id === 'MEDIA-A')!;
    Object.assign(device, { connection: 'online', calibrated: true, maintenance: false });
    const draft = applyTarget(s, {
      type: 'target_save',
      batchId: batch.id,
      stage: batch.stage,
      limits: { media: { min: 40, max: 60 } },
      notes: 'Reviewed crop-stage moisture range.',
      actor: 'Budi',
    });
    applyTarget(s, { type: 'target_activate', id: draft.id, actor: 'Budi' });
    const reading = {
      id: 'recent',
      deviceId: device.id,
      metric: 'media',
      value: 25,
      unit: '%',
      capturedAt: new Date(s.clock * 1000).toISOString(),
      provenance: 'initial_import' as const,
    };
    s.readings = [reading];
    const i = assistantIssues(s).find((i) => i.id.includes('target:'))!;
    expect(i.title).toContain('outside target');
    const a = assignment(s, `target:${draft.id}:media`);
    s.readings![0].capturedAt = new Date((s.clock - 1900) * 1000).toISOString();
    expect(assistantIssues(s).some((i) => i.id.includes('target:'))).toBe(false);
    expect(() => applyAssistantTask(s, a)).toThrow('evidence changed');
    s.readings![0].capturedAt = new Date((s.clock + 60) * 1000).toISOString();
    expect(assistantIssues(s).some((i) => i.id.includes('target:'))).toBe(false);
    s.readings![0].capturedAt = new Date(s.clock * 1000).toISOString();
    applyAssistantTask(s, assignment(s, `target:${draft.id}:media`));
    s.readings![0].value = 50;
    expect(assistantIssues(s).find((x) => x.id === i.id)).toMatchObject({ resolved: true });
    s.readings![0].value = null;
    expect(assistantIssues(s).find((x) => x.id === i.id)).toMatchObject({ resolved: false });
  });
  it('connects low supply to its existing ticket and keeps receipts separate from profit', () => {
    const s = state(),
      issues = assistantIssues(s);
    const stock = issues.find((i) => i.id.includes('supply:'))!;
    expect(stock.impact.value).toBe('4 pcs');
    expect(stock.actions.some((a) => a.kind === 'navigate' && a.url.includes('maintenance'))).toBe(
      true,
    );
    const payment = issues.find((i) => i.id.includes('sale:'))!;
    expect(payment.reason).toContain('Upcoming payment');
    const saleId = payment.actions[0].kind === 'payment' ? payment.actions[0].id : '';
    const sale = production(s).sales.find((x) => x.id === saleId)!;
    const before = production(s)
      .receipts.filter((r) => r.saleId === saleId)
      .reduce((n, r) => n + r.amount, 0);
    const remaining = sale.kg * sale.price - before;
    applyProduction(s, {
      type: 'crop_receipt',
      receipt: {
        saleId,
        date: localDate(s.clock),
        amount: remaining / 2,
        reference: 'Bank transfer part one',
        key: 'assistant-payment-1',
      },
    });
    expect(assistantIssues(s).find((i) => i.id === payment.id)!.impact.value).not.toBe(
      payment.impact.value,
    );
    applyProduction(s, {
      type: 'crop_receipt',
      receipt: {
        saleId,
        date: localDate(s.clock),
        amount: remaining / 2,
        reference: 'Bank transfer part two',
        key: 'assistant-payment-2',
      },
    });
    expect(assistantIssues(s).find((i) => i.id === payment.id)).toBeUndefined();
    // Seeded cost allocation was reviewed. A payment alone must not invalidate it.
    expect(assistantIssues(s).some((i) => i.id.endsWith('profit-review'))).toBe(false);
    s.production!.finance.reviewKey = null;
    expect(assistantIssues(s).some((i) => i.id.endsWith('profit-review'))).toBe(true);
  });
});
