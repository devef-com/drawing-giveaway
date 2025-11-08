CREATE TABLE "number_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"drawing_id" varchar(255) NOT NULL,
	"number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"participant_id" integer,
	"reserved_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "number_slots" ADD CONSTRAINT "number_slots_drawing_id_drawings_id_fk" FOREIGN KEY ("drawing_id") REFERENCES "public"."drawings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "number_slots" ADD CONSTRAINT "number_slots_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE set null ON UPDATE no action;