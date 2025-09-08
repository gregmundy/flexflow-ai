import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { userProfiles, userPreferences, type NewUserProfile, type NewUserPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Request validation schema
const createUserProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  primaryGoals: z.array(z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'WEIGHT_LOSS', 'MUSCLE_GAIN', 'GENERAL_FITNESS'])).default([]),
  secondaryGoals: z.array(z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'WEIGHT_LOSS', 'MUSCLE_GAIN', 'GENERAL_FITNESS'])).default([]),
  availableEquipment: z.array(z.string()).default([]),
  preferredWorkoutDuration: z.number().min(10).max(120).default(30),
  workoutFrequency: z.number().min(1).max(7).default(3),
  availableTimeSlots: z.array(z.string()).default([]),
  preferredCoach: z.enum(['MAX', 'SAGE', 'KAI', 'ZARA', 'ACE', 'NOVA', 'BLAZE', 'RILEY', 'MARCO']).default('MAX'),
  alternativeCoaches: z.array(z.enum(['MAX', 'SAGE', 'KAI', 'ZARA', 'ACE', 'NOVA', 'BLAZE', 'RILEY', 'MARCO'])).default([]),
  injuriesLimitations: z.string().optional(),
  motivationalStyle: z.string().optional(),
  preferredWorkoutTypes: z.array(z.enum(['STRENGTH', 'BODYWEIGHT', 'FLEXIBILITY', 'MOBILITY', 'CARDIO', 'HIIT'])).default([]),
  currentWeight: z.number().optional(),
  targetWeight: z.number().optional(),
  heightCm: z.number().optional(),
  preferences: z.object({
    workoutIntensityPreference: z.enum(['low', 'moderate', 'high']).default('moderate'),
    exerciseVarietyPreference: z.enum(['repetitive', 'balanced', 'high_variety']).default('balanced'),
    restTimePreferences: z.enum(['short', 'standard', 'extended']).default('standard'),
    enableDailyReminders: z.boolean().default(true),
    enableProgressNotifications: z.boolean().default(true),
    reminderTime: z.string().optional(),
    customInstructions: z.string().optional(),
    avoidExercises: z.array(z.string()).default([]),
    favoriteExercises: z.array(z.string()).default([]),
  }).optional(),
});

const updateUserProfileSchema = createUserProfileSchema.partial();

// CREATE new user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserProfileSchema.parse(body);
    
    // Separate preferences from main profile data
    const { preferences, ...profileData } = validatedData;
    
    // Create user profile - convert numbers to strings for decimal fields
    const profileInsertData: NewUserProfile = {
      ...profileData,
      primaryGoals: profileData.primaryGoals,
      secondaryGoals: profileData.secondaryGoals,
      availableEquipment: profileData.availableEquipment,
      availableTimeSlots: profileData.availableTimeSlots,
      alternativeCoaches: profileData.alternativeCoaches,
      preferredWorkoutTypes: profileData.preferredWorkoutTypes,
      currentWeight: profileData.currentWeight?.toString(),
      targetWeight: profileData.targetWeight?.toString(),
      heightCm: profileData.heightCm?.toString(),
    };
    
    const [newProfile] = await db.insert(userProfiles).values(profileInsertData).returning();
    
    // Create user preferences if provided
    let newPreferences = null;
    if (preferences) {
      const preferencesInsertData: NewUserPreferences = {
        userProfileId: newProfile.id,
        ...preferences,
        avoidExercises: preferences.avoidExercises,
        favoriteExercises: preferences.favoriteExercises,
      };
      
      const [insertedPrefs] = await db.insert(userPreferences).values(preferencesInsertData).returning();
      newPreferences = insertedPrefs;
    }
    
    return NextResponse.json({
      success: true,
      message: 'User profile created successfully',
      data: {
        profile: newProfile,
        preferences: newPreferences,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create user profile API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid profile data',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter required' },
        { status: 400 }
      );
    }
    
    // Validate userId format
    if (!z.string().uuid().safeParse(userId).success) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId format' },
        { status: 400 }
      );
    }
    
    // Fetch user profile
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);
    
    if (!profile[0]) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // Fetch user preferences
    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userProfileId, userId))
      .limit(1);
    
    return NextResponse.json({
      success: true,
      data: {
        profile: profile[0],
        preferences: preferences[0] || null,
      },
    });
    
  } catch (error) {
    console.error('Get user profile API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// UPDATE user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const { userId, preferences, ...profileUpdates } = body;
    const validatedData = updateUserProfileSchema.parse(profileUpdates);
    
    // Update user profile if there are profile updates
    let updatedProfile = null;
    if (Object.keys(validatedData).length > 0) {
      const profileUpdateData = {
        ...validatedData,
        updatedAt: new Date(),
        currentWeight: validatedData.currentWeight?.toString(),
        targetWeight: validatedData.targetWeight?.toString(),
        heightCm: validatedData.heightCm?.toString(),
      };
      
      const [updated] = await db
        .update(userProfiles)
        .set(profileUpdateData)
        .where(eq(userProfiles.id, userId))
        .returning();
        
      updatedProfile = updated;
    }
    
    // Update preferences if provided
    let updatedPreferences = null;
    if (preferences) {
      const preferencesUpdateData = {
        ...preferences,
        updatedAt: new Date(),
      };
      
      // Try to update first, if no rows affected, insert new preferences
      const existingPrefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userProfileId, userId))
        .limit(1);
      
      if (existingPrefs[0]) {
        const [updated] = await db
          .update(userPreferences)
          .set(preferencesUpdateData)
          .where(eq(userPreferences.userProfileId, userId))
          .returning();
        updatedPreferences = updated;
      } else {
        const [inserted] = await db
          .insert(userPreferences)
          .values({
            userProfileId: userId,
            ...preferences,
          })
          .returning();
        updatedPreferences = inserted;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        profile: updatedProfile,
        preferences: updatedPreferences,
      },
    });
    
  } catch (error) {
    console.error('Update user profile API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid update data',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}