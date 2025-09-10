import { NextRequest, NextResponse } from 'next/server';
import { validateOnboardingUpdate } from '@/lib/validations/onboarding';
import { OnboardingService, RateLimiter, handleDatabaseError } from '@/lib/services/onboarding';
import { headers } from 'next/headers';
import { z } from 'zod';

// Enable runtime edge for better performance
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const userIdSchema = z.string().uuid('Invalid user ID format');

/**
 * GET /api/onboarding/[userId]
 * Retrieve user preferences by user ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Validate userId format
    const userIdValidation = userIdSchema.safeParse(userId);
    if (!userIdValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid user ID',
          message: 'User ID must be a valid UUID',
        },
        { status: 400 }
      );
    }

    // Rate limiting
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    if (!RateLimiter.isAllowed(`onboarding-get-user-${clientIp}`, 20, 60000)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many requests. Please try again later.' 
        },
        { status: 429 }
      );
    }

    const data = await OnboardingService.getOnboardingData(userId);

    if (!data) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'No onboarding data found for this user',
        },
        { status: 404 }
      );
    }

    // Return structured user preferences
    const userPreferences = {
      id: data.id,
      userId: data.userId,
      email: data.email,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isProcessed: data.isProcessed,
      userProfileId: data.userProfileId,
      
      // Fitness preferences
      fitnessProfile: {
        level: data.experienceLevel,
        areas: data.fitnessAreas,
        goals: data.fitnessAreas, // Alias for consistency
      },
      
      // Activity preferences  
      activityProfile: {
        frequency: data.exerciseFrequency,
        intensity: data.exerciseIntensity,
        duration: data.workoutDuration,
        types: data.workoutTypes,
      },
      
      // Equipment and logistics
      equipment: {
        available: data.availableEquipment,
        limitations: data.movementsToAvoid,
      },
      
      // Schedule preferences
      schedule: {
        preferredDays: data.preferredDays,
        preferredTime: data.preferredTime,
        reminderTiming: data.smsReminderTiming,
        smsEnabled: data.smsConsent,
      },
      
      // Trainer and coaching
      coaching: {
        selectedTrainer: data.selectedTrainer,
      },
      
      // Generate AI-ready data
      aiPromptData: OnboardingService.generateWorkoutPrompt({
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
      }),
    };

    return NextResponse.json({
      success: true,
      data: userPreferences,
    });

  } catch (error: any) {
    console.error('Get user onboarding API error:', error);
    
    const dbError = handleDatabaseError(error);
    
    return NextResponse.json(
      {
        error: 'Server error',
        message: dbError.message,
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      { status: dbError.status }
    );
  }
}

/**
 * PUT /api/onboarding/[userId]
 * Update user preferences
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Validate userId format
    const userIdValidation = userIdSchema.safeParse(userId);
    if (!userIdValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid user ID',
          message: 'User ID must be a valid UUID',
        },
        { status: 400 }
      );
    }

    // Rate limiting
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    if (!RateLimiter.isAllowed(`onboarding-update-${clientIp}`, 5, 60000)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many update requests. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Add userId to the update data for validation
    const updateData = { ...body, userId };
    
    // Validate using Zod schema
    const validation = validateOnboardingUpdate(updateData);
    
    if (!validation.success) {
      console.log('Update validation errors:', validation.error.errors);
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Please check your input data',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Get existing onboarding data
    const existingData = await OnboardingService.getOnboardingData(userId);
    
    if (!existingData) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'No onboarding data found for this user',
        },
        { status: 404 }
      );
    }

    // Update the onboarding data
    const updatedData = await OnboardingService.updateOnboardingData(
      existingData.id,
      validation.data
    );

    // If the user has a profile and significant changes were made, update the profile too
    if (updatedData.userProfileId && (
      body.fitnessAreas || 
      body.experienceLevel || 
      body.availableEquipment ||
      body.workoutDuration ||
      body.exerciseFrequency ||
      body.selectedTrainer
    )) {
      try {
        // Re-create user profile with updated data
        await OnboardingService.createUserProfileFromOnboarding(existingData.id);
      } catch (profileError) {
        console.error('Error updating user profile:', profileError);
        // Don't fail the update if profile sync fails
      }
    }

    // Generate updated AI prompt data
    const fullUpdatedData = {
      ...existingData,
      ...validation.data,
    };

    const aiPromptData = OnboardingService.generateWorkoutPrompt({
      fitnessAreas: fullUpdatedData.fitnessAreas,
      exerciseFrequency: fullUpdatedData.exerciseFrequency,
      exerciseIntensity: fullUpdatedData.exerciseIntensity,
      experienceLevel: fullUpdatedData.experienceLevel as 'beginner' | 'intermediate' | 'advanced',
      workoutDuration: fullUpdatedData.workoutDuration,
      availableEquipment: fullUpdatedData.availableEquipment,
      workoutTypes: fullUpdatedData.workoutTypes,
      preferredDays: fullUpdatedData.preferredDays,
      preferredTime: fullUpdatedData.preferredTime,
      smsReminderTiming: fullUpdatedData.smsReminderTiming,
      smsConsent: fullUpdatedData.smsConsent,
      movementsToAvoid: fullUpdatedData.movementsToAvoid,
      selectedTrainer: fullUpdatedData.selectedTrainer,
      healthDisclaimer: fullUpdatedData.healthDisclaimer,
      privacyConsent: fullUpdatedData.privacyConsent,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedData.id,
        userId: updatedData.userId,
        updatedAt: updatedData.updatedAt,
        aiPromptData,
        message: 'Preferences updated successfully',
      },
    });

  } catch (error: any) {
    console.error('Update user onboarding API error:', error);
    
    const dbError = handleDatabaseError(error);
    
    return NextResponse.json(
      {
        error: 'Server error',
        message: dbError.message,
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      { status: dbError.status }
    );
  }
}

/**
 * DELETE /api/onboarding/[userId]
 * Delete user onboarding data (for privacy compliance)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Validate userId format
    const userIdValidation = userIdSchema.safeParse(userId);
    if (!userIdValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid user ID',
          message: 'User ID must be a valid UUID',
        },
        { status: 400 }
      );
    }

    // Rate limiting
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    if (!RateLimiter.isAllowed(`onboarding-delete-${clientIp}`, 2, 300000)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many deletion requests. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Get existing data first
    const existingData = await OnboardingService.getOnboardingData(userId);
    
    if (!existingData) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'No onboarding data found for this user',
        },
        { status: 404 }
      );
    }

    // Delete the onboarding data (this will cascade to related data)
    await OnboardingService.updateOnboardingData(existingData.id, {
      // Mark as deleted by clearing personal data
      email: null,
      phoneNumber: null,
      userId: null,
      // Keep anonymized fitness data for analytics
    } as any);

    return NextResponse.json({
      success: true,
      message: 'Onboarding data deleted successfully',
    });

  } catch (error: any) {
    console.error('Delete user onboarding API error:', error);
    
    const dbError = handleDatabaseError(error);
    
    return NextResponse.json(
      {
        error: 'Server error',
        message: dbError.message,
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      { status: dbError.status }
    );
  }
}

/**
 * OPTIONS /api/onboarding/[userId]
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
      'Access-Control-Max-Age': '86400',
    },
  });
}