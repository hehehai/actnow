ALTER TABLE "user" ADD COLUMN "polar_customer_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_plan" text DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_status" text DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_cycle" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "social_links" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_polar_customer_id_unique" UNIQUE("polar_customer_id");
