import { db, onboardingData, userProfiles, userPreferences } from '@/db';
import { eq, and } from 'drizzle-orm';
import type { NewOnboardingData } from '@/db/schema';
import type { OnboardingData } from '@/lib/validations/onboarding';
import { transformOnboardingToProfile, generateAIPromptData } from '@/lib/validations/onboarding';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing onboarding data and user profile creation
 */
export class OnboardingService {
  /**
   * Save onboarding data to database
   */
  static async saveOnboardingData(data: OnboardingData, sessionId?: string): Promise<{ id: string; userId?: string }> {
    try {
      // Create onboarding record
      const onboardingRecord: NewOnboardingData = {
        userId: data.userId || null,
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        sessionId: sessionId || uuidv4(),
        
        fitnessAreas: data.fitnessAreas,
        exerciseFrequency: data.exerciseFrequency,
        exerciseIntensity: data.exerciseIntensity,
        experienceLevel: data.experienceLevel,
        workoutDuration: data.workoutDuration,
        availableEquipment: data.availableEquipment,
        workoutTypes: data.workoutTypes,
        preferredDays: data.preferredDays,
        preferredTime: data.preferredTime,
        smsReminderTiming: data.smsReminderTiming,
        smsConsent: data.smsConsent,
        movementsToAvoid: data.movementsToAvoid,
        selectedTrainer: data.selectedTrainer,
        healthDisclaimer: data.healthDisclaimer,
        privacyConsent: data.privacyConsent,
        
        isProcessed: false,
      };

      const [savedRecord] = await db
        .insert(onboardingData)
        .values(onboardingRecord)
        .returning();

      return { id: savedRecord.id, userId: savedRecord.userId || undefined };
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw new Error('Failed to save onboarding data');
    }
  }

  /**
   * Retrieve onboarding data by user ID or session ID
   */
  static async getOnboardingData(userId?: string, sessionId?: string) {
    try {
      if (!userId && !sessionId) {
        throw new Error('Either userId or sessionId is required');
      }

      const conditions = [];
      if (userId) {
        conditions.push(eq(onboardingData.userId, userId));
      }
      if (sessionId) {
        conditions.push(eq(onboardingData.sessionId, sessionId));
      }

      const records = await db
        .select()
        .from(onboardingData)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .orderBy(onboardingData.createdAt);

      return records[0] || null;
    } catch (error) {
      console.error('Error retrieving onboarding data:', error);
      throw new Error('Failed to retrieve onboarding data');
    }
  }

  /**
   * Update existing onboarding data
   */
  static async updateOnboardingData(id: string, updates: Partial<OnboardingData>) {
    try {
      const updateData: Partial<NewOnboardingData> = {
        ...updates,
        updatedAt: new Date(),
      };

      const [updatedRecord] = await db
        .update(onboardingData)
        .set(updateData)
        .where(eq(onboardingData.id, id))
        .returning();

      return updatedRecord;
    } catch (error) {
      console.error('Error updating onboarding data:', error);
      throw new Error('Failed to update onboarding data');
    }
  }

  /**
   * Create user profile and preferences from onboarding data
   */
  static async createUserProfileFromOnboarding(onboardingId: string) {
    try {
      // Get onboarding data
      const onboardingRecord = await db
        .select()
        .from(onboardingData)
        .where(eq(onboardingData.id, onboardingId))
        .limit(1);

      if (!onboardingRecord.length) {
        throw new Error('Onboarding data not found');
      }

      const data = onboardingRecord[0];

      // Convert database record to OnboardingData format
      const onboardingDataFormatted: OnboardingData = {
        fitnessAreas: data.fitnessAreas,
        exerciseFrequency: data.exerciseFrequency,
        exerciseIntensity: data.exerciseIntensity,
        experienceLevel: data.experienceLevel as 'beginner' | 'intermediate' | 'advanced',
        workoutDuration: data.workoutDuration,
        availableEquipment: data.availableEquipment,
        workoutTypes: data.workoutTypes,
        preferredDays: data.preferredDays,
        preferredTime: data.preferredTime,
        smsReminderTiming: data.smsReminderTiming,
        smsConsent: data.smsConsent,
        movementsToAvoid: data.movementsToAvoid,
        selectedTrainer: data.selectedTrainer,
        healthDisclaimer: data.healthDisclaimer,
        privacyConsent: data.privacyConsent,
        userId: data.userId || undefined,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber || undefined,
      };

      // Transform to profile format
      const profileData = transformOnboardingToProfile(onboardingDataFormatted);

      // Create user profile
      const [userProfile] = await db
        .insert(userProfiles)
        .values({
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          fitnessLevel: profileData.fitnessLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
          primaryGoals: profileData.primaryGoals,
          availableEquipment: profileData.availableEquipment,
          preferredWorkoutDuration: profileData.preferredWorkoutDuration,
          workoutFrequency: profileData.workoutFrequency,
          availableTimeSlots: profileData.availableTimeSlots,
          preferredCoach: profileData.preferredCoach as 'MAX' | 'SAGE' | 'KAI' | 'ZARA' | 'ACE' | 'NOVA' | 'BLAZE' | 'RILEY' | 'MARCO',
          preferredWorkoutTypes: profileData.preferredWorkoutTypes,
          injuriesLimitations: profileData.injuriesLimitations,
        })
        .returning();

      // Create user preferences
      const [preferences] = await db
        .insert(userPreferences)
        .values({
          userProfileId: userProfile.id,
          workoutIntensityPreference: onboardingDataFormatted.exerciseIntensity.toLowerCase(),
          reminderTime: onboardingDataFormatted.preferredTime,
          enableDailyReminders: onboardingDataFormatted.smsConsent,
          avoidExercises: onboardingDataFormatted.movementsToAvoid,
          customInstructions: `Created from onboarding flow. Trainer preference: ${onboardingDataFormatted.selectedTrainer}`,
        })
        .returning();

      // Mark onboarding as processed
      await db
        .update(onboardingData)
        .set({
          isProcessed: true,
          userProfileId: userProfile.id,
          updatedAt: new Date(),
        })
        .where(eq(onboardingData.id, onboardingId));

      return { userProfile, preferences };
    } catch (error) {
      console.error('Error creating user profile from onboarding:', error);
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Generate AI prompt data from onboarding information
   */
  static generateWorkoutPrompt(data: OnboardingData): string {
    const promptData = generateAIPromptData(data);
    
    return `Create a personalized workout plan with the following user preferences:

Fitness Level: ${promptData.fitnessLevel}
Primary Goals: ${promptData.goals}
Exercise Frequency: ${promptData.frequency}
Exercise Intensity: ${promptData.intensity}
Workout Duration: ${promptData.duration}
Available Equipment: ${promptData.equipment}
Preferred Workout Types: ${promptData.workoutTypes}
Schedule: ${promptData.schedule}
Movements to Avoid: ${promptData.avoidMovements}
Trainer Style Preference: ${promptData.trainerStyle}

Please generate a comprehensive workout plan that matches these preferences and includes:
- Appropriate warm-up exercises
- Main workout exercises with sets, reps, and rest periods
- Cool-down and stretching
- Exercise modifications for different fitness levels
- Safety considerations based on limitations`;
  }

  /**
   * Generate trainer personality prompt
   */
  static generateTrainerPrompt(trainerName: string, context: 'motivation' | 'instruction' | 'feedback'): string {
    const trainerPersonalities: Record<string, string> = {
      MAX: 'high-energy, motivational, uses military-style encouragement',
      SAGE: 'calm, wise, focuses on form and mindfulness',
      KAI: 'enthusiastic surfer, uses beach/ocean metaphors',
      ZARA: 'empowering, strong, focuses on inner strength',
      ACE: 'competitive athlete, performance-focused',
      NOVA: 'futuristic, science-based approach',
      BLAZE: 'intense, fiery motivation',
      RILEY: 'friendly, approachable, like a best friend',
      MARCO: 'experienced coach, technical expertise',
    };

    const personality = trainerPersonalities[trainerName.toUpperCase()] || 'supportive and encouraging';
    
    const contextPrompts = {
      motivation: `Generate a motivational message in the style of ${trainerName}, who is ${personality}. The message should inspire the user to start their workout.`,
      instruction: `Provide exercise instructions in the style of ${trainerName}, who is ${personality}. Focus on clear, helpful guidance.`,
      feedback: `Give encouraging feedback in the style of ${trainerName}, who is ${personality}. Celebrate progress and provide constructive guidance.`,
    };

    return contextPrompts[context];
  }

  /**
   * Get onboarding completion rate for analytics
   */
  static async getOnboardingStats() {
    try {
      const [totalRecords] = await db
        .select({
          total: db.$count(onboardingData, undefined),
        })
        .from(onboardingData);

      const [processedRecords] = await db
        .select({
          processed: db.$count(onboardingData, eq(onboardingData.isProcessed, true)),
        })
        .from(onboardingData);

      return {
        total: totalRecords?.total || 0,
        processed: processedRecords?.processed || 0,
        completionRate: totalRecords?.total ? (processedRecords?.processed || 0) / totalRecords.total : 0,
      };
    } catch (error) {
      console.error('Error getting onboarding stats:', error);
      return { total: 0, processed: 0, completionRate: 0 };
    }
  }
}

/**
 * Rate limiting helper for onboarding endpoints
 */
export class RateLimiter {
  private static requests: Map<string, { count: number; resetTime: number }> = new Map();

  static isAllowed(identifier: string, maxRequests = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  static getRemainingRequests(identifier: string, maxRequests = 5): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - record.count);
  }
}

/**
 * Error handling helpers
 */
export const handleDatabaseError = (error: any) => {
  console.error('Database error:', error);
  
  if (error.code === '23505') { // Unique constraint violation
    return { status: 409, message: 'Data already exists' };
  }
  
  if (error.code === '23503') { // Foreign key violation
    return { status: 400, message: 'Invalid reference data' };
  }
  
  if (error.code === '23502') { // Not null violation
    return { status: 400, message: 'Required field missing' };
  }
  
  return { status: 500, message: 'Internal server error' };
};