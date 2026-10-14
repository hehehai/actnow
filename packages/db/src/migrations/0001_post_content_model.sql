ALTER TABLE `posts` ADD `title` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `cover` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `content` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `published_at` integer;--> statement-breakpoint
UPDATE `posts` SET
  `title` = `comment`,
  `description` = '',
  `content` = CASE WHEN `prompt` = '' THEN `comment` ELSE `prompt` END,
  `cover` = json_extract(`media`, '$[0]'),
  `status` = CASE WHEN `is_public` = 1 THEN 'published' ELSE 'draft' END,
  `published_at` = CASE WHEN `is_public` = 1 THEN `created_at` ELSE NULL END;
