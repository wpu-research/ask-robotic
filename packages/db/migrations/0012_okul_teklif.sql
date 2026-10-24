CREATE TABLE "school_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"school" text NOT NULL,
	"city" text NOT NULL,
	"levels" jsonb NOT NULL,
	"students" integer,
	"contact_name" text NOT NULL,
	"contact_role" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"note" text,
	"consent_kvkk" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "school_leads_kvkk" CHECK ("school_leads"."consent_kvkk")
);
--> statement-breakpoint
CREATE INDEX "school_leads_brand_created" ON "school_leads" USING btree ("brand","created_at");