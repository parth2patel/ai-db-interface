CREATE TABLE IF NOT EXISTS "DefaultDBConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host" varchar(128) NOT NULL,
	"dbName" varchar(64) NOT NULL,
	"dbUserName" varchar(64) NOT NULL,
	"port" integer NOT NULL,
	"password" varchar(64)
);
