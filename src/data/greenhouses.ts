import { createFixture } from './fixtures';
import type { DomainState } from '../domain/types';
export const GREENHOUSE_IDS = ['GH-01', 'GH-02'] as const;
export type DemoGreenhouseId = (typeof GREENHOUSE_IDS)[number];
export type GreenhouseId = string;
export const isDemoGreenhouseId = (id: string): id is DemoGreenhouseId =>
  GREENHOUSE_IDS.some((candidate) => candidate === id);
export const greenhouseNames: Record<DemoGreenhouseId, string> = {
  'GH-01': 'Greenhouse 01',
  'GH-02': 'Greenhouse 02',
};
/** Each greenhouse owns an independent demo dataset, including its ledger and scheduler. */
export function createGreenhouseFixture(id: DemoGreenhouseId): DomainState {
  const s = createFixture();
  if (id === 'GH-01') return s;
  s.greenhouse = {
    id,
    name: greenhouseNames[id],
    location: 'Ciawi Farm',
    area: 270,
    plantedArea: 216,
  };
  s.cycle = { ...s.cycle, id: 'PAP-CW-2026-08', plants: 324 };
  s.zones = s.zones.map((z, i) => ({
    ...z,
    area: 36,
    plants: 54,
    validated: true,
    temperature: [26.4, 26.8, 27.2, 26.7, 27.1, 26.5][i],
    humidity: [70, 71, 73, 72, 74, 71][i],
  }));
  s.devices = s.devices.map((d) => ({ ...d, connection: 'online', calibrated: true }));
  s.cases = s.cases.map((c) => ({
    ...c,
    status: c.status === 'inspection' ? 'monitoring' : c.status,
    verified: true,
    assignedTo: c.assignedTo ?? 'Mira Lestari',
    title: c.id === 'INS-024' ? 'Plant observation follow-up' : c.title,
  }));
  s.inspections.push({
    id: 'CHK-CW-002',
    caseId: 'INS-024',
    at: '2026-10-13T09:35:00+07:00',
    operator: 'Mira Lestari',
    examined: 12,
    affected: 1,
    outcome: 'indication',
    notes: 'One plant needs further observation. Sample inspection at Ciawi Farm.',
  });
  s.observations = s.observations.map((o, i) => ({ ...o, newCaptures: 2 + (i % 4) }));
  s.expenses = s.expenses.map((e) => ({
    ...e,
    greenhouseId: id,
    amount: Math.round(e.amount * 0.8),
  }));
  s.allocations = s.allocations.map((a) => ({
    ...a,
    amount: Math.round(a.amount * 0.8),
    label: 'Sample allocation for Ciawi Farm',
  }));
  s.budgets = s.budgets.map((b) => ({
    ...b,
    greenhouseId: id,
    amount: Math.round(b.amount * 0.8),
  }));
  s.maintenance = s.maintenance.map((m) => ({
    ...m,
    status: 'completed',
    operator: 'Mira Lestari',
    notes:
      m.status === 'completed' ? m.notes : 'Sample connection inspection and recovery completed.',
  }));
  if (s.baseline) {
    s.baseline.area = 216;
    for (const k of Object.keys(s.baseline.categories) as (keyof typeof s.baseline.categories)[])
      s.baseline.categories[k] = Math.round(s.baseline.categories[k]! * 0.8);
  }
  s.costs.electricityPerKwh = 1200;
  s.nutrientProfiles = s.nutrientProfiles.map((p) => ({ ...p, crop: s.cycle.crop }));
  s.events = [
    {
      id: 'EVT-CW-001',
      at: '2026-10-13T09:35:00+07:00',
      type: 'inspection',
      title: 'Zone B follow-up monitoring',
      detail: 'Inspection recorded. Continue with the next observation.',
      actor: 'Mira Lestari',
      objectId: 'INS-024',
      zoneId: 'B',
    },
  ];
  return s;
}
