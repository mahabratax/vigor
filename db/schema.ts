// Generated from db/model.ts. Run npm run db:model before db:generate.
import {
  sqliteTable,
  text,
  real,
  integer,
  primaryKey,
  foreignKey,
  uniqueIndex,
  index,
  check,
  AnySQLiteColumn,
  SQLiteTableExtraConfigValue,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const greenhouseState = sqliteTable(
  'greenhouse_state',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    schemaVersion: real('schema_version').notNull(),
    clock: real('clock').notNull(),
    profile: text('profile').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [primaryKey({ columns: [t.gh, t.recordKey] })],
);
export const greenhouses = sqliteTable(
  'greenhouses',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    name: text('name').notNull(),
    location: text('location').notNull(),
    area: real('area').notNull(),
    plantedArea: real('planted_area').notNull(),
    source: text('source'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('greenhouses_gh_id').on(t.gh, t.id),
    uniqueIndex('greenhouse_identity').on(t.id),
    index('greenhouses_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const cropCycles = sqliteTable(
  'crop_cycles',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    crop: text('crop').notNull(),
    phase: text('phase').notNull(),
    plantedOn: text('planted_on').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('crop_cycles_gh_id').on(t.gh, t.id),
    index('crop_cycles_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const zones = sqliteTable(
  'zones',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    name: text('name').notNull(),
    area: real('area').notNull(),
    validated: integer('validated').notNull(),
    temperature: real('temperature').notNull(),
    humidity: real('humidity').notNull(),
    capacity: real('capacity'),
    beds: real('beds'),
    method: text('method'),
    notes: text('notes'),
    status: text('status'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('zones_gh_id').on(t.gh, t.id),
    check('zones_validated_bool', sql`${t.validated} in (0, 1)`),
    index('zones_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const devices = sqliteTable(
  'devices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    label: text('label').notNull(),
    type: text('type').notNull(),
    connection: text('connection').notNull(),
    maintenance: integer('maintenance').notNull(),
    calibrated: integer('calibrated').notNull(),
    watts: real('watts').notNull(),
    lastSeen: text('last_seen').notNull(),
    nextMaintenance: text('next_maintenance').notNull(),
    resource: text('resource'),
    acquiredAmount: real('acquired_amount'),
    active: integer('active').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('devices_gh_id').on(t.gh, t.id),
    check('devices_maintenance_bool', sql`${t.maintenance} in (0, 1)`),
    check('devices_calibrated_bool', sql`${t.calibrated} in (0, 1)`),
    check('devices_active_bool', sql`${t.active} in (0, 1)`),
    index('devices_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const deviceZones = sqliteTable(
  'device_zones',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [devices.gh, devices.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [zones.gh, zones.id] }),
    index('device_zones_value_lookup').on(t.gh, t.value),
    index('device_zones_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('device_zones_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const deviceCapabilities = sqliteTable(
  'device_capabilities',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [devices.gh, devices.recordKey],
    }).onDelete('cascade'),
    index('device_capabilities_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('device_capabilities_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const observations = sqliteTable(
  'observations',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    zoneId: text('zone_id').notNull(),
    at: text('at').notNull(),
    intervalHours: real('interval_hours').notNull(),
    newCaptures: real('new_captures'),
    sourceDeviceId: text('source_device_id').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('observations_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('observations_zoneId_lookup').on(t.gh, t.zoneId),
    foreignKey({ columns: [t.gh, t.sourceDeviceId], foreignColumns: [devices.gh, devices.id] }),
    index('observations_sourceDeviceId_lookup').on(t.gh, t.sourceDeviceId),
    index('observations_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const pestCases = sqliteTable(
  'pest_cases',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    zoneId: text('zone_id').notNull(),
    title: text('title').notNull(),
    status: text('status').notNull(),
    verified: integer('verified').notNull(),
    assignedTo: text('assigned_to'),
    createdAt: text('created_at').notNull(),
    followUpAt: text('follow_up_at'),
    closedAt: text('closed_at'),
    sourceDeviceId: text('source_device_id').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('pest_cases_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('pest_cases_zoneId_lookup').on(t.gh, t.zoneId),
    foreignKey({ columns: [t.gh, t.sourceDeviceId], foreignColumns: [devices.gh, devices.id] }),
    index('pest_cases_sourceDeviceId_lookup').on(t.gh, t.sourceDeviceId),
    check('pest_cases_verified_bool', sql`${t.verified} in (0, 1)`),
    index('pest_cases_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const detectionSignals = sqliteTable(
  'detection_signals',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    key: text('key').notNull(),
    ruleVersion: text('rule_version').notNull(),
    baseline: real('baseline').notNull(),
    triggeredAt: text('triggered_at').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [pestCases.gh, pestCases.recordKey],
    }).onDelete('cascade'),
    index('detection_signals_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const detectionObservations = sqliteTable(
  'detection_observations',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [detectionSignals.gh, detectionSignals.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [observations.gh, observations.id] }),
    index('detection_observations_value_lookup').on(t.gh, t.value),
    index('detection_observations_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const detectionValues = sqliteTable(
  'detection_values',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: real('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [detectionSignals.gh, detectionSignals.recordKey],
    }).onDelete('cascade'),
    index('detection_values_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const inspections = sqliteTable(
  'inspections',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    caseId: text('case_id').notNull(),
    at: text('at').notNull(),
    operator: text('operator').notNull(),
    examined: real('examined').notNull(),
    affected: real('affected').notNull(),
    outcome: text('outcome').notNull(),
    notes: text('notes').notNull(),
    attachmentName: text('attachment_name'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('inspections_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.caseId], foreignColumns: [pestCases.gh, pestCases.id] }),
    index('inspections_caseId_lookup').on(t.gh, t.caseId),
    index('inspections_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const controlPlans = sqliteTable(
  'control_plans',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    caseId: text('case_id').notNull(),
    zoneId: text('zone_id').notNull(),
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    operator: text('operator').notNull(),
    notes: text('notes').notNull(),
    status: text('status').notNull(),
    durationSeconds: real('duration_seconds').notNull(),
    createdAt: text('created_at').notNull(),
    evaluationAt: text('evaluation_at'),
    evaluationNotes: text('evaluation_notes'),
    runId: text('run_id'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('control_plans_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.caseId], foreignColumns: [pestCases.gh, pestCases.id] }),
    index('control_plans_caseId_lookup').on(t.gh, t.caseId),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('control_plans_zoneId_lookup').on(t.gh, t.zoneId),
    foreignKey({
      columns: [t.gh, t.runId],
      foreignColumns: [automationRuns.gh, automationRuns.id],
    }),
    index('control_plans_runId_lookup').on(t.gh, t.runId),
    index('control_plans_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const controlPlanTasks = sqliteTable(
  'control_plan_tasks',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    label: text('label').notNull(),
    done: integer('done').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [controlPlans.gh, controlPlans.recordKey],
    }).onDelete('cascade'),
    check('control_plan_tasks_done_bool', sql`${t.done} in (0, 1)`),
    index('control_plan_tasks_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const routines = sqliteTable(
  'routines',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    name: text('name').notNull(),
    kind: text('kind').notNull(),
    description: text('description').notNull(),
    status: text('status').notNull(),
    policy: text('policy').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('routines_gh_id').on(t.gh, t.id),
    index('routines_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const routineTriggers = sqliteTable(
  'routine_triggers',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    type: text('type').notNull(),
    deviceId: text('device_id'),
    direction: text('direction'),
    start: real('start'),
    recover: real('recover'),
    debounceSeconds: real('debounce_seconds'),
    windowStart: text('window_start'),
    windowEnd: text('window_end'),
    routineId: text('routine_id'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routines.gh, routines.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('routine_triggers_deviceId_lookup').on(t.gh, t.deviceId),
    foreignKey({ columns: [t.gh, t.routineId], foreignColumns: [routines.gh, routines.id] }),
    index('routine_triggers_routineId_lookup').on(t.gh, t.routineId),
    index('routine_triggers_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const routineSchedules = sqliteTable(
  'routine_schedules',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    validFrom: text('valid_from').notNull(),
    validUntil: text('valid_until'),
    timeZone: text('time_zone').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineTriggers.gh, routineTriggers.recordKey],
    }).onDelete('cascade'),
    index('routine_schedules_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const scheduleTimes = sqliteTable(
  'schedule_times',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineSchedules.gh, routineSchedules.recordKey],
    }).onDelete('cascade'),
    index('schedule_times_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const scheduleWeekdays = sqliteTable(
  'schedule_weekdays',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: real('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineSchedules.gh, routineSchedules.recordKey],
    }).onDelete('cascade'),
    index('schedule_weekdays_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const routineVersions = sqliteTable(
  'routine_versions',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    number: text('number').notNull(),
    reviewed: integer('reviewed').notNull(),
    createdAt: text('created_at').notNull(),
    resource: text('resource'),
    maxDuration: real('max_duration').notNull(),
    maxCyclesPerDay: real('max_cycles_per_day').notNull(),
    cooldownSeconds: real('cooldown_seconds').notNull(),
    maxWaterPerDay: real('max_water_per_day').notNull(),
    maxNutritionPerDay: real('max_nutrition_per_day').notNull(),
    queueTimeout: real('queue_timeout').notNull(),
    flowLpm: real('flow_lpm').notNull(),
    nutrientProfileId: text('nutrient_profile_id'),
    nutrientUnits: real('nutrient_units').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routines.gh, routines.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('routine_versions_gh_id').on(t.gh, t.id),
    foreignKey({
      columns: [t.gh, t.nutrientProfileId],
      foreignColumns: [nutrientProfiles.gh, nutrientProfiles.id],
    }),
    index('routine_versions_nutrientProfileId_lookup').on(t.gh, t.nutrientProfileId),
    check('routine_versions_reviewed_bool', sql`${t.reviewed} in (0, 1)`),
    index('routine_versions_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const routineVersionZones = sqliteTable(
  'routine_version_zones',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineVersions.gh, routineVersions.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [zones.gh, zones.id] }),
    index('routine_version_zones_value_lookup').on(t.gh, t.value),
    index('routine_version_zones_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('routine_version_zones_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const routineSteps = sqliteTable(
  'routine_steps',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    label: text('label').notNull(),
    action: text('action').notNull(),
    duration: real('duration').notNull(),
    zoneId: text('zone_id'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineVersions.gh, routineVersions.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('routine_steps_zoneId_lookup').on(t.gh, t.zoneId),
    index('routine_steps_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const routineStepDevices = sqliteTable(
  'routine_step_devices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineSteps.gh, routineSteps.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [devices.gh, devices.id] }),
    index('routine_step_devices_value_lookup').on(t.gh, t.value),
    index('routine_step_devices_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('routine_step_devices_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const routineRequiredDevices = sqliteTable(
  'routine_required_devices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineVersions.gh, routineVersions.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [devices.gh, devices.id] }),
    index('routine_required_devices_value_lookup').on(t.gh, t.value),
    index('routine_required_devices_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('routine_required_devices_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const routineOptionalDevices = sqliteTable(
  'routine_optional_devices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routineVersions.gh, routineVersions.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [devices.gh, devices.id] }),
    index('routine_optional_devices_value_lookup').on(t.gh, t.value),
    index('routine_optional_devices_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('routine_optional_devices_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const routineSkippedSlots = sqliteTable(
  'routine_skipped_slots',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [routines.gh, routines.recordKey],
    }).onDelete('cascade'),
    index('routine_skipped_slots_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const nutrientProfiles = sqliteTable(
  'nutrient_profiles',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    name: text('name').notNull(),
    version: text('version').notNull(),
    crop: text('crop').notNull(),
    reviewed: integer('reviewed').notNull(),
    status: text('status').notNull(),
    ec: real('ec').notNull(),
    ph: real('ph').notNull(),
    demoUnits: real('demo_units').notNull(),
    note: text('note').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('nutrient_profiles_gh_id').on(t.gh, t.id),
    check('nutrient_profiles_reviewed_bool', sql`${t.reviewed} in (0, 1)`),
    index('nutrient_profiles_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const nutrientProfileZones = sqliteTable(
  'nutrient_profile_zones',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [nutrientProfiles.gh, nutrientProfiles.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [zones.gh, zones.id] }),
    index('nutrient_profile_zones_value_lookup').on(t.gh, t.value),
    index('nutrient_profile_zones_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('nutrient_profile_zones_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const nutrientProfileDevices = sqliteTable(
  'nutrient_profile_devices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [nutrientProfiles.gh, nutrientProfiles.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [devices.gh, devices.id] }),
    index('nutrient_profile_devices_value_lookup').on(t.gh, t.value),
    index('nutrient_profile_devices_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('nutrient_profile_devices_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const automationRuns = sqliteTable(
  'automation_runs',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    cycleId: text('cycle_id'),
    routineId: text('routine_id').notNull(),
    routineName: text('routine_name').notNull(),
    kind: text('kind').notNull(),
    routineVersionId: text('routine_version_id').notNull(),
    snapshot: text('snapshot').notNull(),
    triggerKey: text('trigger_key').notNull(),
    source: text('source').notNull(),
    policy: text('policy').notNull(),
    planId: text('plan_id'),
    status: text('status').notNull(),
    createdAt: real('created_at').notNull(),
    startedAt: real('started_at'),
    finishedAt: real('finished_at'),
    stepIndex: real('step_index').notNull(),
    resource: text('resource'),
    reason: text('reason').notNull(),
    stopRequestedAt: real('stop_requested_at'),
    stopResult: text('stop_result'),
    expiresAt: real('expires_at').notNull(),
    currentZone: text('current_zone'),
    routineIdResolved: text('routine_id_resolved'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('automation_runs_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.cycleId], foreignColumns: [cropCycles.gh, cropCycles.id] }),
    index('automation_runs_cycleId_lookup').on(t.gh, t.cycleId),
    foreignKey({ columns: [t.gh, t.planId], foreignColumns: [controlPlans.gh, controlPlans.id] }),
    index('automation_runs_planId_lookup').on(t.gh, t.planId),
    foreignKey({ columns: [t.gh, t.currentZone], foreignColumns: [zones.gh, zones.id] }),
    index('automation_runs_currentZone_lookup').on(t.gh, t.currentZone),
    foreignKey({
      columns: [t.gh, t.routineIdResolved],
      foreignColumns: [routines.gh, routines.id],
    }),
    index('automation_runs_routineId_lookup').on(t.gh, t.routineIdResolved),
    index('automation_runs_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const runSteps = sqliteTable(
  'run_steps',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    label: text('label').notNull(),
    action: text('action').notNull(),
    duration: real('duration').notNull(),
    zoneId: text('zone_id'),
    status: text('status').notNull(),
    startedAt: real('started_at'),
    finishedAt: real('finished_at'),
    reason: text('reason'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [automationRuns.gh, automationRuns.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('run_steps_zoneId_lookup').on(t.gh, t.zoneId),
    index('run_steps_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const runStepDevices = sqliteTable(
  'run_step_devices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [runSteps.gh, runSteps.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [devices.gh, devices.id] }),
    index('run_step_devices_value_lookup').on(t.gh, t.value),
    index('run_step_devices_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('run_step_devices_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const runEvidence = sqliteTable(
  'run_evidence',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    before: text('before').notNull(),
    after: text('after'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [automationRuns.gh, automationRuns.recordKey],
    }).onDelete('cascade'),
    index('run_evidence_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const evidenceFollowups = sqliteTable(
  'evidence_followups',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    at: real('at').notNull(),
    scenario: text('scenario').notNull(),
    readings: text('readings').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [runEvidence.gh, runEvidence.recordKey],
    }).onDelete('cascade'),
    index('evidence_followups_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const evidenceReviews = sqliteTable(
  'evidence_reviews',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    afterId: text('after_id').notNull(),
    verdict: text('verdict').notNull(),
    notes: text('notes').notNull(),
    actor: text('actor').notNull(),
    at: text('at').notNull(),
    key: text('key').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [runEvidence.gh, runEvidence.recordKey],
    }).onDelete('cascade'),
    index('evidence_reviews_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const controlCommands = sqliteTable(
  'control_commands',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    runId: text('run_id').notNull(),
    stepId: text('step_id').notNull(),
    kind: text('kind').notNull(),
    status: text('status').notNull(),
    queuedAt: real('queued_at').notNull(),
    acknowledgedAt: real('acknowledged_at'),
    finishedAt: real('finished_at'),
    reason: text('reason'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('control_commands_gh_id').on(t.gh, t.id),
    foreignKey({
      columns: [t.gh, t.runId],
      foreignColumns: [automationRuns.gh, automationRuns.id],
    }),
    index('control_commands_runId_lookup').on(t.gh, t.runId),
    index('control_commands_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const commandDevices = sqliteTable(
  'command_devices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [controlCommands.gh, controlCommands.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [devices.gh, devices.id] }),
    index('command_devices_value_lookup').on(t.gh, t.value),
    index('command_devices_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('command_devices_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const resourceLocks = sqliteTable(
  'resource_locks',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    runId: text('run_id').notNull(),
    state: text('state').notNull(),
    acquiredAt: real('acquired_at').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('resource_locks_gh_id').on(t.gh, t.id),
    foreignKey({
      columns: [t.gh, t.runId],
      foreignColumns: [automationRuns.gh, automationRuns.id],
    }),
    index('resource_locks_runId_lookup').on(t.gh, t.runId),
    index('resource_locks_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const resourceUsages = sqliteTable(
  'resource_usages',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    runId: text('run_id').notNull(),
    routineVersionId: text('routine_version_id').notNull(),
    deviceId: text('device_id').notNull(),
    at: text('at').notNull(),
    seconds: real('seconds').notNull(),
    waterLiters: real('water_liters').notNull(),
    nutrientUnits: real('nutrient_units').notNull(),
    energyKwh: real('energy_kwh').notNull(),
    waterSource: text('water_source').notNull(),
    deliveryConfirmed: integer('delivery_confirmed').notNull(),
    runIdResolved: text('run_id_resolved'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('resource_usages_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('resource_usages_deviceId_lookup').on(t.gh, t.deviceId),
    foreignKey({
      columns: [t.gh, t.runIdResolved],
      foreignColumns: [automationRuns.gh, automationRuns.id],
    }),
    index('resource_usages_runId_lookup').on(t.gh, t.runIdResolved),
    check('resource_usages_delivery_confirmed_bool', sql`${t.deliveryConfirmed} in (0, 1)`),
    index('resource_usages_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const maintenanceTickets = sqliteTable(
  'maintenance_tickets',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    supplyItemId: text('supply_item_id'),
    submissionKey: text('submission_key'),
    deviceId: text('device_id').notNull(),
    title: text('title').notNull(),
    operator: text('operator'),
    status: text('status').notNull(),
    createdAt: text('created_at').notNull(),
    dueAt: text('due_at').notNull(),
    notes: text('notes').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('maintenance_tickets_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('maintenance_tickets_deviceId_lookup').on(t.gh, t.deviceId),
    foreignKey({
      columns: [t.gh, t.supplyItemId],
      foreignColumns: [supplyItems.gh, supplyItems.id],
    }),
    index('maintenance_tickets_supplyItemId_lookup').on(t.gh, t.supplyItemId),
    index('maintenance_tickets_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('maintenance_tickets_submission_once').on(t.gh, t.submissionKey),
  ],
);
export const activityEvents = sqliteTable(
  'activity_events',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    at: text('at').notNull(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    detail: text('detail').notNull(),
    actor: text('actor').notNull(),
    objectId: text('object_id').notNull(),
    zoneId: text('zone_id'),
    before: text('before'),
    after: text('after'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('activity_events_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('activity_events_zoneId_lookup').on(t.gh, t.zoneId),
    index('activity_events_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const expenses = sqliteTable(
  'expenses',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    paidAt: text('paid_at').notNull(),
    category: text('category').notNull(),
    amount: real('amount').notNull(),
    source: text('source').notNull(),
    status: text('status').notNull(),
    note: text('note').notNull(),
    deviceId: text('device_id'),
    zoneId: text('zone_id'),
    maintenanceId: text('maintenance_id'),
    routineId: text('routine_id'),
    reference: text('reference'),
    attachmentName: text('attachment_name'),
    voidReason: text('void_reason'),
    submissionKey: text('submission_key').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('expenses_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('expenses_deviceId_lookup').on(t.gh, t.deviceId),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('expenses_zoneId_lookup').on(t.gh, t.zoneId),
    foreignKey({
      columns: [t.gh, t.maintenanceId],
      foreignColumns: [maintenanceTickets.gh, maintenanceTickets.id],
    }),
    index('expenses_maintenanceId_lookup').on(t.gh, t.maintenanceId),
    foreignKey({ columns: [t.gh, t.routineId], foreignColumns: [routines.gh, routines.id] }),
    index('expenses_routineId_lookup').on(t.gh, t.routineId),
    index('expenses_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('maintenance_expense_once').on(t.gh, t.maintenanceId),
    uniqueIndex('expenses_submission_once').on(t.gh, t.submissionKey),
  ],
);
export const expensePeriodSlices = sqliteTable(
  'expense_period_slices',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    period: text('period').notNull(),
    amount: real('amount').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [expenses.gh, expenses.recordKey],
    }).onDelete('cascade'),
    index('expense_period_slices_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const expenseAllocations = sqliteTable(
  'expense_allocations',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    expenseId: text('expense_id').notNull(),
    deviceId: text('device_id'),
    zoneId: text('zone_id'),
    amount: real('amount').notNull(),
    basis: text('basis').notNull(),
    label: text('label').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('expense_allocations_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.expenseId], foreignColumns: [expenses.gh, expenses.id] }),
    index('expense_allocations_expenseId_lookup').on(t.gh, t.expenseId),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('expense_allocations_deviceId_lookup').on(t.gh, t.deviceId),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('expense_allocations_zoneId_lookup').on(t.gh, t.zoneId),
    index('expense_allocations_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const recurringExpenses = sqliteTable(
  'recurring_expenses',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    category: text('category').notNull(),
    title: text('title').notNull(),
    day: real('day').notNull(),
    deviceId: text('device_id'),
    effectiveFrom: text('effective_from').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('recurring_expenses_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('recurring_expenses_deviceId_lookup').on(t.gh, t.deviceId),
    index('recurring_expenses_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const periodBudgets = sqliteTable(
  'period_budgets',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    period: text('period').notNull(),
    amount: real('amount').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    index('period_budgets_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const savingsBaselines = sqliteTable(
  'savings_baselines',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    version: real('version').notNull(),
    source: text('source').notNull(),
    period: text('period').notNull(),
    days: real('days').notNull(),
    area: real('area').notNull(),
    crop: text('crop').notNull(),
    phase: text('phase').notNull(),
    normalizedDaily: integer('normalized_daily').notNull(),
    appliedOn: text('applied_on').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('savings_baselines_gh_id').on(t.gh, t.id),
    check('savings_baselines_normalized_daily_bool', sql`${t.normalizedDaily} in (0, 1)`),
    index('savings_baselines_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const baselineZones = sqliteTable(
  'baseline_zones',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [savingsBaselines.gh, savingsBaselines.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.value], foreignColumns: [zones.gh, zones.id] }),
    index('baseline_zones_value_lookup').on(t.gh, t.value),
    index('baseline_zones_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('baseline_zones_membership_once').on(t.gh, t.parentKey, t.value),
  ],
);
export const baselineCategories = sqliteTable(
  'baseline_categories',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    mapKey: text('map_key').notNull(),
    value: real('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [savingsBaselines.gh, savingsBaselines.recordKey],
    }).onDelete('cascade'),
    index('baseline_categories_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const costConfiguration = sqliteTable(
  'cost_configuration',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    electricityPerKwh: real('electricity_per_kwh').notNull(),
    waterPerLiter: real('water_per_liter').notNull(),
    nutrientUnitPrice: real('nutrient_unit_price').notNull(),
    plannerZones: real('planner_zones').notNull(),
    ownedController: integer('owned_controller').notNull(),
    contingencyPercent: real('contingency_percent').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    check('cost_configuration_owned_controller_bool', sql`${t.ownedController} in (0, 1)`),
    index('cost_configuration_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const manualOverrides = sqliteTable(
  'manual_overrides',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    routineId: text('routine_id').notNull(),
    reason: text('reason').notNull(),
    createdAt: real('created_at').notNull(),
    expiresAt: real('expires_at').notNull(),
    scope: text('scope').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('manual_overrides_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.routineId], foreignColumns: [routines.gh, routines.id] }),
    index('manual_overrides_routineId_lookup').on(t.gh, t.routineId),
    index('manual_overrides_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const cultivation = sqliteTable(
  'cultivation',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    version: real('version').notNull(),
    nextZoneNumber: real('next_zone_number').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    index('cultivation_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const plantingBatches = sqliteTable(
  'planting_batches',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    zoneId: text('zone_id').notNull(),
    cycleId: text('cycle_id').notNull(),
    crop: text('crop').notNull(),
    variety: text('variety').notNull(),
    plantedOn: text('planted_on').notNull(),
    targetHarvestOn: text('target_harvest_on').notNull(),
    stage: text('stage').notNull(),
    seedSource: text('seed_source').notNull(),
    notes: text('notes').notNull(),
    initialPlants: real('initial_plants').notNull(),
    status: text('status').notNull(),
    closedOn: text('closed_on'),
    closingNotes: text('closing_notes'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [cultivation.gh, cultivation.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('planting_batches_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('planting_batches_zoneId_lookup').on(t.gh, t.zoneId),
    foreignKey({ columns: [t.gh, t.cycleId], foreignColumns: [cropCycles.gh, cropCycles.id] }),
    index('planting_batches_cycleId_lookup').on(t.gh, t.cycleId),
    index('planting_batches_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('active_batch_per_zone')
      .on(t.gh, t.zoneId)
      .where(sql`status = 'active'`),
  ],
);
export const plantMovements = sqliteTable(
  'plant_movements',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    batchId: text('batch_id').notNull(),
    at: text('at').notNull(),
    kind: text('kind').notNull(),
    quantity: real('quantity').notNull(),
    reason: text('reason').notNull(),
    actor: text('actor').notNull(),
    key: text('key').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [cultivation.gh, cultivation.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('plant_movements_gh_id').on(t.gh, t.id),
    foreignKey({
      columns: [t.gh, t.batchId],
      foreignColumns: [plantingBatches.gh, plantingBatches.id],
    }),
    index('plant_movements_batchId_lookup').on(t.gh, t.batchId),
    index('plant_movements_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('plant_movements_request_once').on(t.gh, t.key),
  ],
);
export const productionCycles = sqliteTable(
  'production_cycles',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    version: real('version').notNull(),
    cycleId: text('cycle_id').notNull(),
    stage: text('stage').notNull(),
    targetOn: text('target_on').notNull(),
    targetKg: real('target_kg'),
    targetPrice: real('target_price'),
    operator: text('operator').notNull(),
    closedOn: text('closed_on'),
    closingNotes: text('closing_notes'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.cycleId], foreignColumns: [cropCycles.gh, cropCycles.id] }),
    index('production_cycles_cycleId_lookup').on(t.gh, t.cycleId),
    index('production_cycles_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const careTasks = sqliteTable(
  'care_tasks',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    plantingId: text('planting_id'),
    title: text('title').notNull(),
    zoneId: text('zone_id').notNull(),
    dueOn: text('due_on').notNull(),
    operator: text('operator').notNull(),
    status: text('status').notNull(),
    notes: text('notes').notNull(),
    completedOn: text('completed_on'),
    key: text('key').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [productionCycles.gh, productionCycles.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('care_tasks_gh_id').on(t.gh, t.id),
    foreignKey({
      columns: [t.gh, t.plantingId],
      foreignColumns: [plantingBatches.gh, plantingBatches.id],
    }),
    index('care_tasks_plantingId_lookup').on(t.gh, t.plantingId),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('care_tasks_zoneId_lookup').on(t.gh, t.zoneId),
    index('care_tasks_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('care_tasks_request_once').on(t.gh, t.key),
  ],
);
export const harvestLots = sqliteTable(
  'harvest_lots',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    plantingId: text('planting_id'),
    crop: text('crop'),
    variety: text('variety'),
    date: text('date').notNull(),
    zoneId: text('zone_id').notNull(),
    grossKg: real('gross_kg').notNull(),
    aKg: real('a_kg').notNull(),
    bKg: real('b_kg').notNull(),
    rejectedKg: real('rejected_kg').notNull(),
    notes: text('notes').notNull(),
    operator: text('operator').notNull(),
    status: text('status').notNull(),
    reviewNotes: text('review_notes'),
    reviewedOn: text('reviewed_on'),
    key: text('key').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [productionCycles.gh, productionCycles.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('harvest_lots_gh_id').on(t.gh, t.id),
    foreignKey({
      columns: [t.gh, t.plantingId],
      foreignColumns: [plantingBatches.gh, plantingBatches.id],
    }),
    index('harvest_lots_plantingId_lookup').on(t.gh, t.plantingId),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('harvest_lots_zoneId_lookup').on(t.gh, t.zoneId),
    index('harvest_lots_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('harvest_lots_request_once').on(t.gh, t.key),
  ],
);
export const sales = sqliteTable(
  'sales',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    lotId: text('lot_id').notNull(),
    grade: text('grade').notNull(),
    kg: real('kg').notNull(),
    price: real('price').notNull(),
    date: text('date').notNull(),
    dueOn: text('due_on').notNull(),
    buyer: text('buyer').notNull(),
    status: text('status').notNull(),
    key: text('key').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [productionCycles.gh, productionCycles.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('sales_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.lotId], foreignColumns: [harvestLots.gh, harvestLots.id] }),
    index('sales_lotId_lookup').on(t.gh, t.lotId),
    index('sales_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('sales_request_once').on(t.gh, t.key),
  ],
);
export const receipts = sqliteTable(
  'receipts',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    saleId: text('sale_id').notNull(),
    date: text('date').notNull(),
    amount: real('amount').notNull(),
    reference: text('reference').notNull(),
    key: text('key').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [productionCycles.gh, productionCycles.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('receipts_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.saleId], foreignColumns: [sales.gh, sales.id] }),
    index('receipts_saleId_lookup').on(t.gh, t.saleId),
    index('receipts_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('receipts_request_once').on(t.gh, t.key),
  ],
);
export const harvestLosses = sqliteTable(
  'harvest_losses',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    lotId: text('lot_id').notNull(),
    grade: text('grade').notNull(),
    kg: real('kg').notNull(),
    date: text('date').notNull(),
    reason: text('reason').notNull(),
    key: text('key').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [productionCycles.gh, productionCycles.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('harvest_losses_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.lotId], foreignColumns: [harvestLots.gh, harvestLots.id] }),
    index('harvest_losses_lotId_lookup').on(t.gh, t.lotId),
    index('harvest_losses_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('harvest_losses_request_once').on(t.gh, t.key),
  ],
);
export const cycleExpenseShares = sqliteTable(
  'cycle_expense_shares',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    mapKey: text('map_key').notNull(),
    value: real('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [productionCycles.gh, productionCycles.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.mapKey], foreignColumns: [expenses.gh, expenses.id] }),
    index('cycle_expense_shares_mapKey_lookup').on(t.gh, t.mapKey),
    index('cycle_expense_shares_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const cycleFinance = sqliteTable(
  'cycle_finance',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    depreciation: real('depreciation'),
    unpaidLabor: real('unpaid_labor'),
    otherAccrued: real('other_accrued'),
    baselineCost: real('baseline_cost'),
    notes: text('notes').notNull(),
    reviewKey: text('review_key'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [productionCycles.gh, productionCycles.recordKey],
    }).onDelete('cascade'),
    index('cycle_finance_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const solarConfiguration = sqliteTable(
  'solar_configuration',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    enabled: integer('enabled').notNull(),
    panelCount: real('panel_count').notNull(),
    panelWatts: real('panel_watts').notNull(),
    inverterKw: real('inverter_kw').notNull(),
    sunHours: real('sun_hours').notNull(),
    performanceRatio: real('performance_ratio').notNull(),
    tariff: real('tariff').notNull(),
    investment: real('investment'),
    maintenanceMonthly: real('maintenance_monthly').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    check('solar_configuration_enabled_bool', sql`${t.enabled} in (0, 1)`),
    index('solar_configuration_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const deviceLoadAssumptions = sqliteTable(
  'device_load_assumptions',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    mapKey: text('map_key').notNull(),
    hours: real('hours').notNull(),
    start: real('start').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [solarConfiguration.gh, solarConfiguration.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.mapKey], foreignColumns: [devices.gh, devices.id] }),
    index('device_load_assumptions_mapKey_lookup').on(t.gh, t.mapKey),
    index('device_load_assumptions_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const cropTargets = sqliteTable(
  'crop_targets',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    version: real('version').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    index('crop_targets_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const targetRevisions = sqliteTable(
  'target_revisions',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    batchId: text('batch_id').notNull(),
    zoneId: text('zone_id').notNull(),
    crop: text('crop').notNull(),
    variety: text('variety').notNull(),
    stage: text('stage').notNull(),
    version: real('version').notNull(),
    notes: text('notes').notNull(),
    createdAt: text('created_at').notNull(),
    createdBy: text('created_by').notNull(),
    status: text('status').notNull(),
    reviewedAt: text('reviewed_at'),
    reviewedBy: text('reviewed_by'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [cropTargets.gh, cropTargets.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('target_revisions_gh_id').on(t.gh, t.id),
    foreignKey({
      columns: [t.gh, t.batchId],
      foreignColumns: [plantingBatches.gh, plantingBatches.id],
    }),
    index('target_revisions_batchId_lookup').on(t.gh, t.batchId),
    foreignKey({ columns: [t.gh, t.zoneId], foreignColumns: [zones.gh, zones.id] }),
    index('target_revisions_zoneId_lookup').on(t.gh, t.zoneId),
    index('target_revisions_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const targetLimits = sqliteTable(
  'target_limits',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    mapKey: text('map_key').notNull(),
    min: real('min').notNull(),
    max: real('max').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [targetRevisions.gh, targetRevisions.recordKey],
    }).onDelete('cascade'),
    index('target_limits_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const supplyRegister = sqliteTable(
  'supply_register',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    version: real('version').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    index('supply_register_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const supplyItems = sqliteTable(
  'supply_items',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    name: text('name').notNull(),
    unit: text('unit').notNull(),
    category: text('category').notNull(),
    reorderAt: real('reorder_at').notNull(),
    deviceId: text('device_id'),
    autoTask: integer('auto_task').notNull(),
    operator: text('operator').notNull(),
    active: integer('active').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [supplyRegister.gh, supplyRegister.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('supply_items_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('supply_items_deviceId_lookup').on(t.gh, t.deviceId),
    check('supply_items_auto_task_bool', sql`${t.autoTask} in (0, 1)`),
    check('supply_items_active_bool', sql`${t.active} in (0, 1)`),
    index('supply_items_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const supplyMovements = sqliteTable(
  'supply_movements',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    itemId: text('item_id').notNull(),
    kind: text('kind').notNull(),
    quantity: real('quantity').notNull(),
    date: text('date').notNull(),
    notes: text('notes').notNull(),
    actor: text('actor').notNull(),
    key: text('key').notNull(),
    expenseId: text('expense_id'),
    runId: text('run_id'),
    maintenanceId: text('maintenance_id'),
    reverses: text('reverses'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [supplyRegister.gh, supplyRegister.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('supply_movements_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.itemId], foreignColumns: [supplyItems.gh, supplyItems.id] }),
    index('supply_movements_itemId_lookup').on(t.gh, t.itemId),
    foreignKey({ columns: [t.gh, t.expenseId], foreignColumns: [expenses.gh, expenses.id] }),
    index('supply_movements_expenseId_lookup').on(t.gh, t.expenseId),
    foreignKey({
      columns: [t.gh, t.runId],
      foreignColumns: [automationRuns.gh, automationRuns.id],
    }),
    index('supply_movements_runId_lookup').on(t.gh, t.runId),
    foreignKey({
      columns: [t.gh, t.maintenanceId],
      foreignColumns: [maintenanceTickets.gh, maintenanceTickets.id],
    }),
    index('supply_movements_maintenanceId_lookup').on(t.gh, t.maintenanceId),
    foreignKey({
      columns: [t.gh, t.reverses],
      foreignColumns: [supplyMovements.gh, supplyMovements.id],
    }),
    index('supply_movements_reverses_lookup').on(t.gh, t.reverses),
    index('supply_movements_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('supply_movements_request_once').on(t.gh, t.key),
  ],
);
export const cycleResources = sqliteTable(
  'cycle_resources',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    version: real('version').notNull(),
    cycleId: text('cycle_id').notNull(),
    coverage: text('coverage').notNull(),
    notes: text('notes').notNull(),
    reviewKey: text('review_key'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    foreignKey({ columns: [t.gh, t.cycleId], foreignColumns: [cropCycles.gh, cropCycles.id] }),
    index('cycle_resources_cycleId_lookup').on(t.gh, t.cycleId),
    index('cycle_resources_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const cycleUsageShares = sqliteTable(
  'cycle_usage_shares',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    mapKey: text('map_key').notNull(),
    value: real('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [cycleResources.gh, cycleResources.recordKey],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.gh, t.mapKey],
      foreignColumns: [resourceUsages.gh, resourceUsages.id],
    }),
    index('cycle_usage_shares_mapKey_lookup').on(t.gh, t.mapKey),
    index('cycle_usage_shares_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const extraResourceUsage = sqliteTable(
  'extra_resource_usage',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    date: text('date').notNull(),
    waterLiters: real('water_liters'),
    energyKwh: real('energy_kwh'),
    basis: text('basis').notNull(),
    notes: text('notes').notNull(),
    key: text('key').notNull(),
    void: integer('void').notNull(),
    voidReason: text('void_reason'),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [cycleResources.gh, cycleResources.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('extra_resource_usage_gh_id').on(t.gh, t.id),
    check('extra_resource_usage_void_bool', sql`${t.void} in (0, 1)`),
    index('extra_resource_usage_parent_lookup').on(t.gh, t.parentKey),
    uniqueIndex('extra_resource_usage_request_once').on(t.gh, t.key),
  ],
);
export const sensorReadings = sqliteTable(
  'sensor_readings',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    id: text('id').notNull(),
    deviceId: text('device_id').notNull(),
    metric: text('metric').notNull(),
    value: real('value'),
    unit: text('unit').notNull(),
    capturedAt: text('captured_at').notNull(),
    provenance: text('provenance').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    uniqueIndex('sensor_readings_gh_id').on(t.gh, t.id),
    foreignKey({ columns: [t.gh, t.deviceId], foreignColumns: [devices.gh, devices.id] }),
    index('sensor_readings_deviceId_lookup').on(t.gh, t.deviceId),
    index('sensor_readings_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const observedTriggers = sqliteTable(
  'observed_triggers',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    value: text('value').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    index('observed_triggers_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const sensorEpisodes = sqliteTable(
  'sensor_episodes',
  {
    gh: text('gh').notNull(),
    recordKey: text('record_key').notNull(),
    ordinal: integer('ordinal').notNull(),
    parentKey: text('parent_key').notNull(),
    mapKey: text('map_key').notNull(),
    activeSince: real('active_since'),
    latched: integer('latched').notNull(),
    sequence: real('sequence').notNull(),
  },
  (t): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [t.gh, t.recordKey] }),
    foreignKey({
      columns: [t.gh, t.parentKey],
      foreignColumns: [greenhouseState.gh, greenhouseState.recordKey],
    }).onDelete('cascade'),
    check('sensor_episodes_latched_bool', sql`${t.latched} in (0, 1)`),
    index('sensor_episodes_parent_lookup').on(t.gh, t.parentKey),
  ],
);
export const workspaceCommits = sqliteTable('workspace_commits', {
  revision: integer('revision').primaryKey(),
  requestId: text('request_id').notNull().unique(),
  bodyHash: text('body_hash').notNull(),
  actor: text('actor').notNull(),
  operation: text('operation').notNull(),
  resultId: text('result_id'),
  at: text('at').notNull(),
});
export const workspaceMeta = sqliteTable('workspace_meta', {
  id: integer('id').primaryKey(),
  nextGreenhouseNumber: integer('next_greenhouse_number').notNull(),
  seedVersion: integer('seed_version').notNull(),
});
export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  principal: text('principal').unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  position: text('position').notNull(),
  role: text('role').notNull(),
  active: integer('active').notNull(),
});
export const memberGreenhouses = sqliteTable(
  'member_greenhouses',
  {
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    gh: text('gh').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.memberId, t.gh] }),
    foreignKey({ columns: [t.gh], foreignColumns: [greenhouses.id] }),
  ],
);
export const preferences = sqliteTable('member_preferences', {
  memberId: text('member_id')
    .primaryKey()
    .references(() => members.id, { onDelete: 'cascade' }),
  theme: text('theme').notNull(),
  collapsed: integer('collapsed').notNull(),
  activeGh: text('active_gh'),
  inspection: integer('inspection').notNull(),
  device: integer('device').notNull(),
  automation: integer('automation').notNull(),
  expense: integer('expense').notNull(),
});
export const notificationReads = sqliteTable(
  'notification_reads',
  {
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    gh: text('gh')
      .notNull()
      .references(() => greenhouses.id, { onDelete: 'cascade' }),
    notificationId: text('notification_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.memberId, t.gh, t.notificationId] })],
);
export const guideProgress = sqliteTable(
  'guide_progress',
  {
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    gh: text('gh')
      .notNull()
      .references(() => greenhouses.id, { onDelete: 'cascade' }),
    tour: text('tour').notNull(),
    step: text('step').notNull(),
    finished: integer('finished').notNull(),
  },
  (t) => [primaryKey({ columns: [t.memberId, t.gh, t.tour] })],
);
export const guideSeen = sqliteTable(
  'guide_seen',
  {
    memberId: text('member_id').notNull(),
    gh: text('gh').notNull(),
    tour: text('tour').notNull(),
    step: text('step').notNull(),
    ordinal: integer('ordinal').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.memberId, t.gh, t.tour, t.step] }),
    foreignKey({
      columns: [t.memberId, t.gh, t.tour],
      foreignColumns: [guideProgress.memberId, guideProgress.gh, guideProgress.tour],
    }).onDelete('cascade'),
  ],
);
export const guideDismissed = sqliteTable(
  'guide_dismissed',
  {
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    gh: text('gh')
      .notNull()
      .references(() => greenhouses.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.memberId, t.gh] })],
);
