import { createFixture } from '../data/fixtures';
import { activity, isActiveRun } from './format';
import type { DomainState } from './types';
import { validProduction } from './production';
import { validCultivation, validZoneId } from './zones';
import { validEnergy } from './energy';
import { validTargets } from './cropTargets';
import { validEvidence } from './outcomes';
import { validSupplies } from './supplies';
import { validResources } from './efficiency';
function isValid(data: unknown): data is DomainState {
  if (!data || typeof data !== 'object') return false;
  const d = data as Partial<DomainState>;
  return (
    typeof d.playing === 'boolean' &&
    typeof d.costs === 'object' &&
    Number.isFinite(d.costs?.electricityPerKwh) &&
    Number.isFinite(d.costs?.plannerZones) &&
    !!d.episodes &&
    ['automation', 'monitoring'].includes(d.profile ?? '') &&
    d.schemaVersion === 3 &&
    typeof d.clock === 'number' &&
    Number.isFinite(d.clock) &&
    !!d.greenhouse?.id &&
    !!d.cycle?.id &&
    Array.isArray(d.zones) &&
    d.zones.length >= 1 &&
    d.zones.length <= 32 &&
    d.zones.every(
      (z) =>
        typeof z.id === 'string' &&
        validZoneId(z.id) &&
        Number.isFinite(z.area) &&
        z.area >= 0 &&
        Number.isInteger(z.plants) &&
        z.plants >= 0,
    ) &&
    new Set(d.zones.map((z) => z.id)).size === d.zones.length &&
    validCultivation(d as DomainState) &&
    Array.isArray(d.devices) &&
    d.devices.every(
      (x) => typeof x.id === 'string' && Array.isArray(x.capabilities) && Array.isArray(x.zones),
    ) &&
    Array.isArray(d.routines) &&
    d.routines.every(
      (r) =>
        !!r.trigger?.type &&
        !!r.version?.id &&
        Array.isArray(r.version.steps) &&
        Array.isArray(r.version.requiredDevices),
    ) &&
    Array.isArray(d.runs) &&
    d.runs.every((r) => Array.isArray(r.steps) && !!r.snapshot?.id) &&
    Array.isArray(d.expenses) &&
    d.expenses.every((e) => Number.isFinite(e.amount) && typeof e.paidAt === 'string') &&
    [
      'commands',
      'locks',
      'usages',
      'maintenance',
      'events',
      'allocations',
      'budgets',
      'plans',
      'cases',
      'inspections',
      'observations',
      'nutrientProfiles',
      'recurring',
      'overrides',
      'seenTriggers',
    ].every((k) => Array.isArray((d as Record<string, unknown>)[k]))
  );
}
export function hydrate(serialized: string | null): DomainState {
  const base = createFixture();
  if (!serialized) return base;
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isValid(parsed)) throw new Error('Invalid schema');
    const s = parsed;
    for (const key of ['targets', 'supplies', 'resources'] as const) {
      const valid =
        key === 'targets'
          ? validTargets(s[key])
          : key === 'supplies'
            ? validSupplies(s[key])
            : validResources(s[key], s.cycle.id);
      if (s[key] && !valid) {
        delete s[key];
        s.storageWarning =
          'Some extended records could not be read. Greenhouse data and expenses remain available; review the affected modules.';
      }
    }
    for (const run of s.runs)
      if (run.evidence && !validEvidence(run.evidence)) {
        delete run.evidence;
        s.storageWarning =
          'Sensor evidence for some runs could not be read. Execution history remains available.';
      }
    if (s.energy && !validEnergy(s.energy)) {
      delete s.energy;
      s.storageWarning =
        'Energy assumptions could not be read. Greenhouse data remains available; re-enter the energy scenario.';
    }
    if (s.production && !validProduction(s.production, s.cycle.id)) {
      delete s.production;
      s.storageWarning =
        'Cycle records could not be read. Monitoring and expenses are retained; review harvest records before continuing.';
    }
    s.playing = false;
    s.notification = null;
    let interrupted = false;
    for (const r of s.runs.filter((r) => isActiveRun(r.status))) {
      r.status = 'Needs reconciliation';
      r.reason =
        'Session interrupted or page reloaded. Shutdown is unconfirmed; execution will not resume automatically.';
      for (const l of s.locks.filter((l) => l.runId === r.id)) l.state = 'unknown';
      for (const u of s.usages.filter((u) => u.runId === r.id)) u.deliveryConfirmed = false;
      interrupted = true;
    }
    if (interrupted) {
      s.storageWarning =
        'The previous session had active runs. Review their state in Automation before releasing resources.';
      activity(
        s,
        'system',
        'Previous session interrupted',
        'Active runs marked for state review; they will not resume automatically.',
        'demo',
      );
    }
    return s;
  } catch {
    base.storageWarning =
      'Saved data could not be read. Sample records were restored so the page remains usable.';
    return base;
  }
}
