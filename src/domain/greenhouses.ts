import { START, isActiveRun } from './format';
import type { DomainState, Greenhouse, ZoneId } from './types';
import type { Role } from '../features/access/permissions';

export type GreenhouseProfile = Pick<Greenhouse, 'name' | 'location' | 'area' | 'plantedArea'>;
export type GreenhouseDraft = GreenhouseProfile & {
  crop: string;
  plantedOn: string;
  plants: number;
};
export type GreenhouseActor = { name: string; role: Role; greenhouseIds: string[] };
export const validGreenhouseId = (id: unknown): id is string =>
  typeof id === 'string' && /^GH-\d{2,8}$/.test(id);

export function validateGreenhouseProfile(
  draft: GreenhouseProfile,
  bank: Record<string, DomainState>,
  exceptId?: string,
) {
  const name = draft.name.trim(),
    location = draft.location.trim();
  if (name.length < 2 || name.length > 80 || location.length < 2 || location.length > 120)
    throw new Error('Enter a name of 2–80 characters and a location of 2–120 characters.');
  if (
    Object.values(bank).some(
      (s) =>
        s.greenhouse.id !== exceptId &&
        s.greenhouse.name.trim().toLowerCase() === name.toLowerCase(),
    )
  )
    throw new Error('Greenhouse name already exists. Choose a different name.');
  if (!Number.isFinite(draft.area) || draft.area <= 0 || draft.area > 10000000)
    throw new Error('Total area must be greater than zero and no more than 10,000,000 m².');
  if (
    !Number.isFinite(draft.plantedArea) ||
    draft.plantedArea < 0 ||
    draft.plantedArea > draft.area
  )
    throw new Error('Planted area cannot be negative or exceed total area.');
  if (
    [draft.area, draft.plantedArea].some(
      (area) => Math.abs(area * 100 - Math.round(area * 100)) > 0.000001,
    )
  )
    throw new Error('Use no more than two decimal places for area.');
  return { name, location, area: draft.area, plantedArea: draft.plantedArea };
}

/** Six starting zones are configuration, not fabricated monitoring history. */
export function emptyGreenhouse(id: string, draft: GreenhouseDraft): DomainState {
  if (draft.crop.trim().length < 2 || draft.crop.trim().length > 80)
    throw new Error('Enter a crop name of 2–80 characters.');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.plantedOn) ||
    !Number.isFinite(Date.parse(draft.plantedOn)) ||
    new Date(draft.plantedOn).toISOString().slice(0, 10) !== draft.plantedOn
  )
    throw new Error('Enter a valid cycle start date.');
  if (!Number.isInteger(draft.plants) || draft.plants < 0 || draft.plants > 10000000)
    throw new Error('Plant count must be a whole number between 0 and 10,000,000.');
  const zones: ZoneId[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  const total = Math.round(draft.plantedArea * 100);
  return {
    schemaVersion: 3,
    greenhouse: {
      id,
      name: draft.name.trim(),
      location: draft.location.trim(),
      area: draft.area,
      plantedArea: draft.plantedArea,
      source: 'custom',
    },
    cycle: {
      id: `${id}-${draft.plantedOn.replaceAll('-', '')}`,
      crop: draft.crop.trim(),
      phase: draft.plants ? 'Vegetatif' : 'Persiapan',
      plantedOn: draft.plantedOn,
      plants: draft.plants,
    },
    zones: zones.map((zone, index) => ({
      id: zone,
      name: `Zone ${zone}`,
      area: (Math.floor(total / 6) + (index < total % 6 ? 1 : 0)) / 100,
      plants: Math.floor(draft.plants / 6) + (index < draft.plants % 6 ? 1 : 0),
      validated: false,
      temperature: 0,
      humidity: 0,
    })),
    devices: [],
    cases: [],
    inspections: [],
    plans: [],
    observations: [],
    routines: [],
    nutrientProfiles: [],
    runs: [],
    commands: [],
    locks: [],
    usages: [],
    maintenance: [],
    events: [],
    expenses: [],
    allocations: [],
    recurring: [],
    budgets: [],
    baseline: null,
    overrides: [],
    seenTriggers: [],
    episodes: {},
    costs: {
      electricityPerKwh: 1500,
      waterPerLiter: 10,
      nutrientUnitPrice: 2500,
      plannerZones: 2,
      ownedController: false,
      contingencyPercent: 10,
    },
    clock: START,
    playing: false,
    speed: 60,
    scenario: 'normal',
    profile: 'monitoring',
    storageWarning: null,
    notification: null,
  };
}

export function updateGreenhouseProfile(s: DomainState, profile: GreenhouseProfile): DomainState {
  const allocated = s.zones.reduce((sum, zone) => sum + zone.area, 0);
  if (profile.plantedArea + 0.000001 < allocated)
    throw new Error('Planted area is smaller than allocated zones. Update zone areas first.');
  return { ...s, greenhouse: { ...s.greenhouse, ...profile } };
}

export function greenhouseDeleteBlocker(s: DomainState, count: number) {
  if (count < 2) return 'The last greenhouse cannot be deleted. Add a replacement first.';
  if (
    s.playing ||
    s.runs.some((r) => isActiveRun(r.status) || r.status === 'Needs reconciliation') ||
    s.locks.length
  )
    return 'Pause the simulation and resolve active runs or state reviews before deleting this greenhouse.';
  return '';
}
