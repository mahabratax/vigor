import type { DomainState, Observation, ZoneId } from './types';

/** Shared readings for charts and rule evaluation, including the existing demo scenarios. */
export function observationsForZone(s: DomainState, zoneId: ZoneId): Observation[] {
  const rows = s.observations
    .filter((o) => o.zoneId === zoneId)
    .map((o) => ({ ...o }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const latest = rows.at(-1);
  if (latest && zoneId === 'B') {
    if (s.scenario === 'insufficient') latest.newCaptures = null;
    if (s.scenario === 'increasing') latest.newCaptures = 34;
  }
  return rows;
}
