PRAGMA defer_foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_evidence_reviews` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`after_id` text NOT NULL,
	`verdict` text NOT NULL,
	`notes` text NOT NULL,
	`actor` text NOT NULL,
	`at` text NOT NULL,
	`key` text NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `run_evidence`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_evidence_reviews`("gh", "record_key", "ordinal", "parent_key", "id", "after_id", "verdict", "notes", "actor", "at", "key") SELECT "gh", "record_key", "ordinal", "parent_key", "id", "after_id", "verdict", "notes", "actor", "at", "key" FROM `evidence_reviews`;--> statement-breakpoint
DROP TABLE `evidence_reviews`;--> statement-breakpoint
ALTER TABLE `__new_evidence_reviews` RENAME TO `evidence_reviews`;--> statement-breakpoint
PRAGMA defer_foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_supply_items` (
	`gh` text NOT NULL,
	`record_key` text NOT NULL,
	`ordinal` integer NOT NULL,
	`parent_key` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`category` text NOT NULL,
	`reorder_at` real NOT NULL,
	`device_id` text,
	`auto_task` integer NOT NULL,
	`operator` text NOT NULL,
	`active` integer NOT NULL,
	PRIMARY KEY(`gh`, `record_key`),
	FOREIGN KEY (`gh`,`parent_key`) REFERENCES `supply_register`(`gh`,`record_key`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gh`,`device_id`) REFERENCES `devices`(`gh`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "supply_items_auto_task_bool" CHECK("__new_supply_items"."auto_task" in (0, 1)),
	CONSTRAINT "supply_items_active_bool" CHECK("__new_supply_items"."active" in (0, 1))
);
--> statement-breakpoint
INSERT INTO `__new_supply_items`("gh", "record_key", "ordinal", "parent_key", "id", "name", "unit", "category", "reorder_at", "device_id", "auto_task", "operator", "active") SELECT "gh", "record_key", "ordinal", "parent_key", "id", "name", "unit", "category", "reorder_at", "device_id", "auto_task", "operator", "active" FROM `supply_items`;--> statement-breakpoint
DROP TABLE `supply_items`;--> statement-breakpoint
ALTER TABLE `__new_supply_items` RENAME TO `supply_items`;--> statement-breakpoint
CREATE UNIQUE INDEX `supply_items_gh_id` ON `supply_items` (`gh`,`id`);