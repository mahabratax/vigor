import type { DomainState, Zone } from '../../domain/types';
import { activeBatch } from '../../domain/zones';

export type CropKind = 'pepper' | 'tomato' | 'leafy' | 'generic';
export type BedKind = 'soil' | 'bags' | 'channels';
export interface CropAppearance {
  kind: CropKind;
  bed: BedKind;
  seedling: boolean;
  fruiting: boolean;
  inactive: boolean;
  plants: number;
}
export const PLANTS_PER_PLOT = 18;
export const LEAVES_PER_PLANT = 10;

/** Appearance follows the recorded batch; it is not a plant-health prediction. */
export function cropAppearance(s: DomainState, z: Zone): CropAppearance {
  const batch = activeBatch(s, z.id);
  const crop = batch?.crop.toLowerCase() ?? '';
  const kind: CropKind = /paprika|cabai|pepper|chilli|chili/.test(crop)
    ? 'pepper'
    : /tomat/.test(crop)
      ? 'tomato'
      : /selada|pakcoy|sawi|bayam|kangkung|lettuce|bok choy|spinach|mustard greens/.test(crop)
        ? 'leafy'
        : 'generic';
  return {
    kind,
    bed:
      z.method === 'Hidroponik'
        ? 'channels'
        : /Polybag|Substrat/.test(z.method ?? '')
          ? 'bags'
          : 'soil',
    seedling: batch?.stage === 'Persemaian',
    fruiting:
      !!batch &&
      ['Generatif', 'Panen'].includes(batch.stage) &&
      ['pepper', 'tomato'].includes(kind),
    inactive: z.status === 'inactive',
    plants: batch && z.status !== 'inactive' ? z.plants : 0,
  };
}

export function plantingPoints(plants: number) {
  return Array.from(
    { length: Math.min(PLANTS_PER_PLOT, Math.max(0, Math.floor(plants))) },
    (_, i) => ({
      x: ((i % 6) - 2.5) * 0.55,
      z: (Math.floor(i / 6) - 1) * 0.77,
      variation: 0.9 + ((i * 7) % 5) * 0.045,
      angle: i * 2.39996,
    }),
  );
}
