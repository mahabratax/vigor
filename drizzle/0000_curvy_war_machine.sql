CREATE TABLE `activity_events` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`at` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`actor` text NOT NULL,
	`object_id` text NOT NULL,
	`zone_id` text,
	`before` text,
	`after` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_events_gh_id` ON `activity_events` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `automation_runs` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`cycle_id` text,
	`routine_id` text NOT NULL,
	`routine_name` text NOT NULL,
	`kind` text NOT NULL,
	`routine_version_id` text NOT NULL,
	`snapshot` text NOT NULL,
	`trigger_key` text NOT NULL,
	`source` text NOT NULL,
	`policy` text NOT NULL,
	`plan_id` text,
	`status` text NOT NULL,
	`created_at` real NOT NULL,
	`started_at` real,
	`finished_at` real,
	`step_index` real NOT NULL,
	`resource` text,
	`reason` text NOT NULL,
	`stop_requested_at` real,
	`stop_result` text,
	`expires_at` real NOT NULL,
	`current_zone` text,
	`routine_id_resolved` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`cycle_id`) REFERENCES `crop_cycles`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`plan_id`) REFERENCES `control_plans`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`current_zone`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`routine_id_resolved`) REFERENCES `routines`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `automation_runs_gh_id` ON `automation_runs` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `baseline_categories` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`map_key` text NOT NULL,
	`value` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `savings_baselines`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `baseline_zones` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `savings_baselines`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `care_tasks` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`planting_id` text,
	`title` text NOT NULL,
	`zone_id` text NOT NULL,
	`due_on` text NOT NULL,
	`operator` text NOT NULL,
	`status` text NOT NULL,
	`notes` text NOT NULL,
	`completed_on` text,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `production_cycles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`planting_id`) REFERENCES `planting_batches`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `care_tasks_gh_id` ON `care_tasks` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `command_devices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `control_commands`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `control_commands` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`run_id` text NOT NULL,
	`step_id` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`queued_at` real NOT NULL,
	`acknowledged_at` real,
	`finished_at` real,
	`reason` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`run_id`) REFERENCES `automation_runs`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `control_commands_gh_id` ON `control_commands` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `control_plan_tasks` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`label` text NOT NULL,
	`done` integer NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `control_plans`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "control_plan_tasks_done_bool" CHECK("control_plan_tasks"."done" in (0, 1))
);
--> statement-breakpoint
CREATE TABLE `control_plans` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`case_id` text NOT NULL,
	`zone_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`operator` text NOT NULL,
	`notes` text NOT NULL,
	`status` text NOT NULL,
	`duration_seconds` real NOT NULL,
	`created_at` text NOT NULL,
	`evaluation_at` text,
	`evaluation_notes` text,
	`run_id` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`case_id`) REFERENCES `pest_cases`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`run_id`) REFERENCES `automation_runs`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `control_plans_gh_id` ON `control_plans` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `cost_configuration` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`electricity_per_kwh` real NOT NULL,
	`water_per_liter` real NOT NULL,
	`nutrient_unit_price` real NOT NULL,
	`planner_zones` real NOT NULL,
	`owned_controller` integer NOT NULL,
	`contingency_percent` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "cost_configuration_owned_controller_bool" CHECK("cost_configuration"."owned_controller" in (0, 1))
);
--> statement-breakpoint
CREATE TABLE `crop_cycles` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`crop` text NOT NULL,
	`phase` text NOT NULL,
	`planted_on` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `crop_cycles_gh_id` ON `crop_cycles` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `crop_targets` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`version` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cultivation` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`version` real NOT NULL,
	`next_zone_number` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cycle_expense_shares` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`map_key` text NOT NULL,
	`value` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `production_cycles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`map_key`) REFERENCES `expenses`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cycle_finance` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`depreciation` real,
	`unpaid_labor` real,
	`other_accrued` real,
	`baseline_cost` real,
	`notes` text NOT NULL,
	`review_key` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `production_cycles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cycle_resources` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`version` real NOT NULL,
	`cycle_id` text NOT NULL,
	`coverage` text NOT NULL,
	`notes` text NOT NULL,
	`review_key` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`cycle_id`) REFERENCES `crop_cycles`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cycle_usage_shares` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`map_key` text NOT NULL,
	`value` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `cycle_resources`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`map_key`) REFERENCES `resource_usages`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `detection_observations` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `detection_signals`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `observations`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `detection_signals` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`key` text NOT NULL,
	`rule_version` text NOT NULL,
	`baseline` real NOT NULL,
	`triggered_at` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `pest_cases`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `detection_values` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `detection_signals`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `device_capabilities` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `devices`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `device_load_assumptions` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`map_key` text NOT NULL,
	`hours` real NOT NULL,
	`start` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `solar_configuration`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`map_key`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `device_zones` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `devices`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`label` text NOT NULL,
	`type` text NOT NULL,
	`connection` text NOT NULL,
	`maintenance` integer NOT NULL,
	`calibrated` integer NOT NULL,
	`watts` real NOT NULL,
	`last_seen` text NOT NULL,
	`next_maintenance` text NOT NULL,
	`resource` text,
	`acquired_amount` real,
	`active` integer NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "devices_maintenance_bool" CHECK("devices"."maintenance" in (0, 1)),
	CONSTRAINT "devices_calibrated_bool" CHECK("devices"."calibrated" in (0, 1)),
	CONSTRAINT "devices_active_bool" CHECK("devices"."active" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devices_gh_id` ON `devices` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `evidence_followups` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`at` real NOT NULL,
	`scenario` text NOT NULL,
	`readings` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `run_evidence`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `evidence_reviews` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`after_id` text NOT NULL,
	`verdict` text NOT NULL,
	`notes` text NOT NULL,
	`actor` text NOT NULL,
	`at` real NOT NULL,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `run_evidence`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expense_allocations` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`expense_id` text NOT NULL,
	`device_id` text,
	`zone_id` text,
	`amount` real NOT NULL,
	`basis` text NOT NULL,
	`label` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`expense_id`) REFERENCES `expenses`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expense_allocations_gh_id` ON `expense_allocations` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `expense_period_slices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`period` text NOT NULL,
	`amount` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `expenses`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`paid_at` text NOT NULL,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`source` text NOT NULL,
	`status` text NOT NULL,
	`note` text NOT NULL,
	`device_id` text,
	`zone_id` text,
	`maintenance_id` text,
	`routine_id` text,
	`reference` text,
	`attachment_name` text,
	`void_reason` text,
	`submission_key` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`maintenance_id`) REFERENCES `maintenance_tickets`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`routine_id`) REFERENCES `routines`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expenses_gh_id` ON `expenses` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `extra_resource_usage` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`date` text NOT NULL,
	`water_liters` real,
	`energy_kwh` real,
	`basis` text NOT NULL,
	`notes` text NOT NULL,
	`key` text NOT NULL,
	`void` integer NOT NULL,
	`void_reason` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `cycle_resources`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "extra_resource_usage_void_bool" CHECK("extra_resource_usage"."void" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `extra_resource_usage_gh_id` ON `extra_resource_usage` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `greenhouse_state` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`schema_version` real NOT NULL,
	`clock` real NOT NULL,
	`profile` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`)
);
--> statement-breakpoint
CREATE TABLE `greenhouses` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`area` real NOT NULL,
	`planted_area` real NOT NULL,
	`source` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `greenhouses_gh_id` ON `greenhouses` (`gh`,`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `greenhouse_identity` ON `greenhouses` (`id`);--> statement-breakpoint
CREATE TABLE `guide_dismissed` (
	`member_id` text NOT NULL,
	`gh` text NOT NULL,
	PRIMARY KEY(`member_id`, `gh`),
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`) REFERENCES `greenhouses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `guide_progress` (
	`member_id` text NOT NULL,
	`gh` text NOT NULL,
	`tour` text NOT NULL,
	`step` text NOT NULL,
	`finished` integer NOT NULL,
	PRIMARY KEY(`member_id`, `gh`, `tour`),
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`) REFERENCES `greenhouses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `guide_seen` (
	`member_id` text NOT NULL,
	`gh` text NOT NULL,
	`tour` text NOT NULL,
	`step` text NOT NULL,
	`ordinal` integer NOT NULL,
	PRIMARY KEY(`member_id`, `gh`, `tour`, `step`),
	FOREIGN KEY (`member_id`,`gh`,`tour`) REFERENCES `guide_progress`(`member_id`,`gh`,`tour`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `harvest_losses` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`lot_id` text NOT NULL,
	`grade` text NOT NULL,
	`kg` real NOT NULL,
	`date` text NOT NULL,
	`reason` text NOT NULL,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `production_cycles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`lot_id`) REFERENCES `harvest_lots`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `harvest_losses_gh_id` ON `harvest_losses` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `harvest_lots` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`planting_id` text,
	`crop` text,
	`variety` text,
	`date` text NOT NULL,
	`zone_id` text NOT NULL,
	`gross_kg` real NOT NULL,
	`a_kg` real NOT NULL,
	`b_kg` real NOT NULL,
	`rejected_kg` real NOT NULL,
	`notes` text NOT NULL,
	`operator` text NOT NULL,
	`status` text NOT NULL,
	`review_notes` text,
	`reviewed_on` text,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `production_cycles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`planting_id`) REFERENCES `planting_batches`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `harvest_lots_gh_id` ON `harvest_lots` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `inspections` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`case_id` text NOT NULL,
	`at` text NOT NULL,
	`operator` text NOT NULL,
	`examined` real NOT NULL,
	`affected` real NOT NULL,
	`outcome` text NOT NULL,
	`notes` text NOT NULL,
	`attachment_name` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`case_id`) REFERENCES `pest_cases`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inspections_gh_id` ON `inspections` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `maintenance_tickets` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`supply_item_id` text,
	`submission_key` text,
	`device_id` text NOT NULL,
	`title` text NOT NULL,
	`operator` text,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`due_at` text NOT NULL,
	`notes` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`supply_item_id`) REFERENCES `supply_items`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_tickets_gh_id` ON `maintenance_tickets` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `manual_overrides` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`routine_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` real NOT NULL,
	`expires_at` real NOT NULL,
	`scope` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`routine_id`) REFERENCES `routines`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manual_overrides_gh_id` ON `manual_overrides` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `member_greenhouses` (
	`member_id` text NOT NULL,
	`gh` text NOT NULL,
	PRIMARY KEY(`member_id`, `gh`),
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`) REFERENCES `greenhouses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`principal` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`position` text NOT NULL,
	`role` text NOT NULL,
	`active` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_principal_unique` ON `members` (`principal`);--> statement-breakpoint
CREATE TABLE `notification_reads` (
	`member_id` text NOT NULL,
	`gh` text NOT NULL,
	`notification_id` text NOT NULL,
	PRIMARY KEY(`member_id`, `gh`, `notification_id`),
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`) REFERENCES `greenhouses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `nutrient_profile_devices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `nutrient_profiles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nutrient_profile_zones` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `nutrient_profiles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nutrient_profiles` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`version` text NOT NULL,
	`crop` text NOT NULL,
	`reviewed` integer NOT NULL,
	`status` text NOT NULL,
	`ec` real NOT NULL,
	`ph` real NOT NULL,
	`demo_units` real NOT NULL,
	`note` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "nutrient_profiles_reviewed_bool" CHECK("nutrient_profiles"."reviewed" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nutrient_profiles_gh_id` ON `nutrient_profiles` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `observations` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`zone_id` text NOT NULL,
	`at` text NOT NULL,
	`interval_hours` real NOT NULL,
	`new_captures` real,
	`source_device_id` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`source_device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `observations_gh_id` ON `observations` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `observed_triggers` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `period_budgets` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`period` text NOT NULL,
	`amount` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pest_cases` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`zone_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`verified` integer NOT NULL,
	`assigned_to` text,
	`created_at` text NOT NULL,
	`follow_up_at` text,
	`closed_at` text,
	`source_device_id` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`source_device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "pest_cases_verified_bool" CHECK("pest_cases"."verified" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pest_cases_gh_id` ON `pest_cases` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `plant_movements` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`batch_id` text NOT NULL,
	`at` text NOT NULL,
	`kind` text NOT NULL,
	`quantity` real NOT NULL,
	`reason` text NOT NULL,
	`actor` text NOT NULL,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `cultivation`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`batch_id`) REFERENCES `planting_batches`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plant_movements_gh_id` ON `plant_movements` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `planting_batches` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`zone_id` text NOT NULL,
	`cycle_id` text NOT NULL,
	`crop` text NOT NULL,
	`variety` text NOT NULL,
	`planted_on` text NOT NULL,
	`target_harvest_on` text NOT NULL,
	`stage` text NOT NULL,
	`seed_source` text NOT NULL,
	`notes` text NOT NULL,
	`initial_plants` real NOT NULL,
	`status` text NOT NULL,
	`closed_on` text,
	`closing_notes` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `cultivation`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`cycle_id`) REFERENCES `crop_cycles`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `planting_batches_gh_id` ON `planting_batches` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `member_preferences` (
	`member_id` text PRIMARY KEY NOT NULL,
	`theme` text NOT NULL,
	`collapsed` integer NOT NULL,
	`active_gh` text,
	`inspection` integer NOT NULL,
	`device` integer NOT NULL,
	`automation` integer NOT NULL,
	`expense` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `production_cycles` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`version` real NOT NULL,
	`cycle_id` text NOT NULL,
	`stage` text NOT NULL,
	`target_on` text NOT NULL,
	`target_kg` real,
	`target_price` real,
	`operator` text NOT NULL,
	`closed_on` text,
	`closing_notes` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`cycle_id`) REFERENCES `crop_cycles`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`sale_id` text NOT NULL,
	`date` text NOT NULL,
	`amount` real NOT NULL,
	`reference` text NOT NULL,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `production_cycles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`sale_id`) REFERENCES `sales`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receipts_gh_id` ON `receipts` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`day` real NOT NULL,
	`device_id` text,
	`effective_from` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recurring_expenses_gh_id` ON `recurring_expenses` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `resource_locks` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`run_id` text NOT NULL,
	`state` text NOT NULL,
	`acquired_at` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`run_id`) REFERENCES `automation_runs`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resource_locks_gh_id` ON `resource_locks` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `resource_usages` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`run_id` text NOT NULL,
	`routine_version_id` text NOT NULL,
	`device_id` text NOT NULL,
	`at` text NOT NULL,
	`seconds` real NOT NULL,
	`water_liters` real NOT NULL,
	`nutrient_units` real NOT NULL,
	`energy_kwh` real NOT NULL,
	`water_source` text NOT NULL,
	`delivery_confirmed` integer NOT NULL,
	`run_id_resolved` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`run_id_resolved`) REFERENCES `automation_runs`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "resource_usages_delivery_confirmed_bool" CHECK("resource_usages"."delivery_confirmed" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resource_usages_gh_id` ON `resource_usages` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `routine_optional_devices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_versions`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine_required_devices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_versions`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine_schedules` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`valid_from` text NOT NULL,
	`valid_until` text,
	`time_zone` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_triggers`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routine_skipped_slots` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routines`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routine_step_devices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_steps`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine_steps` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`label` text NOT NULL,
	`action` text NOT NULL,
	`duration` real NOT NULL,
	`zone_id` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_versions`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine_triggers` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`type` text NOT NULL,
	`device_id` text,
	`direction` text,
	`start` real,
	`recover` real,
	`debounce_seconds` real,
	`window_start` text,
	`window_end` text,
	`routine_id` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routines`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`routine_id`) REFERENCES `routines`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine_version_zones` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_versions`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routine_versions` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`number` text NOT NULL,
	`reviewed` integer NOT NULL,
	`created_at` text NOT NULL,
	`resource` text,
	`max_duration` real NOT NULL,
	`max_cycles_per_day` real NOT NULL,
	`cooldown_seconds` real NOT NULL,
	`max_water_per_day` real NOT NULL,
	`max_nutrition_per_day` real NOT NULL,
	`queue_timeout` real NOT NULL,
	`flow_lpm` real NOT NULL,
	`nutrient_profile_id` text,
	`nutrient_units` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routines`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`nutrient_profile_id`) REFERENCES `nutrient_profiles`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "routine_versions_reviewed_bool" CHECK("routine_versions"."reviewed" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routine_versions_gh_id` ON `routine_versions` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `routines` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`policy` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routines_gh_id` ON `routines` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `run_evidence` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`before` text NOT NULL,
	`after` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `automation_runs`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `run_step_devices` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `run_steps`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`value`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `run_steps` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`label` text NOT NULL,
	`action` text NOT NULL,
	`duration` real NOT NULL,
	`zone_id` text,
	`status` text NOT NULL,
	`started_at` real,
	`finished_at` real,
	`reason` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `automation_runs`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`lot_id` text NOT NULL,
	`grade` text NOT NULL,
	`kg` real NOT NULL,
	`price` real NOT NULL,
	`date` text NOT NULL,
	`due_on` text NOT NULL,
	`buyer` text NOT NULL,
	`status` text NOT NULL,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `production_cycles`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`lot_id`) REFERENCES `harvest_lots`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_gh_id` ON `sales` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `savings_baselines` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`version` real NOT NULL,
	`source` text NOT NULL,
	`period` text NOT NULL,
	`days` real NOT NULL,
	`area` real NOT NULL,
	`crop` text NOT NULL,
	`phase` text NOT NULL,
	`normalized_daily` integer NOT NULL,
	`applied_on` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "savings_baselines_normalized_daily_bool" CHECK("savings_baselines"."normalized_daily" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `savings_baselines_gh_id` ON `savings_baselines` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `schedule_times` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_schedules`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `schedule_weekdays` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`value` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `routine_schedules`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sensor_episodes` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`map_key` text NOT NULL,
	`active_since` real,
	`latched` integer NOT NULL,
	`sequence` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "sensor_episodes_latched_bool" CHECK("sensor_episodes"."latched" in (0, 1))
);
--> statement-breakpoint
CREATE TABLE `sensor_readings` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`device_id` text NOT NULL,
	`metric` text NOT NULL,
	`value` real,
	`unit` text NOT NULL,
	`captured_at` text NOT NULL,
	`provenance` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sensor_readings_gh_id` ON `sensor_readings` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `solar_configuration` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`enabled` integer NOT NULL,
	`panel_count` real NOT NULL,
	`panel_watts` real NOT NULL,
	`inverter_kw` real NOT NULL,
	`sun_hours` real NOT NULL,
	`performance_ratio` real NOT NULL,
	`tariff` real NOT NULL,
	`investment` real,
	`maintenance_monthly` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "solar_configuration_enabled_bool" CHECK("solar_configuration"."enabled" in (0, 1))
);
--> statement-breakpoint
CREATE TABLE `supply_items` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`category` text NOT NULL,
	`reorder_at` real NOT NULL,
	`device_id` text NOT NULL,
	`auto_task` integer NOT NULL,
	`operator` text NOT NULL,
	`active` integer NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `supply_register`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "supply_items_auto_task_bool" CHECK("supply_items"."auto_task" in (0, 1)),
	CONSTRAINT "supply_items_active_bool" CHECK("supply_items"."active" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `supply_items_gh_id` ON `supply_items` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `supply_movements` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`item_id` text NOT NULL,
	`kind` text NOT NULL,
	`quantity` real NOT NULL,
	`date` text NOT NULL,
	`notes` text NOT NULL,
	`actor` text NOT NULL,
	`key` text NOT NULL,
	`expense_id` text,
	`run_id` text,
	`maintenance_id` text,
	`reverses` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `supply_register`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`item_id`) REFERENCES `supply_items`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`expense_id`) REFERENCES `expenses`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`run_id`) REFERENCES `automation_runs`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`maintenance_id`) REFERENCES `maintenance_tickets`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`reverses`) REFERENCES `supply_movements`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `supply_movements_gh_id` ON `supply_movements` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `supply_register` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`version` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `target_limits` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`map_key` text NOT NULL,
	`min` real NOT NULL,
	`max` real NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `target_revisions`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `target_revisions` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`batch_id` text NOT NULL,
	`zone_id` text NOT NULL,
	`crop` text NOT NULL,
	`variety` text NOT NULL,
	`stage` text NOT NULL,
	`version` real NOT NULL,
	`notes` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`status` text NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `crop_targets`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`batch_id`) REFERENCES `planting_batches`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gh`,`zone_id`) REFERENCES `zones`(`gh`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `target_revisions_gh_id` ON `target_revisions` (`gh`,`id`);--> statement-breakpoint
CREATE TABLE `workspace_commits` (
	`revision` integer PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`body_hash` text NOT NULL,
	`actor` text NOT NULL,
	`operation` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_commits_request_id_unique` ON `workspace_commits` (`request_id`);--> statement-breakpoint
CREATE TABLE `workspace_meta` (
	`id` integer PRIMARY KEY NOT NULL,
	`next_greenhouse_number` integer NOT NULL,
	`seed_version` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`area` real NOT NULL,
	`validated` integer NOT NULL,
	`temperature` real NOT NULL,
	`humidity` real NOT NULL,
	`capacity` real,
	`beds` real,
	`method` text,
	`notes` text,
	`status` text,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `greenhouse_state`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "zones_validated_bool" CHECK("zones"."validated" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `zones_gh_id` ON `zones` (`gh`,`id`);