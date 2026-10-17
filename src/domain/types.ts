import type { ProductionState } from './productionTypes';
import type { CultivationState } from './zoneTypes';
import type { EnergyConfig } from './energy';
import type { RunEvidence, TargetState } from './growingTypes';
import type { SupplyState } from './supplyTypes';
import type { ResourceState } from './efficiency';
export type ZoneId = string;
export type Connection = 'online' | 'stale' | 'offline';
export type Capability =
  | 'camera'
  | 'temperature'
  | 'humidity'
  | 'pump'
  | 'valve'
  | 'flow'
  | 'level'
  | 'media'
  | 'dose'
  | 'ec'
  | 'ph'
  | 'fan'
  | 'gateway'
  | 'test_module';
export interface Greenhouse {
  id: string;
  name: string;
  location: string;
  area: number;
  plantedArea: number;
  source?: 'demo' | 'custom';
}
export interface CropCycle {
  id: string;
  crop: string;
  phase: string;
  plantedOn: string;
  plants: number;
}
export interface Zone {
  id: ZoneId;
  name: string;
  area: number;
  plants: number;
  validated: boolean;
  temperature: number;
  humidity: number;
  capacity?: number;
  beds?: number;
  method?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}
export interface Device {
  id: string;
  label: string;
  type: 'camera' | 'sensor' | 'irrigation' | 'nutrition' | 'environment' | 'controller';
  zones: ZoneId[];
  capabilities: Capability[];
  connection: Connection;
  maintenance: boolean;
  calibrated: boolean;
  watts: number;
  lastSeen: string;
  nextMaintenance: string;
  resource?: string;
  acquiredAmount?: number;
  active: boolean;
}
export type DeviceCapability = Capability;
export interface SensorReading {
  deviceId: string;
  at: string;
  value: number | null;
  unit: string;
  status: Connection;
  calibrated: boolean;
  source: 'fixture';
}
export interface CameraFeed {
  deviceId: string;
  kind: 'area' | 'trap';
  poster: string;
  video: string | null;
  capturedAt: string;
  source: string;
}
export interface Observation {
  id: string;
  zoneId: ZoneId;
  at: string;
  intervalHours: number;
  newCaptures: number | null;
  sourceDeviceId: string;
}
export type CaseStatus = 'inspection' | 'monitoring' | 'closed';
export interface PestCase {
  id: string;
  zoneId: ZoneId;
  title: string;
  status: CaseStatus;
  verified: boolean;
  assignedTo: string | null;
  createdAt: string;
  followUpAt?: string;
  closedAt?: string;
  sourceDeviceId: string;
  detectionSignal?: {
    key: string;
    ruleVersion: string;
    observationIds: string[];
    values: number[];
    baseline: number;
    triggeredAt: string;
  };
}
export interface Inspection {
  id: string;
  caseId: string;
  at: string;
  operator: string;
  examined: number;
  affected: number;
  outcome: 'indication' | 'not_found' | 'inconclusive';
  notes: string;
  attachmentName?: string;
}
export type PlanStatus =
  'draft' | 'awaiting_approval' | 'approved' | 'running' | 'monitoring' | 'completed' | 'cancelled';
export interface ControlPlan {
  id: string;
  caseId: string;
  zoneId: ZoneId;
  kind: 'manual' | 'simulator' | 'expert_review';
  title: string;
  operator: string;
  notes: string;
  status: PlanStatus;
  durationSeconds: number;
  tasks: {
    id: string;
    label: string;
    done: boolean;
  }[];
  createdAt: string;
  evaluationAt?: string;
  evaluationNotes?: string;
  runId?: string;
}
export type CommandStatus =
  'idle' | 'queued' | 'acknowledged' | 'running' | 'completed' | 'stopped' | 'failed' | 'timed_out';
export interface ControlCommand {
  id: string;
  runId: string;
  stepId: string;
  deviceIds: string[];
  kind: 'start' | 'stop' | 'test';
  status: CommandStatus;
  queuedAt: number;
  acknowledgedAt?: number;
  finishedAt?: number;
  reason?: string;
}
export type RoutineKind = 'irrigation' | 'fertigation' | 'environment' | 'preventive' | 'pest';
export type RoutineStatus = 'Draft' | 'Active' | 'Paused' | 'Needs review';
export type ExecutionPolicy = 'automatic' | 'approval' | 'task';
export interface Schedule {
  times: string[];
  weekdays: number[];
  validFrom: string;
  validUntil?: string;
  timeZone: 'Asia/Jakarta';
}
export type Trigger =
  | {
      type: 'schedule';
      schedule: Schedule;
    }
  | {
      type: 'sensor';
      deviceId: string;
      direction: 'below' | 'above';
      start: number;
      recover: number;
      debounceSeconds: number;
      windowStart: string;
      windowEnd: string;
    }
  | {
      type: 'after_run';
      routineId: string;
    };
export interface GuardCondition {
  deviceId: string;
  required: boolean;
  calibration?: boolean;
}
export interface StepDefinition {
  id: string;
  label: string;
  action:
    | 'check'
    | 'start'
    | 'water'
    | 'verify_flow'
    | 'dose'
    | 'flush'
    | 'stop'
    | 'verify'
    | 'fan'
    | 'test'
    | 'task';
  duration: number;
  zoneId?: ZoneId;
  deviceIds: string[];
}
export interface RoutineVersion {
  id: string;
  number: string;
  reviewed: boolean;
  createdAt: string;
  zones: ZoneId[];
  steps: StepDefinition[];
  requiredDevices: string[];
  optionalDevices: string[];
  resource: string | null;
  maxDuration: number;
  maxCyclesPerDay: number;
  cooldownSeconds: number;
  maxWaterPerDay: number;
  maxNutritionPerDay: number;
  queueTimeout: number;
  flowLpm: number;
  nutrientProfileId?: string;
  nutrientUnits: number;
}
export interface AutomationRoutine {
  id: string;
  name: string;
  kind: RoutineKind;
  description: string;
  status: RoutineStatus;
  policy: ExecutionPolicy;
  trigger: Trigger;
  version: RoutineVersion;
  skippedSlots: string[];
}
export interface NutrientProfile {
  id: string;
  name: string;
  version: string;
  crop: string;
  zones: ZoneId[];
  reviewed: boolean;
  status: 'active' | 'draft' | 'needs_review';
  deviceIds: string[];
  ec: number;
  ph: number;
  demoUnits: number;
  note: string;
}
export type RunStatus =
  | 'Scheduled'
  | 'Checking'
  | 'Queued'
  | 'Running'
  | 'Verifying'
  | 'Completed'
  | 'Skipped'
  | 'Blocked'
  | 'Failed'
  | 'Stopped'
  | 'Needs reconciliation';
export interface StepRun extends StepDefinition {
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed' | 'stopped';
  startedAt?: number;
  finishedAt?: number;
  reason?: string;
}
export interface AutomationRun {
  cycleId?: string;
  evidence?: RunEvidence;
  id: string;
  routineId: string;
  routineName: string;
  kind: RoutineKind;
  routineVersionId: string;
  snapshot: RoutineVersion;
  triggerKey: string;
  source: 'schedule' | 'manual' | 'sensor' | 'plan' | 'after_run';
  policy: ExecutionPolicy;
  planId?: string;
  status: RunStatus;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  steps: StepRun[];
  stepIndex: number;
  resource: string | null;
  reason: string;
  stopRequestedAt?: number;
  stopResult?: 'stop' | 'fail';
  expiresAt: number;
  currentZone?: ZoneId;
}
export interface ResourceLock {
  id: string;
  runId: string;
  state: 'locked' | 'unknown';
  acquiredAt: number;
}
export interface ManualOverride {
  id: string;
  routineId: string;
  reason: string;
  createdAt: number;
  expiresAt: number;
  scope: string;
}
export interface UsageRecord {
  id: string;
  runId: string;
  routineVersionId: string;
  deviceId: string;
  at: string;
  seconds: number;
  waterLiters: number;
  nutrientUnits: number;
  energyKwh: number;
  waterSource: 'measured_demo' | 'estimate';
  deliveryConfirmed: boolean;
}
export interface MaintenanceTicket {
  supplyItemId?: string;
  submissionKey?: string;
  id: string;
  deviceId: string;
  title: string;
  operator: string | null;
  status: 'open' | 'scheduled' | 'completed';
  createdAt: string;
  dueAt: string;
  expenseId?: string;
  notes: string;
}
export interface ActivityEvent {
  id: string;
  at: string;
  type:
    | 'observation'
    | 'inspection'
    | 'plan'
    | 'routine'
    | 'run'
    | 'device'
    | 'maintenance'
    | 'expense'
    | 'system';
  title: string;
  detail: string;
  actor: string;
  objectId: string;
  zoneId?: ZoneId;
  before?: string;
  after?: string;
}
export type ExpenseCategory =
  | 'Air'
  | 'Nutrisi'
  | 'Listrik'
  | 'Internet'
  | 'Perawatan'
  | 'Tenaga dibayar'
  | 'Benih & media'
  | 'Kemasan & distribusi'
  | 'Sewa & lainnya'
  | 'Investasi';
export interface ExpenseRecord {
  id: string;
  paidAt: string;
  category: ExpenseCategory;
  amount: number;
  greenhouseId: string;
  source: 'demo_ledger' | 'operator';
  status: 'paid' | 'draft' | 'void';
  note: string;
  deviceId?: string;
  zoneId?: ZoneId;
  maintenanceId?: string;
  routineId?: string;
  reference?: string;
  attachmentName?: string;
  usageSlices?: {
    period: string;
    amount: number;
  }[];
  voidReason?: string;
  submissionKey: string;
  createdAt: string;
}
export interface CostAllocation {
  id: string;
  expenseId: string;
  deviceId?: string;
  zoneId?: ZoneId;
  amount: number;
  basis: 'estimated_power_runtime' | 'manual' | 'submeter';
  label: string;
}
export interface RecurringExpenseTemplate {
  id: string;
  category: ExpenseCategory;
  title: string;
  day: number;
  deviceId?: string;
  effectiveFrom: string;
}
export interface PeriodBudget {
  period: string;
  amount: number;
  greenhouseId: string;
}
export interface SavingsBaseline {
  id: string;
  version: number;
  source: 'assumption' | 'records';
  period: string;
  days: number;
  zones: ZoneId[];
  area: number;
  crop: string;
  phase: string;
  categories: Partial<Record<ExpenseCategory, number>>;
  normalizedDaily: boolean;
  appliedOn: string;
}
export interface SavingsComparison {
  canCompare: boolean;
  partial: boolean;
  reason: string;
  baseline: number | null;
  actual: number;
  difference: number | null;
  percent: number | null;
  missing: ExpenseCategory[];
}
export interface CostConfiguration {
  electricityPerKwh: number;
  waterPerLiter: number;
  nutrientUnitPrice: number;
  plannerZones: number;
  ownedController: boolean;
  contingencyPercent: number;
}
export interface CostItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number | null;
  owned: boolean;
}
export type Scenario =
  | 'normal'
  | 'increasing'
  | 'device_offline'
  | 'sensor_stale'
  | 'command_failed'
  | 'insufficient'
  | 'wet_media'
  | 'low_tank'
  | 'no_flow'
  | 'flow_stuck'
  | 'lost_connection'
  | 'interrupted';
export interface SensorEpisode {
  activeSince: number | null;
  latched: boolean;
  sequence: number;
}
export interface StoredReading {
  id: string;
  deviceId: string;
  metric: string;
  value: number | null;
  unit: string;
  capturedAt: string;
  provenance: string;
}
export interface DomainState {
  readings?: StoredReading[];
  schemaVersion: 3;
  greenhouse: Greenhouse;
  cycle: CropCycle;
  production?: ProductionState;
  cultivation?: CultivationState;
  energy?: EnergyConfig;
  targets?: TargetState;
  supplies?: SupplyState;
  resources?: ResourceState;
  zones: Zone[];
  devices: Device[];
  cases: PestCase[];
  inspections: Inspection[];
  plans: ControlPlan[];
  observations: Observation[];
  routines: AutomationRoutine[];
  nutrientProfiles: NutrientProfile[];
  runs: AutomationRun[];
  commands: ControlCommand[];
  locks: ResourceLock[];
  usages: UsageRecord[];
  maintenance: MaintenanceTicket[];
  events: ActivityEvent[];
  expenses: ExpenseRecord[];
  allocations: CostAllocation[];
  recurring: RecurringExpenseTemplate[];
  budgets: PeriodBudget[];
  baseline: SavingsBaseline | null;
  costs: CostConfiguration;
  overrides: ManualOverride[];
  clock: number;
  playing: boolean;
  speed: 1 | 10 | 60;
  scenario: Scenario;
  profile: 'automation' | 'monitoring';
  seenTriggers: string[];
  episodes: Record<string, SensorEpisode>;
  storageWarning: string | null;
  notification: string | null;
}
export interface CostScope {
  period: string;
  deviceId?: string;
  zoneId?: ZoneId;
  category?: ExpenseCategory;
  from?: string;
  to?: string;
}
export interface ExpenseView {
  record: ExpenseRecord;
  amount: number;
  source: 'Tercatat' | 'Alokasi';
}
