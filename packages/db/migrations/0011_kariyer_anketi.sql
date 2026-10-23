CREATE TABLE "career_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"answers" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"locale" text DEFAULT 'tr' NOT NULL,
	"consent_kvkk" boolean NOT NULL,
	"consent_contact" boolean DEFAULT false NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "career_surveys_kvkk" CHECK ("career_surveys"."consent_kvkk")
);
--> statement-breakpoint
ALTER TABLE "career_surveys" ADD CONSTRAINT "career_surveys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "career_surveys_created" ON "career_surveys" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "career_surveys_email" ON "career_surveys" USING btree ("email");