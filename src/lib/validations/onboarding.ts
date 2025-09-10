import { z } from 'zod';

// Experience levels
export const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

// Fitness areas (Step 2)
export const fitnessAreasSchema = z.array(z.string()).min(1, 'Select at least one fitness area');

// Activity level (Step 3)
export const exerciseFrequencySchema = z.string().min(1, 'Exercise frequency is required');
export const exerciseIntensitySchema = z.string().min(1, 'Exercise intensity is required');

// Workout preferences (Step 5)
export const workoutDurationSchema = z.number().min(10, 'Minimum workout duration is 10 minutes').max(240, 'Maximum workout duration is 4 hours');
export const availableEquipmentSchema = z.array(z.string()).default([]);
export const workoutTypesSchema = z.array(z.string()).min(1, 'Select at least one workout type');

// Schedule preferences (Step 6)
export const preferredDaysSchema = z.array(z.string()).min(1, 'Select at least one preferred day');
export const preferredTimeSchema = z.string().min(1, 'Preferred time is required');
export const smsReminderTimingSchema = z.string().min(1, 'SMS reminder timing is required');

// Movement preferences (Step 7)
export const movementsToAvoidSchema = z.array(z.string()).default([]);

// Trainer selection (Step 8)
export const selectedTrainerSchema = z.string().min(1, 'Trainer selection is required');

// Compliance fields
export const booleanConsentSchema = z.boolean().refine(val => val === true, 'Consent is required');

// Main onboarding data schema
export const onboardingDataSchema = z.object({
  // Step 2: Fitness Focus Areas
  fitnessAreas: fitnessAreasSchema,
  
  // Step 3: Activity Level
  exerciseFrequency: exerciseFrequencySchema,
  exerciseIntensity: exerciseIntensitySchema,
  
  // Step 4: Experience Level
  experienceLevel: experienceLevelSchema,
  
  // Step 5: Workout Preferences
  workoutDuration: workoutDurationSchema,
  availableEquipment: availableEquipmentSchema,
  workoutTypes: workoutTypesSchema,
  
  // Step 6: Schedule Preferences
  preferredDays: preferredDaysSchema,
  preferredTime: preferredTimeSchema,
  smsReminderTiming: smsReminderTimingSchema,
  smsConsent: z.boolean(),
  
  // Step 7: Movement Preferences
  movementsToAvoid: movementsToAvoidSchema,
  
  // Step 8: Trainer Selection
  selectedTrainer: selectedTrainerSchema,
  
  // Compliance
  healthDisclaimer: booleanConsentSchema,
  privacyConsent: booleanConsentSchema,
  
  // Optional user identification (for non-authenticated users)
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
});

// Partial schema for updates
export const onboardingDataUpdateSchema = onboardingDataSchema.partial().extend({
  userId: z.string().uuid(), // Required for updates
});

// Schema for creating user profile from onboarding data
export const createUserProfileSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  name: z.string().optional(),
  
  // Map onboarding data to user profile fields
  fitnessLevel: experienceLevelSchema.transform(level => level.toUpperCase()),
  primaryGoals: z.array(z.string()),
  availableEquipment: z.array(z.string()),
  preferredWorkoutDuration: z.number(),
  workoutFrequency: z.string().transform(freq => {
    // Convert string frequency to number
    const frequencyMap: Record<string, number> = {
      '1-2 times per week': 2,
      '3-4 times per week': 4,
      '5-6 times per week': 6,
      'Daily': 7,
    };
    return frequencyMap[freq] || 3;
  }),
  availableTimeSlots: z.array(z.string()),
  preferredCoach: z.string().transform(coach => coach.toUpperCase()),
  preferredWorkoutTypes: z.array(z.string()),
  injuriesLimitations: z.string().optional(),
});

// Export types
export type OnboardingData = z.infer<typeof onboardingDataSchema>;
export type OnboardingDataUpdate = z.infer<typeof onboardingDataUpdateSchema>;
export type CreateUserProfile = z.infer<typeof createUserProfileSchema>;

// Validation helper functions
export const validateOnboardingData = (data: unknown) => {
  return onboardingDataSchema.safeParse(data);
};

export const validateOnboardingUpdate = (data: unknown) => {
  return onboardingDataUpdateSchema.safeParse(data);
};

// Transform onboarding data to user profile data
export const transformOnboardingToProfile = (onboardingData: OnboardingData) => {
  return createUserProfileSchema.parse({
    email: onboardingData.email,
    phoneNumber: onboardingData.phoneNumber,
    fitnessLevel: onboardingData.experienceLevel,
    primaryGoals: onboardingData.fitnessAreas,
    availableEquipment: onboardingData.availableEquipment,
    preferredWorkoutDuration: onboardingData.workoutDuration,
    workoutFrequency: onboardingData.exerciseFrequency,
    availableTimeSlots: onboardingData.preferredDays,
    preferredCoach: onboardingData.selectedTrainer,
    preferredWorkoutTypes: onboardingData.workoutTypes,
    injuriesLimitations: onboardingData.movementsToAvoid.join(', ') || undefined,
  });
};

// AI prompt generation helpers
export const generateAIPromptData = (onboardingData: OnboardingData) => {
  return {
    fitnessLevel: onboardingData.experienceLevel,
    goals: onboardingData.fitnessAreas.join(', '),
    frequency: onboardingData.exerciseFrequency,
    intensity: onboardingData.exerciseIntensity,
    duration: `${onboardingData.workoutDuration} minutes`,
    equipment: onboardingData.availableEquipment.join(', ') || 'bodyweight only',
    workoutTypes: onboardingData.workoutTypes.join(', '),
    schedule: `${onboardingData.preferredDays.join(', ')} at ${onboardingData.preferredTime}`,
    avoidMovements: onboardingData.movementsToAvoid.join(', ') || 'none',
    trainerStyle: onboardingData.selectedTrainer,
  };
};