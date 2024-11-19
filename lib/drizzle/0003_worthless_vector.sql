CREATE TABLE IF NOT EXISTS "ExternalDBConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host" varchar(128) NOT NULL,
	"dbName" varchar(64) NOT NULL,
	"dbUserName" varchar(64) NOT NULL,
	"port" integer NOT NULL,
	"password" varchar(64),
	"userId" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ExternalDBConfig" ADD CONSTRAINT "ExternalDBConfig_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
