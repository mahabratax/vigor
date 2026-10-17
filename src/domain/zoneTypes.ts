import type { ZoneId } from './types';

export const PLANT_STAGES = ['Persemaian', 'Vegetatif', 'Generatif', 'Panen'] as const;
export type PlantStage = (typeof PLANT_STAGES)[number];
export const GROWING_METHODS = [
  'Belum ditentukan',
  'Tanah / bedengan',
  'Polybag',
  'Hidroponik',
  'Substrat / drip',
] as const;
export interface PlantingBatch {
  id: string;
  zoneId: ZoneId;
  cycleId: string;
  crop: string;
  variety: string;
  plantedOn: string;
  targetHarvestOn: string;
  stage: PlantStage;
  seedSource: string;
  notes: string;
  initialPlants: number;
  currentPlants: number;
  status: 'active' | 'completed';
  closedOn?: string;
  closingNotes?: string;
}
export interface PlantMovement {
  id: string;
  batchId: string;
  at: string;
  kind: 'add' | 'loss' | 'remove';
  quantity: number;
  balance: number;
  reason: string;
  actor: string;
  key: string;
}
export interface CultivationState {
  version: 1;
  nextZoneNumber: number;
  batches: PlantingBatch[];
  movements: PlantMovement[];
}
export interface ZoneDraft {
  name: string;
  area: number;
  capacity: number;
  beds: number;
  method: string;
  notes: string;
}
export type BatchDraft = Pick<
  PlantingBatch,
  'crop' | 'variety' | 'plantedOn' | 'targetHarvestOn' | 'stage' | 'seedSource' | 'notes'
>;
export type ZoneAction = (
  | { type: 'zone_save'; id?: string; zone: ZoneDraft }
  | { type: 'zone_status'; id: string; inactive: boolean }
  | { type: 'zone_delete'; id: string; confirmation: string }
  | { type: 'zone_devices'; id: string; deviceIds: string[] }
  | { type: 'planting_save'; id?: string; zoneId: string; batch: BatchDraft; plants: number }
  | {
      type: 'planting_count';
      id: string;
      kind: PlantMovement['kind'];
      quantity: number;
      reason: string;
      key: string;
    }
  | { type: 'planting_close'; id: string; notes: string }
) & { actor?: string };
