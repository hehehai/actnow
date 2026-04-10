CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`polar_customer_id` text,
	`subscription_plan` text DEFAULT 'FREE' NOT NULL,
	`subscription_status` text DEFAULT 'FREE' NOT NULL,
	`subscription_cycle` text,
	`subscription_current_period_end` integer,
	`subscription_updated_at` integer,
	`bio` text,
	`social_links` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`role` text DEFAULT 'USER',
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_polar_customer_id_unique` ON `user` (`polar_customer_id`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `event_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`user_id` text,
	`target_id` text,
	`target_type` text,
	`metadata` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `event_logs_type_created_at_idx` ON `event_logs` (`event_type`,`created_at`);--> statement-breakpoint
CREATE INDEX `event_logs_target_idx` ON `event_logs` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `event_logs_user_created_at_idx` ON `event_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text(200) NOT NULL,
	`content` text,
	`snapshots` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`reply_content` text,
	`replied_at` integer,
	`created_by_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feedbacks_created_by_idx` ON `feedbacks` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `feedbacks_status_idx` ON `feedbacks` (`status`);--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_likes_user_post_unique` ON `post_likes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `post_likes_post_id_idx` ON `post_likes` (`post_id`);--> statement-breakpoint
CREATE INDEX `post_likes_user_id_idx` ON `post_likes` (`user_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text DEFAULT '' NOT NULL,
	`comment` text NOT NULL,
	`media` text DEFAULT '[]' NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`created_by_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_tags_post_id_idx` ON `post_tags` (`post_id`);--> statement-breakpoint
CREATE INDEX `post_tags_tag_id_idx` ON `post_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`value` text(100) NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`tip_media` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)) NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `tags_type_idx` ON `tags` (`type`);--> statement-breakpoint
CREATE INDEX `tags_name_idx` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_value_type_unique` ON `tags` (`value`,`type`) WHERE "tags"."deleted_at" IS NULL;