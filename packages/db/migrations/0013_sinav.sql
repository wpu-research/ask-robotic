CREATE TABLE "exam_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"student_no" text NOT NULL,
	"student_name" text NOT NULL,
	"token_hash" text NOT NULL,
	"allow_relogin" boolean DEFAULT false NOT NULL,
	"project_id" text NOT NULL,
	"mcq" jsonb NOT NULL,
	"definition_id" text NOT NULL,
	"answers" jsonb NOT NULL,
	"circuit" jsonb,
	"code" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deadline_at" timestamp with time zone NOT NULL,
	"saved_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"flags" jsonb NOT NULL,
	"grade_status" text DEFAULT 'pending' NOT NULL,
	"mcq_score" integer,
	"project_score" integer,
	"project_grade" jsonb,
	"definition_score" integer,
	"teacher_note" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"duration_min" integer DEFAULT 90 NOT NULL,
	"config" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_session_id_exam_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exam_attempts_session_student" ON "exam_attempts" USING btree ("session_id","student_no");--> statement-breakpoint
CREATE INDEX "exam_attempts_token" ON "exam_attempts" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_sessions_code" ON "exam_sessions" USING btree ("code");