import {
  pgTable,
  pgEnum,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  jsonb,
  decimal,
  varchar,
  uuid,
} from 'drizzle-orm/pg-core';

// Enums
export const fitnessLevelEnum = pgEnum('fitness_level', ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export const fitnessGoalEnum = pgEnum('fitness_goal', [
  'STRENGTH',
  'CARDIO',
  'FLEXIBILITY',
  'WEIGHT_LOSS',
  'MUSCLE_GAIN',
  'GENERAL_FITNESS',
]);
export const workoutTypeEnum = pgEnum('workout_type', [
  'STRENGTH',
  'BODYWEIGHT',
  'FLEXIBILITY',
  'MOBILITY',
  'CARDIO',
  'HIIT',
]);
export const coachPersonalityEnum = pgEnum('coach_personality', [
  'MAX',
  'SAGE',
  'KAI',
  'ZARA',
  'ACE',
  'NOVA',
  'BLAZE',
  'RILEY',
  'MARCO',
]);
export const workoutStatusEnum = pgEnum('workout_status', [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'SKIPPED',
]);

// User Profiles table
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

  // User Information
  name: text('name'),
  email: text('email').unique(),
  phoneNumber: text('phone_number').unique(),

  // Fitness Profile
  fitnessLevel: fitnessLevelEnum('fitness_level').notNull().default('BEGINNER'),
  primaryGoals: jsonb('primary_goals').$type<string[]>().notNull().default([]),
  secondaryGoals: jsonb('secondary_goals').$type<string[]>().notNull().default([]),

  // Equipment Availability
  availableEquipment: jsonb('available_equipment').$type<string[]>().notNull().default([]),

  // Time Constraints
  preferredWorkoutDuration: integer('preferred_workout_duration').notNull().default(30), // minutes
  workoutFrequency: integer('workout_frequency').notNull().default(3), // workouts per week
  availableTimeSlots: jsonb('available_time_slots').$type<string[]>().notNull().default([]),

  // Coach Preferences
  preferredCoach: coachPersonalityEnum('preferred_coach').notNull().default('MAX'),
  alternativeCoaches: jsonb('alternative_coaches').$type<string[]>().notNull().default([]),

  // Personal Preferences
  injuriesLimitations: text('injuries_limitations'),
  motivationalStyle: text('motivational_style'),
  preferredWorkoutTypes: jsonb('preferred_workout_types').$type<string[]>().notNull().default([]),

  // Progress Tracking
  currentWeight: decimal('current_weight', { precision: 5, scale: 2 }),
  targetWeight: decimal('target_weight', { precision: 5, scale: 2 }),
  heightCm: decimal('height_cm', { precision: 5, scale: 2 }),
});

// User Preferences table
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }).unique(),

  // AI Generation Preferences
  workoutIntensityPreference: text('workout_intensity_preference').notNull().default('moderate'), // low, moderate, high
  exerciseVarietyPreference: text('exercise_variety_preference').notNull().default('balanced'), // repetitive, balanced, high_variety
  restTimePreferences: text('rest_time_preferences').notNull().default('standard'), // short, standard, extended

  // Notification Preferences
  enableDailyReminders: boolean('enable_daily_reminders').notNull().default(true),
  enableProgressNotifications: boolean('enable_progress_notifications').notNull().default(true),
  reminderTime: text('reminder_time'), // HH:MM format

  // Custom Instructions
  customInstructions: text('custom_instructions'),
  avoidExercises: jsonb('avoid_exercises').$type<string[]>().notNull().default([]),
  favoriteExercises: jsonb('favorite_exercises').$type<string[]>().notNull().default([]),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Workout Plans table
export const workoutPlans = pgTable('workout_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

  // Plan Metadata
  name: text('name').notNull(),
  description: text('description'),
  estimatedDuration: integer('estimated_duration').notNull(), // minutes
  targetMuscleGroups: jsonb('target_muscle_groups').$type<string[]>().notNull().default([]),
  workoutType: workoutTypeEnum('workout_type').notNull(),
  difficultyLevel: fitnessLevelEnum('difficulty_level').notNull(),

  // AI Generation Info
  generatedByAI: boolean('generated_by_ai').notNull().default(false),
  aiModel: text('ai_model'), // e.g., "claude-3-sonnet", "gpt-4"
  generationPrompt: text('generation_prompt'), // Store the prompt used
  coachPersonality: coachPersonalityEnum('coach_personality'),

  // Template Data (JSON matching Exercise[] interface from current system)
  exercisesData: jsonb('exercises_data').notNull(), // Store as JSON

  // Relationships
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfiles.id),
});

// Individual Workout Sessions table
export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

  // Workout Metadata
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: workoutStatusEnum('status').notNull().default('SCHEDULED'),

  // Plan Reference
  workoutPlanId: uuid('workout_plan_id').notNull().references(() => workoutPlans.id),
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfiles.id),

  // Workout Execution Data
  actualDuration: integer('actual_duration'), // minutes
  exercisesCompleted: integer('exercises_completed').notNull().default(0),
  totalExercises: integer('total_exercises').notNull().default(0),

  // Progress Data (JSON matching ExerciseProgress interface)
  exerciseProgress: jsonb('exercise_progress'), // Store as JSON
});

// Individual Set Data table
export const workoutSets = pgTable('workout_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  // Set Metadata
  exerciseId: integer('exercise_id').notNull(), // References exercise ID from JSON
  exerciseName: text('exercise_name').notNull(),
  setNumber: integer('set_number').notNull(),

  // Performance Data
  reps: integer('reps').notNull(),
  weight: decimal('weight', { precision: 6, scale: 2 }),
  weightUnit: text('weight_unit'), // 'lbs' or 'kg'
  difficulty: integer('difficulty').notNull(), // 1-5 scale
  restTime: integer('rest_time'), // actual rest time taken

  // Set Status
  isExtra: boolean('is_extra').notNull().default(false), // Extra sets beyond planned
  isSubstituted: boolean('is_substituted').notNull().default(false),
  substitutedWith: text('substituted_with'), // Original exercise name if substituted

  // Relationships
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
});

// Workout Feedback table
export const workoutFeedback = pgTable('workout_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  // Feedback Data
  overallRating: integer('overall_rating').notNull(), // 1-5 scale
  energyLevel: integer('energy_level').notNull(), // 1-5 scale
  comments: text('comments'),

  // Detailed Feedback
  difficultyFeedback: text('difficulty_feedback'), // "too_easy", "just_right", "too_hard"
  lengthFeedback: text('length_feedback'), // "too_short", "just_right", "too_long"
  enjoymentRating: integer('enjoyment_rating'), // 1-5 scale

  // Exercise-Specific Feedback (JSON)
  exerciseFeedback: jsonb('exercise_feedback'), // JSON object with exercise-specific ratings

  // Relationships
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }).unique(),
  userProfileId: uuid('user_profile_id').notNull().references(() => userProfiles.id),
});

// Coach Messages/Motivational Content table
export const coachMessages = pgTable('coach_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  // Message Metadata
  coach: coachPersonalityEnum('coach').notNull(),
  messageType: text('message_type').notNull(), // "motivation", "instruction", "feedback", "celebration"
  context: text('context').notNull(), // "pre_workout", "during_set", "rest", "post_workout"

  // Message Content
  title: text('title'),
  message: text('message').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),

  // Usage Tracking
  usageCount: integer('usage_count').notNull().default(0),
  lastUsed: timestamp('last_used', { withTimezone: true }),
});

// Onboarding Data table
export const onboardingData = pgTable('onboarding_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

  // User identification (can be anonymous initially)
  userId: uuid('user_id'), // Optional - for authenticated users
  email: text('email'),
  phoneNumber: text('phone_number'),
  sessionId: text('session_id'), // For tracking anonymous users

  // Step 2: Fitness Focus Areas
  fitnessAreas: jsonb('fitness_areas').$type<string[]>().notNull(),
  
  // Step 3: Activity Level
  exerciseFrequency: text('exercise_frequency').notNull(),
  exerciseIntensity: text('exercise_intensity').notNull(),
  
  // Step 4: Experience Level
  experienceLevel: text('experience_level').notNull(), // 'beginner', 'intermediate', 'advanced'
  
  // Step 5: Workout Preferences
  workoutDuration: integer('workout_duration').notNull(), // minutes
  availableEquipment: jsonb('available_equipment').$type<string[]>().notNull().default([]),
  workoutTypes: jsonb('workout_types').$type<string[]>().notNull(),
  
  // Step 6: Schedule Preferences
  preferredDays: jsonb('preferred_days').$type<string[]>().notNull(),
  preferredTime: text('preferred_time').notNull(),
  smsReminderTiming: text('sms_reminder_timing').notNull(),
  smsConsent: boolean('sms_consent').notNull().default(false),
  
  // Step 7: Movement Preferences
  movementsToAvoid: jsonb('movements_to_avoid').$type<string[]>().notNull().default([]),
  
  // Step 8: Trainer Selection
  selectedTrainer: text('selected_trainer').notNull(),
  
  // Compliance
  healthDisclaimer: boolean('health_disclaimer').notNull().default(false),
  privacyConsent: boolean('privacy_consent').notNull().default(false),

  // Processing Status
  isProcessed: boolean('is_processed').notNull().default(false), // Whether user profile was created
  userProfileId: uuid('user_profile_id').references(() => userProfiles.id),
});

// AI Generation Logs table (for monitoring and improvement)
export const aiGenerationLogs = pgTable('ai_generation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

  // Request Details
  requestType: text('request_type').notNull(), // "workout_generation", "adaptation", "motivation"
  userId: uuid('user_id'),
  coachPersonality: coachPersonalityEnum('coach_personality'),

  // AI Provider Info
  aiProvider: text('ai_provider').notNull(), // "anthropic", "openai"
  model: text('model').notNull(), // "claude-3-sonnet", "gpt-4"

  // Request/Response Data
  requestPrompt: text('request_prompt').notNull(),
  responseContent: text('response_content'),

  // Performance Metrics
  tokenUsage: integer('token_usage'),
  responseTimeMs: integer('response_time_ms'),
  success: boolean('success').notNull().default(false),
  errorMessage: text('error_message'),

  // Validation Results
  schemaValidation: boolean('schema_validation').notNull().default(false),
  exerciseCount: integer('exercise_count'),
  fallbackUsed: boolean('fallback_used').notNull().default(false),
});

// Exercise Templates table (for AI reference)
export const exerciseTemplates = pgTable('exercise_templates', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

  // Exercise Data
  name: text('name').notNull(),
  category: text('category').notNull(), // "strength", "cardio", "flexibility", "mobility"
  muscleGroups: jsonb('muscle_groups').$type<string[]>().notNull().default([]),
  equipment: jsonb('equipment').$type<string[]>().notNull().default([]),
  difficultyLevel: fitnessLevelEnum('difficulty_level').notNull(),

  // Exercise Instructions
  instructions: text('instructions').notNull(),
  tips: text('tips'),
  modifications: jsonb('modifications').$type<string[]>().notNull().default([]),
  alternativeExercises: jsonb('alternative_exercises').$type<string[]>().notNull().default([]),

  // Performance Metrics
  hasWeight: boolean('has_weight').notNull().default(false),
  defaultSets: integer('default_sets').notNull().default(3),
  defaultRepsMin: integer('default_reps_min').notNull().default(8),
  defaultRepsMax: integer('default_reps_max').notNull().default(12),
  defaultRestTime: integer('default_rest_time').notNull().default(60), // seconds

  // Usage Tracking
  timesUsed: integer('times_used').notNull().default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
});

// Type exports for better TypeScript support
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type OnboardingData = typeof onboardingData.$inferSelect;
export type NewOnboardingData = typeof onboardingData.$inferInsert;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type NewWorkoutPlan = typeof workoutPlans.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type NewWorkoutSet = typeof workoutSets.$inferInsert;
export type WorkoutFeedback = typeof workoutFeedback.$inferSelect;
export type NewWorkoutFeedback = typeof workoutFeedback.$inferInsert;
export type CoachMessage = typeof coachMessages.$inferSelect;
export type NewCoachMessage = typeof coachMessages.$inferInsert;
export type AIGenerationLog = typeof aiGenerationLogs.$inferSelect;
export type NewAIGenerationLog = typeof aiGenerationLogs.$inferInsert;
export type ExerciseTemplate = typeof exerciseTemplates.$inferSelect;
export type NewExerciseTemplate = typeof exerciseTemplates.$inferInsert;

// Compatibility types matching the existing system
export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  instructions: string;
  hasWeight: boolean;
  targetWeight?: number;
  weightUnit?: 'lbs' | 'kg';
  alternativeExercises?: string[];
}

export interface SetData {
  setNumber: number;
  weight: number;
  reps: number;
  difficulty: number;
  isExtra?: boolean;
}

export interface ExerciseProgress {
  exerciseId: number;
  completedSets: SetData[];
  plannedSets: number;
  isSubstituted?: boolean;
  substitutedWith?: string;
  status: 'not-started' | 'in-progress' | 'completed';
}