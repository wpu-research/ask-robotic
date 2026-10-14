CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" text NOT NULL,
	"period" text NOT NULL,
	"provider" text NOT NULL,
	"provider_ref" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'TRY' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"subscription_id" uuid,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_messages" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tutor_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid,
	"device_id" text,
	"lesson_id" integer,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"flag" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "login_secret_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "game" jsonb;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_messages" ADD CONSTRAINT "tutor_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_messages" ADD CONSTRAINT "tutor_messages_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_ref" ON "payments" USING btree ("provider","provider_ref");--> statement-breakpoint
CREATE INDEX "payments_user" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tutor_user_at" ON "tutor_messages" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "tutor_device_at" ON "tutor_messages" USING btree ("device_id","created_at");--> statement-breakpoint
CREATE INDEX "tutor_lesson" ON "tutor_messages" USING btree ("lesson_id");