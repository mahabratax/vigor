import { activity, isActiveRun, iso, localDate, nextId } from './format';
import type { DomainState, Zone } from './types';
import { GROWING_METHODS, PLANT_STAGES, type CultivationState, type ZoneAction } from './zoneTypes';

export const validZoneId = (id: string) => /^[A-Z][A-Z0-9-]{0,9}$/.test(id);
export const zoneName = (s: DomainState, id: string) =>
  s.zones.find((z) => z.id === id)?.name ?? `Zone ${id}`;
export function cultivation(s: DomainState): CultivationState {
  if (s.cultivation) return s.cultivation;
  return {
    version: 1,
    nextZoneNumber:
      Math.max(
        0,
        ...s.zones.map((z) =>
          /^[A-Z]$/.test(z.id) ? z.id.charCodeAt(0) - 64 : Number(z.id.slice(1)) || 0,
        ),
      ) + 1,
    batches: s.zones
      .filter((z) => z.plants > 0)
      .map((z) => ({
        id: `BATCH-${z.id}-001`,
        zoneId: z.id,
        cycleId: s.cycle.id,
        crop: s.cycle.crop,
        variety: '',
        plantedOn: s.cycle.plantedOn,
        targetHarvestOn: '',
        stage: PLANT_STAGES.includes(s.cycle.phase as (typeof PLANT_STAGES)[number])
          ? (s.cycle.phase as (typeof PLANT_STAGES)[number])
          : ['Berbuah', 'Fruiting'].includes(s.cycle.phase)
            ? 'Generatif'
            : 'Vegetatif',
        seedSource: '',
        notes: '',
        initialPlants: z.plants,
        currentPlants: z.plants,
        status: 'active',
      })),
    movements: [],
  };
}
export const activeBatch = (s: DomainState, zoneId: string) =>
  cultivation(s).batches.find((b) => b.zoneId === zoneId && b.status === 'active');
export const zoneCapacity = (z: Zone) => z.capacity ?? z.plants;
export function validCultivation(s: DomainState) {
  const c = s.cultivation;
  if (!c) return true;
  const nonnegative = (n: number) => Number.isInteger(n) && n >= 0;
  return (
    c.version === 1 &&
    Number.isInteger(c.nextZoneNumber) &&
    c.nextZoneNumber > 0 &&
    Array.isArray(c.batches) &&
    Array.isArray(c.movements) &&
    new Set(c.batches.map((b) => b?.id)).size === c.batches.length &&
    c.batches.every(
      (b) =>
        b &&
        typeof b.id === 'string' &&
        s.zones.some((z) => z.id === b.zoneId) &&
        b.cycleId === s.cycle.id &&
        [b.crop, b.variety, b.plantedOn, b.targetHarvestOn, b.seedSource, b.notes].every(
          (v) => typeof v === 'string',
        ) &&
        PLANT_STAGES.includes(b.stage) &&
        ['active', 'completed'].includes(b.status) &&
        nonnegative(b.initialPlants) &&
        nonnegative(b.currentPlants) &&
        (b.status !== 'completed' || b.currentPlants === 0),
    ) &&
    s.zones.every(
      (z) =>
        c.batches.filter((b) => b.zoneId === z.id && b.status === 'active').length <= 1 &&
        c.batches
          .filter((b) => b.zoneId === z.id && b.status === 'active')
          .reduce((n, b) => n + b.currentPlants, 0) === z.plants,
    ) &&
    c.movements.every(
      (m) =>
        m &&
        c.batches.some((b) => b.id === m.batchId) &&
        ['add', 'loss', 'remove'].includes(m.kind) &&
        nonnegative(m.quantity) &&
        nonnegative(m.balance) &&
        [m.id, m.key, m.at, m.reason, m.actor].every((v) => typeof v === 'string'),
    )
  );
}
export function initializeCultivation(s: DomainState) {
  const migrating = !s.cultivation;
  s.cultivation = cultivation(s);
  if (migrating && s.production) {
    s.production.tasks.forEach((t) => {
      t.plantingId ??= activeBatch(s, t.zoneId)?.id;
    });
    s.production.lots.forEach((l) => {
      const b = activeBatch(s, l.zoneId);
      l.plantingId ??= b?.id;
      l.crop ??= b?.crop ?? s.cycle.crop;
      l.variety ??= b?.variety ?? '';
    });
  }
  s.zones.forEach((z) => {
    z.capacity ??= z.plants;
    z.status ??= 'active';
  });
}
export function syncPlantCounts(s: DomainState) {
  const batches = cultivation(s).batches.filter((b) => b.status === 'active');
  s.zones.forEach((z) => {
    z.plants = batches.filter((b) => b.zoneId === z.id).reduce((n, b) => n + b.currentPlants, 0);
  });
  s.cycle.plants = s.zones.reduce((n, z) => n + z.plants, 0);
  const crops = [...new Set(batches.map((b) => b.crop))],
    phases = [...new Set(batches.map((b) => b.stage))];
  const historicalCrops = [...new Set(cultivation(s).batches.map((b) => b.crop))];
  s.cycle.crop = crops.length
    ? crops.join(', ')
    : historicalCrops.length
      ? historicalCrops.join(', ')
      : s.cycle.crop;
  s.cycle.phase = phases.length === 1 ? phases[0] : phases.length ? 'Mixed stages' : 'Preparation';
}
function check(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
function integer(n: number, label: string, min = 0) {
  check(
    Number.isInteger(n) && n >= min && n <= 10000000,
    `${label} must be a whole number ${min}–10.000.000.`,
  );
}
function text(v: string, label: string, min = 0, max = 2000) {
  check(
    typeof v === 'string' && v.trim().length >= min && v.length <= max,
    `${label} must be ${min}–${max} karakter.`,
  );
}
function date(d: string) {
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
      Number.isFinite(Date.parse(d)) &&
      new Date(d).toISOString().slice(0, 10) === d,
    'Invalid date.',
  );
}
export function zoneBusy(s: DomainState, id: string) {
  return s.runs.some(
    (r) =>
      (isActiveRun(r.status) || r.status === 'Needs reconciliation') &&
      r.snapshot.zones.includes(id),
  );
}
export function zoneReferences(s: DomainState, id: string) {
  const devices = s.devices.filter((d) => d.zones.includes(id));
  return {
    devices: devices.length,
    routines: s.routines.filter((r) => r.version.zones.includes(id)).length,
    batches: cultivation(s).batches.filter((b) => b.zoneId === id).length,
    cases: s.cases.filter((c) => c.zoneId === id).length,
    records:
      s.nutrientProfiles.filter((p) => p.zones.includes(id)).length +
      (s.production?.tasks.filter((t) => t.zoneId === id).length ?? 0) +
      (s.production?.lots.filter((l) => l.zoneId === id).length ?? 0) +
      s.observations.filter((o) => o.zoneId === id).length +
      s.expenses.filter((e) => e.zoneId === id).length +
      s.allocations.filter((a) => a.zoneId === id).length +
      s.runs.filter((r) => r.snapshot.zones.includes(id)).length,
  };
}
export function zoneDeleteBlocker(s: DomainState, id: string) {
  if (s.zones.length <= 1) return 'Keep at least one zone in the greenhouse.';
  if (zoneBusy(s, id)) return 'Complete or reconcile executions in this zone.';
  if (Object.values(zoneReferences(s, id)).some((n) => n > 0))
    return 'This zone has linked records. Resolve its active work, then deactivate it to retain history.';
  return '';
}
export function zoneInactiveBlocker(s: DomainState, id: string) {
  if (activeBatch(s, id)) return 'Close planting batches before deactivating the zone.';
  if (zoneBusy(s, id)) return 'Complete or reconcile executions in this zone.';
  if (s.routines.some((r) => r.status === 'Active' && r.version.zones.includes(id)))
    return 'Pause zone routines before deactivating it.';
  if (
    s.cases.some((c) => c.zoneId === id && c.status !== 'closed') ||
    s.production?.tasks.some((t) => t.zoneId === id && t.status === 'pending')
  )
    return 'Complete care tasks and pest cases in this zone.';
  return '';
}
/** All mutations operate on the transition clone; failed validation cannot partially change data. */
export function applyZoneAction(s: DomainState, a: ZoneAction) {
  check(
    s.production?.stage !== 'closed',
    'The cycle is closed. Reopen its review before editing zones or plants.',
  );
  initializeCultivation(s);
  const state = s.cultivation!;
  let id: string | undefined,
    selectedZone: string | undefined,
    message = '';
  const getZone = (id: string) => {
    const z = s.zones.find((z) => z.id === id);
    check(z, 'Zone not found.');
    return z;
  };
  switch (a.type) {
    case 'zone_save': {
      const z = a.id ? getZone(a.id) : undefined,
        d = a.zone;
      text(d.name, 'Zone name', 2, 80);
      text(d.notes, 'Notes', 0, 1000);
      check(
        !s.zones.some(
          (other) => other.id !== a.id && other.name.toLowerCase() === d.name.trim().toLowerCase(),
        ),
        'Zone name already exists.',
      );
      check(
        Number.isFinite(d.area) &&
          d.area >= 0 &&
          Math.abs(d.area * 100 - Math.round(d.area * 100)) < 0.000001,
        'Zone area must be at least 0 m², with up to two decimal places.',
      );
      check(
        s.zones.filter((other) => other.id !== a.id).reduce((n, other) => n + other.area, 0) +
          d.area <=
          s.greenhouse.plantedArea + 0.000001,
        "Zone areas exceed the greenhouse's planted area. Reduce other zone allocations or update the greenhouse profile.",
      );
      integer(d.capacity, 'Capacity');
      integer(d.beds, 'Number of beds');
      check(
        d.capacity >= (z?.plants ?? 0),
        'Capacity cannot be lower than the active plant count.',
      );
      check(d.capacity === 0 || d.area > 0, 'Enter zone area before setting planting capacity.');
      check(
        GROWING_METHODS.includes(d.method as (typeof GROWING_METHODS)[number]),
        'Select an available growing method.',
      );
      if (z)
        check(
          !zoneBusy(s, z.id),
          'Pause and complete zone executions before changing configuration.',
        );
      if (!z) check(s.zones.length < 32, 'The prototype supports up to 32 zones per greenhouse.');
      const n = state.nextZoneNumber;
      id = z?.id ?? (n <= 26 ? String.fromCharCode(64 + n) : `Z${n}`);
      const profile = { ...d, name: d.name.trim(), notes: d.notes.trim() };
      if (z) Object.assign(z, profile);
      else {
        state.nextZoneNumber++;
        s.zones.push({
          id,
          ...profile,
          plants: 0,
          validated: false,
          temperature: 0,
          humidity: 0,
          status: 'active',
        });
      }
      selectedZone = id;
      message = z
        ? 'Zone configuration updated.'
        : 'Zone added. Record a planting batch and assign devices.';
      break;
    }
    case 'zone_status': {
      const z = getZone(a.id);
      if (a.inactive) {
        const blocker = zoneInactiveBlocker(s, z.id);
        check(!blocker, blocker);
      }
      z.status = a.inactive ? 'inactive' : 'active';
      z.validated = false;
      id = selectedZone = z.id;
      message = a.inactive
        ? 'Zone deactivated. History retained.'
        : 'Zone activated. Check installation before monitoring.';
      break;
    }
    case 'zone_delete': {
      const z = getZone(a.id),
        blocker = zoneDeleteBlocker(s, z.id);
      check(!blocker, blocker);
      check(a.confirmation.trim() === z.name, 'Type the exact zone name to delete it.');
      s.zones = s.zones.filter((other) => other.id !== z.id);
      id = selectedZone = z.id;
      message = 'Empty zone deleted.';
      break;
    }
    case 'zone_devices': {
      const z = getZone(a.id);
      check(z.status !== 'inactive', 'Activate the zone before assigning devices.');
      check(
        a.deviceIds.every((id) => s.devices.some((d) => d.id === id)),
        'Device not found.',
      );
      for (const d of s.devices) {
        const selected = a.deviceIds.includes(d.id),
          was = d.zones.includes(z.id);
        if (selected === was) continue;
        check(
          !s.runs.some(
            (r) =>
              (isActiveRun(r.status) || r.status === 'Needs reconciliation') &&
              (r.snapshot.requiredDevices.includes(d.id) ||
                r.steps.some((step) => step.deviceIds.includes(d.id))),
          ),
          'The device is used by an active run or needs reconciliation.',
        );
        check(
          !s.routines.some(
            (r) =>
              r.version.requiredDevices.includes(d.id) ||
              r.version.steps.some((step) => step.deviceIds.includes(d.id)),
          ),
          "This device is linked to a routine. Update the routine's devices before moving it.",
        );
        const previous = [...d.zones];
        d.zones = selected
          ? ['camera', 'sensor'].includes(d.type)
            ? [z.id]
            : [...d.zones, z.id]
          : d.zones.filter((id) => id !== z.id);
        d.calibrated = false;
        s.zones
          .filter((other) => previous.includes(other.id) || other.id === z.id)
          .forEach((other) => {
            other.validated = false;
          });
      }
      id = selectedZone = z.id;
      message = 'Device placement saved. Recheck calibration; cost history is retained.';
      break;
    }
    case 'planting_save': {
      const z = getZone(a.zoneId),
        b = a.id ? state.batches.find((b) => b.id === a.id) : undefined,
        d = a.batch;
      check(z.status !== 'inactive', 'Activate the zone before recording plants.');
      if (a.id) check(b && b.zoneId === z.id && b.status === 'active', 'Active batch not found.');
      else
        check(
          !activeBatch(s, z.id),
          'Close the active batch before planting a new batch in this zone.',
        );
      text(d.crop, 'Crop', 2, 80);
      text(d.variety, 'Variety', 0, 80);
      text(d.seedSource, 'Seed source', 0, 120);
      text(d.notes, 'Notes', 0, 1000);
      check(PLANT_STAGES.includes(d.stage), 'Select an available crop stage.');
      date(d.plantedOn);
      check(
        d.plantedOn >= s.cycle.plantedOn && d.plantedOn <= localDate(s.clock),
        'Planting date must fall within the cycle and cannot be in the future.',
      );
      if (d.targetHarvestOn) {
        date(d.targetHarvestOn);
        check(d.targetHarvestOn >= d.plantedOn, 'Target harvest date cannot precede planting.');
      }
      if (b) {
        check(
          !state.movements.some(
            (m) => m.batchId === b.id && localDate(Date.parse(m.at) / 1000) < d.plantedOn,
          ),
          'Planting date is later than existing population records.',
        );
        const lots = s.production?.lots.filter((l) => l.plantingId === b.id) ?? [];
        check(
          !s.production?.tasks.some((t) => t.plantingId === b.id && t.dueOn < d.plantedOn),
          'Planting date is later than existing care records.',
        );
        check(
          !lots.some((l) => l.date < d.plantedOn),
          'Planting date is later than existing harvest records.',
        );
        check(
          !lots.length || (b.crop === d.crop.trim() && b.variety === d.variety.trim()),
          'Crop identity is linked to harvest records. Crop and variety cannot be changed.',
        );
        Object.assign(b, d, { crop: d.crop.trim(), variety: d.variety.trim() });
        id = b.id;
      } else {
        integer(a.plants, 'Plant count', 1);
        check(a.plants <= zoneCapacity(z), 'Plant count exceeds zone capacity.');
        check(z.area > 0, 'Enter zone area before recording plants.');
        id = nextId('BATCH', state.batches);
        state.batches.push({
          ...d,
          crop: d.crop.trim(),
          variety: d.variety.trim(),
          id,
          zoneId: z.id,
          cycleId: s.cycle.id,
          initialPlants: a.plants,
          currentPlants: a.plants,
          status: 'active',
        });
      }
      selectedZone = z.id;
      message = b
        ? 'Crop details updated.'
        : 'Planting batch recorded. Continue with care tasks and zone monitoring.';
      break;
    }
    case 'planting_count': {
      const duplicate = state.movements.find((m) => m.key === a.key);
      if (duplicate)
        return {
          ok: true as const,
          message: 'Population change already recorded.',
          id: duplicate.id,
        };
      const b = state.batches.find((b) => b.id === a.id && b.status === 'active');
      check(b, 'Active batch not found.');
      integer(a.quantity, 'Change quantity', 1);
      text(a.reason, 'Reason', 5, 1000);
      text(a.key, 'Record key', 3, 200);
      check(['add', 'loss', 'remove'].includes(a.kind), 'Select a population change type.');
      const next = b.currentPlants + (a.kind === 'add' ? a.quantity : -a.quantity);
      check(
        next >= 0 && next <= zoneCapacity(getZone(b.zoneId)),
        'Final count must be between zero and zone capacity.',
      );
      b.currentPlants = next;
      id = nextId('POP', state.movements);
      state.movements.push({
        id,
        batchId: b.id,
        at: iso(s.clock),
        kind: a.kind,
        quantity: a.quantity,
        balance: next,
        reason: a.reason.trim(),
        actor: a.actor ?? 'Sample operator',
        key: a.key,
      });
      selectedZone = b.zoneId;
      message = 'Population change recorded. Harvest stock and costs do not change automatically.';
      break;
    }
    case 'planting_close': {
      const b = state.batches.find((b) => b.id === a.id && b.status === 'active');
      check(b, 'Active batch not found.');
      check(
        b.currentPlants === 0,
        'Record removals until the active population reaches zero before closing the batch.',
      );
      check(!zoneBusy(s, b.zoneId), 'Complete or reconcile executions in this zone.');
      check(
        !s.cases.some((c) => c.zoneId === b.zoneId && c.status !== 'closed') &&
          !s.production?.tasks.some((t) => t.zoneId === b.zoneId && t.status === 'pending'),
        'Complete care tasks and pest cases in this zone.',
      );
      check(
        !s.routines.some((r) => r.status === 'Active' && r.version.zones.includes(b.zoneId)),
        'Pause zone routines before closing the batch.',
      );
      text(a.notes, 'Closing notes', 5, 1000);
      b.status = 'completed';
      b.closedOn = localDate(s.clock);
      b.closingNotes = a.notes.trim();
      id = b.id;
      selectedZone = b.zoneId;
      message =
        'Batch closed. The zone can receive a new batch; harvest and sales history remain linked.';
      break;
    }
  }
  syncPlantCounts(s);
  activity(
    s,
    'system',
    message,
    a.type === 'planting_close'
      ? a.notes
      : a.type === 'planting_count'
        ? a.reason
        : 'Record linked to zone and cycle ' + s.cycle.id,
    id ?? selectedZone ?? s.cycle.id,
    selectedZone,
    a.actor,
  );
  s.notification = message;
  return { ok: true as const, message, id };
}
