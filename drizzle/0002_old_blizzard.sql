CREATE INDEX `activity_events_zoneId_lookup` ON `activity_events` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `activity_events_parent_lookup` ON `activity_events` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `automation_runs_cycleId_lookup` ON `automation_runs` (`gh`,`cycle_id`);--> statement-breakpoint
CREATE INDEX `automation_runs_planId_lookup` ON `automation_runs` (`gh`,`plan_id`);--> statement-breakpoint
CREATE INDEX `automation_runs_currentZone_lookup` ON `automation_runs` (`gh`,`current_zone`);--> statement-breakpoint
CREATE INDEX `automation_runs_routineId_lookup` ON `automation_runs` (`gh`,`routine_id_resolved`);--> statement-breakpoint
CREATE INDEX `automation_runs_parent_lookup` ON `automation_runs` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `baseline_categories_parent_lookup` ON `baseline_categories` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `baseline_zones_value_lookup` ON `baseline_zones` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `baseline_zones_parent_lookup` ON `baseline_zones` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `baseline_zones_membership_once` ON `baseline_zones` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `care_tasks_plantingId_lookup` ON `care_tasks` (`gh`,`planting_id`);--> statement-breakpoint
CREATE INDEX `care_tasks_zoneId_lookup` ON `care_tasks` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `care_tasks_parent_lookup` ON `care_tasks` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `care_tasks_request_once` ON `care_tasks` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `command_devices_value_lookup` ON `command_devices` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `command_devices_parent_lookup` ON `command_devices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `command_devices_membership_once` ON `command_devices` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `control_commands_runId_lookup` ON `control_commands` (`gh`,`run_id`);--> statement-breakpoint
CREATE INDEX `control_commands_parent_lookup` ON `control_commands` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `control_plan_tasks_parent_lookup` ON `control_plan_tasks` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `control_plans_caseId_lookup` ON `control_plans` (`gh`,`case_id`);--> statement-breakpoint
CREATE INDEX `control_plans_zoneId_lookup` ON `control_plans` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `control_plans_runId_lookup` ON `control_plans` (`gh`,`run_id`);--> statement-breakpoint
CREATE INDEX `control_plans_parent_lookup` ON `control_plans` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `cost_configuration_parent_lookup` ON `cost_configuration` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `crop_cycles_parent_lookup` ON `crop_cycles` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `crop_targets_parent_lookup` ON `crop_targets` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `cultivation_parent_lookup` ON `cultivation` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `cycle_expense_shares_mapKey_lookup` ON `cycle_expense_shares` (`gh`,`map_key`);--> statement-breakpoint
CREATE INDEX `cycle_expense_shares_parent_lookup` ON `cycle_expense_shares` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `cycle_finance_parent_lookup` ON `cycle_finance` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `cycle_resources_cycleId_lookup` ON `cycle_resources` (`gh`,`cycle_id`);--> statement-breakpoint
CREATE INDEX `cycle_resources_parent_lookup` ON `cycle_resources` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `cycle_usage_shares_mapKey_lookup` ON `cycle_usage_shares` (`gh`,`map_key`);--> statement-breakpoint
CREATE INDEX `cycle_usage_shares_parent_lookup` ON `cycle_usage_shares` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `detection_observations_value_lookup` ON `detection_observations` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `detection_observations_parent_lookup` ON `detection_observations` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `detection_signals_parent_lookup` ON `detection_signals` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `detection_values_parent_lookup` ON `detection_values` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `device_capabilities_parent_lookup` ON `device_capabilities` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `device_capabilities_membership_once` ON `device_capabilities` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `device_load_assumptions_mapKey_lookup` ON `device_load_assumptions` (`gh`,`map_key`);--> statement-breakpoint
CREATE INDEX `device_load_assumptions_parent_lookup` ON `device_load_assumptions` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `device_zones_value_lookup` ON `device_zones` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `device_zones_parent_lookup` ON `device_zones` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `device_zones_membership_once` ON `device_zones` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `devices_parent_lookup` ON `devices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `evidence_followups_parent_lookup` ON `evidence_followups` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `evidence_reviews_parent_lookup` ON `evidence_reviews` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `expense_allocations_expenseId_lookup` ON `expense_allocations` (`gh`,`expense_id`);--> statement-breakpoint
CREATE INDEX `expense_allocations_deviceId_lookup` ON `expense_allocations` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `expense_allocations_zoneId_lookup` ON `expense_allocations` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `expense_allocations_parent_lookup` ON `expense_allocations` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `expense_period_slices_parent_lookup` ON `expense_period_slices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `expenses_deviceId_lookup` ON `expenses` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `expenses_zoneId_lookup` ON `expenses` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `expenses_maintenanceId_lookup` ON `expenses` (`gh`,`maintenance_id`);--> statement-breakpoint
CREATE INDEX `expenses_routineId_lookup` ON `expenses` (`gh`,`routine_id`);--> statement-breakpoint
CREATE INDEX `expenses_parent_lookup` ON `expenses` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_expense_once` ON `expenses` (`gh`,`maintenance_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `expenses_submission_once` ON `expenses` (`gh`,`submission_key`);--> statement-breakpoint
CREATE INDEX `extra_resource_usage_parent_lookup` ON `extra_resource_usage` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `extra_resource_usage_request_once` ON `extra_resource_usage` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `greenhouses_parent_lookup` ON `greenhouses` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `harvest_losses_lotId_lookup` ON `harvest_losses` (`gh`,`lot_id`);--> statement-breakpoint
CREATE INDEX `harvest_losses_parent_lookup` ON `harvest_losses` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `harvest_losses_request_once` ON `harvest_losses` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `harvest_lots_plantingId_lookup` ON `harvest_lots` (`gh`,`planting_id`);--> statement-breakpoint
CREATE INDEX `harvest_lots_zoneId_lookup` ON `harvest_lots` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `harvest_lots_parent_lookup` ON `harvest_lots` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `harvest_lots_request_once` ON `harvest_lots` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `inspections_caseId_lookup` ON `inspections` (`gh`,`case_id`);--> statement-breakpoint
CREATE INDEX `inspections_parent_lookup` ON `inspections` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `maintenance_tickets_deviceId_lookup` ON `maintenance_tickets` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `maintenance_tickets_supplyItemId_lookup` ON `maintenance_tickets` (`gh`,`supply_item_id`);--> statement-breakpoint
CREATE INDEX `maintenance_tickets_parent_lookup` ON `maintenance_tickets` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_tickets_submission_once` ON `maintenance_tickets` (`gh`,`submission_key`);--> statement-breakpoint
CREATE INDEX `manual_overrides_routineId_lookup` ON `manual_overrides` (`gh`,`routine_id`);--> statement-breakpoint
CREATE INDEX `manual_overrides_parent_lookup` ON `manual_overrides` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `nutrient_profile_devices_value_lookup` ON `nutrient_profile_devices` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `nutrient_profile_devices_parent_lookup` ON `nutrient_profile_devices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `nutrient_profile_devices_membership_once` ON `nutrient_profile_devices` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `nutrient_profile_zones_value_lookup` ON `nutrient_profile_zones` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `nutrient_profile_zones_parent_lookup` ON `nutrient_profile_zones` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `nutrient_profile_zones_membership_once` ON `nutrient_profile_zones` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `nutrient_profiles_parent_lookup` ON `nutrient_profiles` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `observations_zoneId_lookup` ON `observations` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `observations_sourceDeviceId_lookup` ON `observations` (`gh`,`source_device_id`);--> statement-breakpoint
CREATE INDEX `observations_parent_lookup` ON `observations` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `observed_triggers_parent_lookup` ON `observed_triggers` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `period_budgets_parent_lookup` ON `period_budgets` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `pest_cases_zoneId_lookup` ON `pest_cases` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `pest_cases_sourceDeviceId_lookup` ON `pest_cases` (`gh`,`source_device_id`);--> statement-breakpoint
CREATE INDEX `pest_cases_parent_lookup` ON `pest_cases` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `plant_movements_batchId_lookup` ON `plant_movements` (`gh`,`batch_id`);--> statement-breakpoint
CREATE INDEX `plant_movements_parent_lookup` ON `plant_movements` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `plant_movements_request_once` ON `plant_movements` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `planting_batches_zoneId_lookup` ON `planting_batches` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `planting_batches_cycleId_lookup` ON `planting_batches` (`gh`,`cycle_id`);--> statement-breakpoint
CREATE INDEX `planting_batches_parent_lookup` ON `planting_batches` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `active_batch_per_zone` ON `planting_batches` (`gh`,`zone_id`) WHERE status = 'active';--> statement-breakpoint
CREATE INDEX `production_cycles_cycleId_lookup` ON `production_cycles` (`gh`,`cycle_id`);--> statement-breakpoint
CREATE INDEX `production_cycles_parent_lookup` ON `production_cycles` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `receipts_saleId_lookup` ON `receipts` (`gh`,`sale_id`);--> statement-breakpoint
CREATE INDEX `receipts_parent_lookup` ON `receipts` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `receipts_request_once` ON `receipts` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_deviceId_lookup` ON `recurring_expenses` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_parent_lookup` ON `recurring_expenses` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `resource_locks_runId_lookup` ON `resource_locks` (`gh`,`run_id`);--> statement-breakpoint
CREATE INDEX `resource_locks_parent_lookup` ON `resource_locks` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `resource_usages_deviceId_lookup` ON `resource_usages` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `resource_usages_runId_lookup` ON `resource_usages` (`gh`,`run_id_resolved`);--> statement-breakpoint
CREATE INDEX `resource_usages_parent_lookup` ON `resource_usages` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `routine_optional_devices_value_lookup` ON `routine_optional_devices` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `routine_optional_devices_parent_lookup` ON `routine_optional_devices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `routine_optional_devices_membership_once` ON `routine_optional_devices` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `routine_required_devices_value_lookup` ON `routine_required_devices` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `routine_required_devices_parent_lookup` ON `routine_required_devices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `routine_required_devices_membership_once` ON `routine_required_devices` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `routine_schedules_parent_lookup` ON `routine_schedules` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `routine_skipped_slots_parent_lookup` ON `routine_skipped_slots` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `routine_step_devices_value_lookup` ON `routine_step_devices` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `routine_step_devices_parent_lookup` ON `routine_step_devices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `routine_step_devices_membership_once` ON `routine_step_devices` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `routine_steps_zoneId_lookup` ON `routine_steps` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `routine_steps_parent_lookup` ON `routine_steps` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `routine_triggers_deviceId_lookup` ON `routine_triggers` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `routine_triggers_routineId_lookup` ON `routine_triggers` (`gh`,`routine_id`);--> statement-breakpoint
CREATE INDEX `routine_triggers_parent_lookup` ON `routine_triggers` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `routine_version_zones_value_lookup` ON `routine_version_zones` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `routine_version_zones_parent_lookup` ON `routine_version_zones` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `routine_version_zones_membership_once` ON `routine_version_zones` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `routine_versions_nutrientProfileId_lookup` ON `routine_versions` (`gh`,`nutrient_profile_id`);--> statement-breakpoint
CREATE INDEX `routine_versions_parent_lookup` ON `routine_versions` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `routines_parent_lookup` ON `routines` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `run_evidence_parent_lookup` ON `run_evidence` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `run_step_devices_value_lookup` ON `run_step_devices` (`gh`,`value`);--> statement-breakpoint
CREATE INDEX `run_step_devices_parent_lookup` ON `run_step_devices` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `run_step_devices_membership_once` ON `run_step_devices` (`gh`,`parent_key`,`value`);--> statement-breakpoint
CREATE INDEX `run_steps_zoneId_lookup` ON `run_steps` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `run_steps_parent_lookup` ON `run_steps` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `sales_lotId_lookup` ON `sales` (`gh`,`lot_id`);--> statement-breakpoint
CREATE INDEX `sales_parent_lookup` ON `sales` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `sales_request_once` ON `sales` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `savings_baselines_parent_lookup` ON `savings_baselines` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `schedule_times_parent_lookup` ON `schedule_times` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `schedule_weekdays_parent_lookup` ON `schedule_weekdays` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `sensor_episodes_parent_lookup` ON `sensor_episodes` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `sensor_readings_deviceId_lookup` ON `sensor_readings` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `sensor_readings_parent_lookup` ON `sensor_readings` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `solar_configuration_parent_lookup` ON `solar_configuration` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `supply_items_deviceId_lookup` ON `supply_items` (`gh`,`device_id`);--> statement-breakpoint
CREATE INDEX `supply_items_parent_lookup` ON `supply_items` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `supply_movements_itemId_lookup` ON `supply_movements` (`gh`,`item_id`);--> statement-breakpoint
CREATE INDEX `supply_movements_expenseId_lookup` ON `supply_movements` (`gh`,`expense_id`);--> statement-breakpoint
CREATE INDEX `supply_movements_runId_lookup` ON `supply_movements` (`gh`,`run_id`);--> statement-breakpoint
CREATE INDEX `supply_movements_maintenanceId_lookup` ON `supply_movements` (`gh`,`maintenance_id`);--> statement-breakpoint
CREATE INDEX `supply_movements_reverses_lookup` ON `supply_movements` (`gh`,`reverses`);--> statement-breakpoint
CREATE INDEX `supply_movements_parent_lookup` ON `supply_movements` (`gh`,`parent_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `supply_movements_request_once` ON `supply_movements` (`gh`,`key`);--> statement-breakpoint
CREATE INDEX `supply_register_parent_lookup` ON `supply_register` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `target_limits_parent_lookup` ON `target_limits` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `target_revisions_batchId_lookup` ON `target_revisions` (`gh`,`batch_id`);--> statement-breakpoint
CREATE INDEX `target_revisions_zoneId_lookup` ON `target_revisions` (`gh`,`zone_id`);--> statement-breakpoint
CREATE INDEX `target_revisions_parent_lookup` ON `target_revisions` (`gh`,`parent_key`);--> statement-breakpoint
CREATE INDEX `zones_parent_lookup` ON `zones` (`gh`,`parent_key`);