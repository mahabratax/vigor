/** Relational mapping contract. Mutable fields have typed columns; collections have
 * child/junction tables. JSON is restricted to immutable execution/evidence snapshots. */
export type FieldType = 's' | 'n' | 'b' | 'j';
export interface Field {
  name: string;
  type: FieldType;
  optional: boolean;
  nullable: boolean;
}
export interface Entity {
  table: string;
  fields: Field[];
  children: Record<string, Child>;
  derived: string[];
}
export interface Child {
  entity: Entity;
  mode: 'one' | 'many' | 'map' | 'values';
  scalar?: boolean;
  nullable?: boolean;
}
const e = (
  table: string,
  fields = '',
  children: Record<string, Child> = {},
  derived: string[] = [],
): Entity => ({
  table,
  fields: fields
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const [raw, type = 's'] = token.split(':');
      return {
        name: raw.replace(/[?~]/g, ''),
        type: type as FieldType,
        optional: raw.includes('?'),
        nullable: raw.includes('~'),
      };
    }),
  children,
  derived,
});
const one = (entity: Entity, nullable = false): Child => ({ entity, mode: 'one', nullable });
const many = (entity: Entity): Child => ({ entity, mode: 'many' });
const map = (entity: Entity, scalar = false): Child => ({ entity, mode: 'map', scalar });
const values = (table: string, type = 's'): Child => ({
  entity: e(table, `value:${type}`),
  mode: 'values',
});
const step = 'id label action duration:n zoneId?';
const version = e(
  'routine_versions',
  'id number reviewed:b createdAt resource~ maxDuration:n maxCyclesPerDay:n cooldownSeconds:n maxWaterPerDay:n maxNutritionPerDay:n queueTimeout:n flowLpm:n nutrientProfileId? nutrientUnits:n',
  {
    zones: values('routine_version_zones'),
    steps: many(e('routine_steps', step, { deviceIds: values('routine_step_devices') })),
    requiredDevices: values('routine_required_devices'),
    optionalDevices: values('routine_optional_devices'),
  },
);
const trigger = e(
  'routine_triggers',
  'type deviceId? direction? start?:n recover?:n debounceSeconds?:n windowStart? windowEnd? routineId?',
  {
    schedule: one(
      e('routine_schedules', 'validFrom validUntil? timeZone', {
        times: values('schedule_times'),
        weekdays: values('schedule_weekdays', 'n'),
      }),
    ),
  },
);
export const greenhouseModel = e(
  'greenhouse_state',
  'schemaVersion:n clock:n profile',
  {
    greenhouse: one(e('greenhouses', 'id name location area:n plantedArea:n source?')),
    cycle: one(e('crop_cycles', 'id crop phase plantedOn', {}, ['plants'])),
    zones: many(
      e(
        'zones',
        'id name area:n validated:b temperature:n humidity:n capacity?:n beds?:n method? notes? status?',
        {},
        ['plants'],
      ),
    ),
    devices: many(
      e(
        'devices',
        'id label type connection maintenance:b calibrated:b watts:n lastSeen nextMaintenance resource? acquiredAmount?:n active:b',
        {
          zones: values('device_zones'),
          capabilities: values('device_capabilities'),
        },
      ),
    ),
    observations: many(
      e('observations', 'id zoneId at intervalHours:n newCaptures~:n sourceDeviceId'),
    ),
    cases: many(
      e(
        'pest_cases',
        'id zoneId title status verified:b assignedTo~ createdAt followUpAt? closedAt? sourceDeviceId',
        {
          detectionSignal: one(
            e('detection_signals', 'key ruleVersion baseline:n triggeredAt', {
              observationIds: values('detection_observations'),
              values: values('detection_values', 'n'),
            }),
          ),
        },
      ),
    ),
    inspections: many(
      e('inspections', 'id caseId at operator examined:n affected:n outcome notes attachmentName?'),
    ),
    plans: many(
      e(
        'control_plans',
        'id caseId zoneId kind title operator notes status durationSeconds:n createdAt evaluationAt? evaluationNotes? runId?',
        {
          tasks: many(e('control_plan_tasks', 'id label done:b')),
        },
      ),
    ),
    routines: many(
      e('routines', 'id name kind description status policy', {
        trigger: one(trigger),
        version: one(version),
        skippedSlots: values('routine_skipped_slots'),
      }),
    ),
    nutrientProfiles: many(
      e('nutrient_profiles', 'id name version crop reviewed:b status ec:n ph:n demoUnits:n note', {
        zones: values('nutrient_profile_zones'),
        deviceIds: values('nutrient_profile_devices'),
      }),
    ),
    runs: many(
      e(
        'automation_runs',
        'id cycleId? routineId routineName kind routineVersionId snapshot:j triggerKey source policy planId? status createdAt:n startedAt?:n finishedAt?:n stepIndex:n resource~ reason stopRequestedAt?:n stopResult? expiresAt:n currentZone?',
        {
          steps: many(
            e('run_steps', step + ' status startedAt?:n finishedAt?:n reason?', {
              deviceIds: values('run_step_devices'),
            }),
          ),
          evidence: one(
            e('run_evidence', 'before:j after?:j', {
              followUps: many(e('evidence_followups', 'id at:n scenario readings:j')),
              reviews: many(e('evidence_reviews', 'id afterId verdict notes actor at key')),
            }),
          ),
        },
      ),
    ),
    commands: many(
      e(
        'control_commands',
        'id runId stepId kind status queuedAt:n acknowledgedAt?:n finishedAt?:n reason?',
        { deviceIds: values('command_devices') },
      ),
    ),
    locks: many(e('resource_locks', 'id runId state acquiredAt:n')),
    usages: many(
      e(
        'resource_usages',
        'id runId routineVersionId deviceId at seconds:n waterLiters:n nutrientUnits:n energyKwh:n waterSource deliveryConfirmed:b',
      ),
    ),
    maintenance: many(
      e(
        'maintenance_tickets',
        'id supplyItemId? submissionKey? deviceId title operator~ status createdAt dueAt notes',
        {},
        ['expenseId'],
      ),
    ),
    events: many(
      e('activity_events', 'id at type title detail actor objectId zoneId? before? after?'),
    ),
    expenses: many(
      e(
        'expenses',
        'id paidAt category amount:n source status note deviceId? zoneId? maintenanceId? routineId? reference? attachmentName? voidReason? submissionKey createdAt',
        { usageSlices: many(e('expense_period_slices', 'period amount:n')) },
        ['greenhouseId'],
      ),
    ),
    allocations: many(
      e('expense_allocations', 'id expenseId deviceId? zoneId? amount:n basis label'),
    ),
    recurring: many(e('recurring_expenses', 'id category title day:n deviceId? effectiveFrom')),
    budgets: many(e('period_budgets', 'period amount:n', {}, ['greenhouseId'])),
    baseline: one(
      e(
        'savings_baselines',
        'id version:n source period days:n area:n crop phase normalizedDaily:b appliedOn',
        {
          zones: values('baseline_zones'),
          categories: map(e('baseline_categories', 'value:n'), true),
        },
      ),
      true,
    ),
    costs: one(
      e(
        'cost_configuration',
        'electricityPerKwh:n waterPerLiter:n nutrientUnitPrice:n plannerZones:n ownedController:b contingencyPercent:n',
      ),
    ),
    overrides: many(e('manual_overrides', 'id routineId reason createdAt:n expiresAt:n scope')),
    cultivation: one(
      e('cultivation', 'version:n nextZoneNumber:n', {
        batches: many(
          e(
            'planting_batches',
            'id zoneId cycleId crop variety plantedOn targetHarvestOn stage seedSource notes initialPlants:n status closedOn? closingNotes?',
            {},
            ['currentPlants'],
          ),
        ),
        movements: many(
          e('plant_movements', 'id batchId at kind quantity:n reason actor key', {}, ['balance']),
        ),
      }),
    ),
    production: one(
      e(
        'production_cycles',
        'version:n cycleId stage targetOn targetKg~:n targetPrice~:n operator closedOn? closingNotes?',
        {
          tasks: many(
            e(
              'care_tasks',
              'id plantingId? title zoneId dueOn operator status notes completedOn? key',
            ),
          ),
          lots: many(
            e(
              'harvest_lots',
              'id plantingId? crop? variety? date zoneId grossKg:n aKg:n bKg:n rejectedKg:n notes operator status reviewNotes? reviewedOn? key',
            ),
          ),
          sales: many(e('sales', 'id lotId grade kg:n price:n date dueOn buyer status key')),
          receipts: many(e('receipts', 'id saleId date amount:n reference key')),
          losses: many(e('harvest_losses', 'id lotId grade kg:n date reason key')),
          expenseShares: map(e('cycle_expense_shares', 'value:n'), true),
          finance: one(
            e(
              'cycle_finance',
              'depreciation~:n unpaidLabor~:n otherAccrued~:n baselineCost~:n notes reviewKey~',
            ),
          ),
        },
      ),
    ),
    energy: one(
      e(
        'solar_configuration',
        'enabled:b panelCount:n panelWatts:n inverterKw:n sunHours:n performanceRatio:n tariff:n investment~:n maintenanceMonthly:n',
        { loads: map(e('device_load_assumptions', 'hours:n start:n')) },
      ),
    ),
    targets: one(
      e('crop_targets', 'version:n', {
        revisions: many(
          e(
            'target_revisions',
            'id batchId zoneId crop variety stage version:n notes createdAt createdBy status reviewedAt? reviewedBy?',
            { limits: map(e('target_limits', 'min:n max:n')) },
          ),
        ),
      }),
    ),
    supplies: one(
      e('supply_register', 'version:n', {
        items: many(
          e(
            'supply_items',
            'id name unit category reorderAt:n deviceId~ autoTask:b operator active:b',
          ),
        ),
        movements: many(
          e(
            'supply_movements',
            'id itemId kind quantity:n date notes actor key expenseId? runId? maintenanceId? reverses?',
          ),
        ),
      }),
    ),
    resources: one(
      e('cycle_resources', 'version:n cycleId coverage notes reviewKey~', {
        shares: map(e('cycle_usage_shares', 'value:n'), true),
        extras: many(
          e(
            'extra_resource_usage',
            'id date waterLiters~:n energyKwh~:n basis notes key void:b voidReason?',
          ),
        ),
      }),
    ),
    readings: many(e('sensor_readings', 'id deviceId metric value~:n unit capturedAt provenance')),
    seenTriggers: values('observed_triggers'),
    episodes: map(e('sensor_episodes', 'activeSince~:n latched:b sequence:n')),
  },
  ['playing', 'speed', 'scenario', 'storageWarning', 'notification'],
);

// Every reference is scoped to the greenhouse. Legacy import-only references
// retain original IDs and a nullable resolved FK; they never fabricate a run.
export interface Relation {
  table: string;
  field: string;
  target: string;
  targetField?: string;
  legacy?: boolean;
}
export const relations: Relation[] = [];
const refs = (table: string, spec: Record<string, string>) =>
  Object.entries(spec).forEach(([field, target]) => relations.push({ table, field, target }));
refs('device_zones', { value: 'zones' });
refs('observations', { zoneId: 'zones', sourceDeviceId: 'devices' });
refs('pest_cases', { zoneId: 'zones', sourceDeviceId: 'devices' });
refs('detection_observations', { value: 'observations' });
refs('inspections', { caseId: 'pest_cases' });
refs('control_plans', { caseId: 'pest_cases', zoneId: 'zones', runId: 'automation_runs' });
refs('routine_triggers', { deviceId: 'devices', routineId: 'routines' });
refs('routine_version_zones', { value: 'zones' });
refs('routine_steps', { zoneId: 'zones' });
refs('routine_step_devices', { value: 'devices' });
refs('routine_required_devices', { value: 'devices' });
refs('routine_optional_devices', { value: 'devices' });
refs('routine_versions', { nutrientProfileId: 'nutrient_profiles' });
refs('nutrient_profile_zones', { value: 'zones' });
refs('nutrient_profile_devices', { value: 'devices' });
refs('automation_runs', { cycleId: 'crop_cycles', planId: 'control_plans', currentZone: 'zones' });
relations.push({ table: 'automation_runs', field: 'routineId', target: 'routines', legacy: true });
refs('run_steps', { zoneId: 'zones' });
refs('run_step_devices', { value: 'devices' });
refs('control_commands', { runId: 'automation_runs' });
refs('command_devices', { value: 'devices' });
refs('resource_locks', { runId: 'automation_runs' });
refs('resource_usages', { deviceId: 'devices' });
relations.push({
  table: 'resource_usages',
  field: 'runId',
  target: 'automation_runs',
  legacy: true,
});
refs('maintenance_tickets', { deviceId: 'devices', supplyItemId: 'supply_items' });
refs('activity_events', { zoneId: 'zones' });
refs('expenses', {
  deviceId: 'devices',
  zoneId: 'zones',
  maintenanceId: 'maintenance_tickets',
  routineId: 'routines',
});
refs('expense_allocations', { expenseId: 'expenses', deviceId: 'devices', zoneId: 'zones' });
refs('recurring_expenses', { deviceId: 'devices' });
refs('baseline_zones', { value: 'zones' });
refs('manual_overrides', { routineId: 'routines' });
refs('planting_batches', { zoneId: 'zones', cycleId: 'crop_cycles' });
refs('plant_movements', { batchId: 'planting_batches' });
refs('production_cycles', { cycleId: 'crop_cycles' });
refs('care_tasks', { plantingId: 'planting_batches', zoneId: 'zones' });
refs('harvest_lots', { plantingId: 'planting_batches', zoneId: 'zones' });
refs('sales', { lotId: 'harvest_lots' });
refs('receipts', { saleId: 'sales' });
refs('harvest_losses', { lotId: 'harvest_lots' });
refs('cycle_expense_shares', { map_key: 'expenses' });
refs('device_load_assumptions', { map_key: 'devices' });
refs('target_revisions', { batchId: 'planting_batches', zoneId: 'zones' });
refs('supply_items', { deviceId: 'devices' });
refs('supply_movements', {
  itemId: 'supply_items',
  expenseId: 'expenses',
  runId: 'automation_runs',
  maintenanceId: 'maintenance_tickets',
  reverses: 'supply_movements',
});
refs('cycle_resources', { cycleId: 'crop_cycles' });
refs('cycle_usage_shares', { map_key: 'resource_usages' });
refs('sensor_readings', { deviceId: 'devices' });
export interface ModelTable {
  entity: Entity;
  parent?: string;
  mode?: Child['mode'];
}
export const tables: ModelTable[] = [];
function visit(entity: Entity, parent?: string, mode?: Child['mode']) {
  tables.push({ entity, parent, mode });
  Object.values(entity.children).forEach((c) => visit(c.entity, entity.table, c.mode));
}
visit(greenhouseModel);
export const column = (name: string) => name.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
