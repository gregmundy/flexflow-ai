CREATE TABLE "onboarding_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid,
	"email" text,
	"phone_number" text,
	"session_id" text,
	"fitness_areas" jsonb NOT NULL,
	"exercise_frequency" text NOT NULL,
	"exercise_intensity" text NOT NULL,
	"experience_level" text NOT NULL,
	"workout_duration" integer NOT NULL,
	"available_equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"workout_types" jsonb NOT NULL,
	"preferred_days" jsonb NOT NULL,
	"preferred_time" text NOT NULL,
	"sms_reminder_timing" text NOT NULL,
	"sms_consent" boolean DEFAULT false NOT NULL,
	"movements_to_avoid" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"selected_trainer" text NOT NULL,
	"health_disclaimer" boolean DEFAULT false NOT NULL,
	"privacy_consent" boolean DEFAULT false NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"user_profile_id" uuid
);
--> statement-breakpoint
ALTER TABLE "onboarding_data" ADD CONSTRAINT "onboarding_data_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;