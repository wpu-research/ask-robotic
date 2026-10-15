CREATE TABLE "skill_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" text NOT NULL,
	"score" integer NOT NULL,
	"finish_ms" integer,
	"program" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skill_runs" ADD CONSTRAINT "skill_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "skill_runs_challenge_user" ON "skill_runs" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "skill_runs_user_at" ON "skill_runs" USING btree ("user_id","created_at");