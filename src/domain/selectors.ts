import { isActiveRun, localDate } from './format';
import { availableDevices, nextScheduled } from './scheduler';
import type { DomainState, ZoneId } from './types';
import { observationsForZone } from './observations';
export function kpis(s: DomainState) {
  const observation = availableDevices(s).filter((d) => ['camera', 'sensor'].includes(d.type));
  const validated = s.zones.filter(
    (z) =>
      z.validated &&
      z.status !== 'inactive' &&
      ['camera', 'sensor'].every((type) =>
        observation.some((d) => d.type === type && d.zones.includes(z.id)),
      ) &&
      observation
        .filter((d) => d.zones.includes(z.id))
        .every((d) => d.connection === 'online' && d.calibrated),
  );
  return {
    inspection: s.cases.filter((c) => c.status === 'inspection').length,
    monitoring: s.cases.filter((c) => c.status === 'monitoring').length,
    coverage: validated.length,
    observationsOnline: observation.filter((d) => d.connection === 'online').length,
    observationsTotal: observation.length,
    closed: s.cases.filter(
      (c) =>
        c.status === 'closed' &&
        c.closedAt &&
        Date.parse(c.closedAt) / 1000 >= s.clock - 7 * 86400 &&
        Date.parse(c.closedAt) / 1000 <= s.clock,
    ).length,
    devices: availableDevices(s).length,
    online: availableDevices(s).filter((d) => d.connection === 'online').length,
    routines: s.routines.filter((r) => r.status === 'Active').length,
    active: s.runs.filter((r) => isActiveRun(r.status)),
    exceptions: s.runs.filter((r) =>
      ['Blocked', 'Failed', 'Needs reconciliation'].includes(r.status),
    ),
    next: nextScheduled(s)[0] ?? null,
  };
}
export function zoneStatus(s: DomainState, z: ZoneId) {
  const zone = s.zones.find((x) => x.id === z);
  if (zone?.status === 'inactive') return { label: 'Zone inactive', tone: 'gray' };
  const camera = s.devices.find((d) => d.type === 'camera' && d.zones.includes(z));
  if (!camera) return { label: 'No camera registered', tone: 'gray' };
  if (!camera?.active || camera.connection !== 'online')
    return { label: 'Camera offline', tone: 'amber' };
  if (!zone?.validated) return { label: 'Not validated', tone: 'gray' };
  if (s.cases.some((c) => c.zoneId === z && c.status === 'inspection'))
    return { label: 'Inspection needed', tone: 'amber' };
  if (s.cases.some((c) => c.zoneId === z && c.status === 'monitoring'))
    return { label: 'Follow-up monitoring', tone: 'blue' };
  return { label: 'Monitoring active', tone: 'green' };
}
export function todayUsage(s: DomainState) {
  const rows = s.usages.filter((u) => localDate(Date.parse(u.at) / 1000) === localDate(s.clock));
  return {
    water: rows.reduce((a, r) => a + r.waterLiters, 0),
    nutrition: rows.reduce((a, r) => a + r.nutrientUnits, 0),
    energy: rows.reduce((a, r) => a + r.energyKwh, 0),
    measured: rows.some((r) => r.waterSource === 'measured_demo'),
    uncertain: rows.some((r) => !r.deliveryConfirmed),
  };
}
export function trendData(s: DomainState) {
  const byZone = new Map(s.zones.map((z) => [z.id, observationsForZone(s, z.id)]));
  const dates = [
    ...new Set(
      [...byZone.values()]
        .flat()
        .filter((o) => Number.isFinite(Date.parse(o.at)) && Date.parse(o.at) / 1000 <= s.clock)
        .map((o) => localDate(Date.parse(o.at) / 1000)),
    ),
  ]
    .sort()
    .slice(-6);
  return dates.map((day) => {
    const row: Record<string, string | number | null> = {
      day: new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(day + 'T00:00:00+07:00')),
    };
    for (const z of s.zones) {
      const reading = byZone
        .get(z.id)!
        .filter(
          (o) =>
            Number.isFinite(Date.parse(o.at)) &&
            Date.parse(o.at) / 1000 <= s.clock &&
            localDate(Date.parse(o.at) / 1000) === day,
        )
        .at(-1);
      row[z.id] = reading?.newCaptures ?? null;
    }
    return row;
  });
}
export function deviceActivity(s: DomainState, id: string) {
  const uncertain = s.runs.find(
    (r) => r.status === 'Needs reconciliation' && r.snapshot.requiredDevices.includes(id),
  );
  if (uncertain) return { label: 'Unconfirmed', runId: uncertain.id, tone: 'red' };
  const run = s.runs.find(
    (r) => isActiveRun(r.status) && r.steps[r.stepIndex]?.deviceIds.includes(id),
  );
  return run
    ? { label: run.status === 'Queued' ? 'Queued' : 'Digunakan', runId: run.id, tone: 'green' }
    : { label: 'Standby', runId: null, tone: 'gray' };
}
