import type { PlantStage } from './zoneTypes';
import type { Scenario } from './types';

export const TARGET_METRICS = ['temperature', 'humidity', 'media', 'ec', 'ph'] as const;
export type TargetMetric = (typeof TARGET_METRICS)[number];
export type ReadingMetric = TargetMetric | 'level' | 'flow';
export type TargetLimits = Partial<Record<TargetMetric, { min: number; max: number }>>;
export interface TargetRevision {
  id: string;
  batchId: string;
  zoneId: string;
  crop: string;
  variety: string;
  stage: PlantStage;
  version: number;
  limits: TargetLimits;
  notes: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'active' | 'superseded';
  reviewedAt?: string;
  reviewedBy?: string;
}
export interface TargetState {
  version: 1;
  revisions: TargetRevision[];
}
export interface EvidenceReading {
  deviceId: string;
  label: string;
  zoneIds: string[];
  metric: ReadingMetric;
  value: number | null;
  unit: string;
  quality: string;
  targets: { zoneId: string; batchId: string; revisionId: string; min: number; max: number }[];
}
export interface EvidenceSnapshot {
  id: string;
  at: number;
  scenario: Scenario;
  readings: EvidenceReading[];
}
export type OutcomeVerdict = 'improved' | 'unchanged' | 'worse' | 'inconclusive';
export interface RunEvidence {
  before: EvidenceSnapshot;
  after?: EvidenceSnapshot;
  followUps: EvidenceSnapshot[];
  reviews: {
    id: string;
    afterId: string;
    verdict: OutcomeVerdict;
    notes: string;
    actor: string;
    at: string;
    key: string;
  }[];
}
export type GrowingAction =
  | {
      type: 'target_save';
      batchId: string;
      stage: PlantStage;
      limits: TargetLimits;
      notes: string;
      actor?: string;
    }
  | { type: 'target_activate'; id: string; actor?: string }
  | { type: 'outcome_capture'; runId: string; actor?: string }
  | {
      type: 'outcome_review';
      runId: string;
      afterId: string;
      verdict: OutcomeVerdict;
      notes: string;
      key: string;
      actor?: string;
    };
