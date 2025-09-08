import { db } from '@/db';
import { userProfiles, userPreferences, type NewUserProfile, type NewUserPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const DEMO_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.id, DEMO_USER_ID))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('Demo user already exists');
      return existingUser[0];
    }

    // Create demo user profile
    const demoProfile: NewUserProfile = {
      id: DEMO_USER_ID,
      name: 'Demo User',
      email: 'demo@flexflow.ai',
      fitnessLevel: 'INTERMEDIATE',
      primaryGoals: ['STRENGTH', 'MUSCLE_GAIN'],
      secondaryGoals: ['GENERAL_FITNESS'],
      availableEquipment: ['dumbbells', 'barbell', 'bench', 'pull-up bar'],
      preferredWorkoutDuration: 45,
      workoutFrequency: 4,
      availableTimeSlots: ['morning', 'evening'],
      preferredCoach: 'MAX',
      alternativeCoaches: ['SAGE', 'ACE'],
      injuriesLimitations: 'None',
      motivationalStyle: 'High energy with positive reinforcement',
      preferredWorkoutTypes: ['STRENGTH', 'BODYWEIGHT'],
      currentWeight: '180.0',
      targetWeight: '190.0',
      heightCm: '178.0',
    };

    const createdProfile = await db.insert(userProfiles).values(demoProfile).returning();

    // Create demo user preferences
    const demoPreferences: NewUserPreferences = {
      userProfileId: DEMO_USER_ID,
      workoutIntensityPreference: 'moderate',
      exerciseVarietyPreference: 'balanced',
      restTimePreferences: 'standard',
      enableDailyReminders: true,
      enableProgressNotifications: true,
      reminderTime: '07:00',
      customInstructions: 'Focus on compound movements and progressive overload',
      avoidExercises: ['burpees'],
      favoriteExercises: ['deadlifts', 'squats', 'bench press'],
    };

    await db.insert(userPreferences).values(demoPreferences);

    console.log('Demo user created successfully');
    return createdProfile[0];
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
}

export async function ensureDemoUserExists() {
  try {
    return await createDemoUser();
  } catch (error) {
    console.error('Failed to ensure demo user exists:', error);
    return null;
  }
}