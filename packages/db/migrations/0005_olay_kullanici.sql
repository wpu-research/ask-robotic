ALTER TABLE "events" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_user_ts" ON "events" USING btree ("user_id","ts");