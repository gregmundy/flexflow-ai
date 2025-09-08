CREATE TYPE "public"."coach_personality" AS ENUM('MAX', 'SAGE', 'KAI', 'ZARA', 'ACE', 'NOVA', 'BLAZE', 'RILEY', 'MARCO');--> statement-breakpoint
CREATE TYPE "public"."fitness_goal" AS ENUM('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'WEIGHT_LOSS', 'MUSCLE_GAIN', 'GENERAL_FITNESS');--> statement-breakpoint
CREATE TYPE "public"."fitness_level" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED');--> statement-breakpoint
CREATE TYPE "public"."workout_status" AS ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');--> statement-breakpoint
CREATE TYPE "public"."workout_type" AS ENUM('STRENGTH', 'BODYWEIGHT', 'FLEXIBILITY', 'MOBILITY', 'CARDIO', 'HIIT');--> statement-breakpoint
CREATE TABLE "ai_generation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_type" text NOT NULL,
	"user_id" uuid,
	"coach_personality" "coach_personality",
	"ai_provider" text NOT NULL,
	"model" text NOT NULL,
	"request_prompt" text NOT NULL,
	"response_content" text,
	"token_usage" integer,
	"response_time_ms" integer,
	"success" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"schema_validation" boolean DEFAULT false NOT NULL,
	"exercise_count" integer,
	"fallback_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"coach" "coach_personality" NOT NULL,
	"message_type" text NOT NULL,
	"context" text NOT NULL,
	"title" text,
	"message" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "exercise_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"muscle_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty_level" "fitness_level" NOT NULL,
	"instructions" text NOT NULL,
	"tips" text,
	"modifications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"alternative_exercises" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"has_weight" boolean DEFAULT false NOT NULL,
	"default_sets" integer DEFAULT 3 NOT NULL,
	"default_reps_min" integer DEFAULT 8 NOT NULL,
	"default_reps_max" integer DEFAULT 12 NOT NULL,
	"default_rest_time" integer DEFAULT 60 NOT NULL,
	"times_used" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2)
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"workout_intensity_preference" text DEFAULT 'moderate' NOT NULL,
	"exercise_variety_preference" text DEFAULT 'balanced' NOT NULL,
	"rest_time_preferences" text DEFAULT 'standard' NOT NULL,
	"enable_daily_reminders" boolean DEFAULT true NOT NULL,
	"enable_progress_notifications" boolean DEFAULT true NOT NULL,
	"reminder_time" text,
	"custom_instructions" text,
	"avoid_exercises" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"favorite_exercises" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_profile_id_unique" UNIQUE("user_profile_id")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text,
	"email" text,
	"phone_number" text,
	"fitness_level" "fitness_level" DEFAULT 'BEGINNER' NOT NULL,
	"primary_goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"secondary_goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"available_equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_workout_duration" integer DEFAULT 30 NOT NULL,
	"workout_frequency" integer DEFAULT 3 NOT NULL,
	"available_time_slots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_coach" "coach_personality" DEFAULT 'MAX' NOT NULL,
	"alternative_coaches" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"injuries_limitations" text,
	"motivational_style" text,
	"preferred_workout_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"current_weight" numeric(5, 2),
	"target_weight" numeric(5, 2),
	"height_cm" numeric(5, 2),
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "user_profiles_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "workout_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"overall_rating" integer NOT NULL,
	"energy_level" integer NOT NULL,
	"comments" text,
	"difficulty_feedback" text,
	"length_feedback" text,
	"enjoyment_rating" integer,
	"exercise_feedback" jsonb,
	"workout_id" uuid NOT NULL,
	"user_profile_id" uuid NOT NULL,
	CONSTRAINT "workout_feedback_workout_id_unique" UNIQUE("workout_id")
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"estimated_duration" integer NOT NULL,
	"target_muscle_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"workout_type" "workout_type" NOT NULL,
	"difficulty_level" "fitness_level" NOT NULL,
	"generated_by_ai" boolean DEFAULT false NOT NULL,
	"ai_model" text,
	"generation_prompt" text,
	"coach_personality" "coach_personality",
	"exercises_data" jsonb NOT NULL,
	"user_profile_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exercise_id" integer NOT NULL,
	"exercise_name" text NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer NOT NULL,
	"weight" numeric(6, 2),
	"weight_unit" text,
	"difficulty" integer NOT NULL,
	"rest_time" integer,
	"is_extra" boolean DEFAULT false NOT NULL,
	"is_substituted" boolean DEFAULT false NOT NULL,
	"substituted_with" text,
	"workout_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"status" "workout_status" DEFAULT 'SCHEDULED' NOT NULL,
	"workout_plan_id" uuid NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"actual_duration" integer,
	"exercises_completed" integer DEFAULT 0 NOT NULL,
	"total_exercises" integer DEFAULT 0 NOT NULL,
	"exercise_progress" jsonb
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_feedback" ADD CONSTRAINT "workout_feedback_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_feedback" ADD CONSTRAINT "workout_feedback_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;