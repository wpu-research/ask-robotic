CREATE TABLE "events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"device_id" text NOT NULL,
	"type" text NOT NULL,
	"lesson_id" integer,
	"payload" jsonb,
	"ts" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "explainer_md" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "concepts" jsonb;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "quiz" jsonb;--> statement-breakpoint
ALTER TABLE "weeks" ADD COLUMN "guide_md" text;--> statement-breakpoint
CREATE INDEX "events_device_ts" ON "events" USING btree ("device_id","ts");--> statement-breakpoint
CREATE INDEX "events_type_ts" ON "events" USING btree ("type","ts");