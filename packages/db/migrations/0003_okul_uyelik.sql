CREATE TYPE "public"."class_role" AS ENUM('teacher', 'student');--> statement-breakpoint
CREATE TYPE "public"."login_mode" AS ENUM('email', 'qr', 'picture');--> statement-breakpoint
CREATE TYPE "public"."org_kind" AS ENUM('school', 'district', 'company');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('owner', 'admin', 'teacher', 'student', 'parent');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'expired');--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"lesson_id" integer,
	"module_id" integer,
	"week_id" integer,
	"due_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignments_tek_hedef" CHECK (num_nonnulls("assignments"."lesson_id", "assignments"."module_id", "assignments"."week_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "campuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_members" (
	"class_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "class_role" DEFAULT 'student' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"campus_id" uuid,
	"name" text NOT NULL,
	"grade_level" integer,
	"join_code" text NOT NULL,
	"teacher_id" uuid,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classes_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"device_id" text,
	"kind" text NOT NULL,
	"granted" boolean NOT NULL,
	"granted_by" uuid,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consents_sahip" CHECK ("consents"."user_id" IS NOT NULL OR "consents"."device_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "guardian_links" (
	"parent_user_id" uuid NOT NULL,
	"student_user_id" uuid NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan_id" text DEFAULT 'school' NOT NULL,
	"seats" integer NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"scope" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "licenses_koltuk" CHECK ("licenses"."seats" >= 0)
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "org_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"kind" "org_kind" DEFAULT 'school' NOT NULL,
	"country" text DEFAULT 'TR' NOT NULL,
	"locale" text DEFAULT 'tr' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"seat_limit" integer,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_members" (
	"subscription_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" text NOT NULL,
	"status" "subscription_status" NOT NULL,
	"provider" text,
	"provider_ref" text,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "xp_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"source" text NOT NULL,
	"lesson_id" integer,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "steps" jsonb;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "started_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locale" text DEFAULT 'tr' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_year" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "login_mode" "login_mode" DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_week_id_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_members" ADD CONSTRAINT "class_members_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_members" ADD CONSTRAINT "class_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardian_links" ADD CONSTRAINT "guardian_links_parent_user_id_users_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardian_links" ADD CONSTRAINT "guardian_links_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_members" ADD CONSTRAINT "subscription_members_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_members" ADD CONSTRAINT "subscription_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignments_class_due" ON "assignments" USING btree ("class_id","due_at");--> statement-breakpoint
CREATE INDEX "campuses_org" ON "campuses" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "class_members_pk" ON "class_members" USING btree ("class_id","user_id");--> statement-breakpoint
CREATE INDEX "class_members_user" ON "class_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "classes_org" ON "classes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "classes_teacher" ON "classes" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "consents_user_kind_at" ON "consents" USING btree ("user_id","kind","at");--> statement-breakpoint
CREATE INDEX "consents_device_kind_at" ON "consents" USING btree ("device_id","kind","at");--> statement-breakpoint
CREATE UNIQUE INDEX "guardian_links_pk" ON "guardian_links" USING btree ("parent_user_id","student_user_id");--> statement-breakpoint
CREATE INDEX "guardian_links_student" ON "guardian_links" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "licenses_org_ends" ON "licenses" USING btree ("organization_id","ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_pk" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organization_members_user" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_members_pk" ON "subscription_members" USING btree ("subscription_id","user_id");--> statement-breakpoint
CREATE INDEX "subscription_members_user" ON "subscription_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_provider_ref" ON "subscriptions" USING btree ("provider","provider_ref");--> statement-breakpoint
CREATE INDEX "xp_events_user_at" ON "xp_events" USING btree ("user_id","at");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_kimlik" CHECK ("users"."email" IS NOT NULL OR "users"."username" IS NOT NULL);--> statement-breakpoint
-- Varsayılan planlar (elle eklendi; abonelik/lisans FK'leri bu satırlara bağlı). Özellik adları: apps/web/src/lib/entitlements.ts
INSERT INTO "plans" ("id", "name", "seat_limit", "features") VALUES
	('free', 'Ücretsiz', NULL, '[]'::jsonb),
	('premium', 'Premium', 1, '["unlimited_lessons","ai_tutor","personal_practice","no_ads"]'::jsonb),
	('family', 'Aile', 5, '["unlimited_lessons","ai_tutor","personal_practice","no_ads"]'::jsonb),
	('school', 'Okul', NULL, '["unlimited_lessons","ai_tutor","personal_practice","no_ads","class_leagues"]'::jsonb)
ON CONFLICT ("id") DO NOTHING;
