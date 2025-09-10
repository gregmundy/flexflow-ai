import { NextRequest, NextResponse } from 'next/server';
import { validateOnboardingData } from '@/lib/validations/onboarding';
import { OnboardingService, RateLimiter, handleDatabaseError } from '@/lib/services/onboarding';
import { headers } from 'next/headers';

// Enable runtime edge for better performance
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/onboarding
 * Save user onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    if (!RateLimiter.isAllowed(`onboarding-post-${clientIp}`, 10, 60000)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many onboarding submissions. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Validate using Zod schema
    const validation = validateOnboardingData(body);
    
    if (!validation.success) {
      console.log('Validation errors:', validation.error.errors);
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

    // Get session ID from headers or generate one
    const sessionId = headersList.get('x-session-id') || undefined;

    // Save onboarding data
    const result = await OnboardingService.saveOnboardingData(validation.data, sessionId);

    // If user wants to create profile immediately (has userId or email)
    let userProfile = null;
    if (validation.data.userId || validation.data.email) {
      try {
        const profileResult = await OnboardingService.createUserProfileFromOnboarding(result.id);
        userProfile = {
          id: profileResult.userProfile.id,
          email: profileResult.userProfile.email,
          fitnessLevel: profileResult.userProfile.fitnessLevel,
        };
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the onboarding save if profile creation fails
      }
    }

    // Generate AI prompt data for immediate use
    const aiPromptData = OnboardingService.generateWorkoutPrompt(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          onboardingId: result.id,
          userId: result.userId,
          userProfile,
          aiPromptData,
          message: 'Onboarding data saved successfully',
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Onboarding API error:', error);
    
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
 * GET /api/onboarding?sessionId=xxx or ?userId=xxx
 * Retrieve onboarding data by session ID or user ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId && !userId) {
      return NextResponse.json(
        {
          error: 'Missing parameter',
          message: 'Either sessionId or userId is required',
        },
        { status: 400 }
      );
    }

    // Rate limiting
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    if (!RateLimiter.isAllowed(`onboarding-get-${clientIp}`, 30, 60000)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many requests. Please try again later.' 
        },
        { status: 429 }
      );
    }

    const data = await OnboardingService.getOnboardingData(userId || undefined, sessionId || undefined);

    if (!data) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Onboarding data not found',
        },
        { status: 404 }
      );
    }

    // Don't expose sensitive internal fields
    const {
      id,
      createdAt,
      updatedAt,
      userId: dataUserId,
      email,
      phoneNumber,
      fitnessAreas,
      exerciseFrequency,
      exerciseIntensity,
      experienceLevel,
      workoutDuration,
      availableEquipment,
      workoutTypes,
      preferredDays,
      preferredTime,
      smsReminderTiming,
      smsConsent,
      movementsToAvoid,
      selectedTrainer,
      isProcessed,
      userProfileId,
    } = data;

    return NextResponse.json({
      success: true,
      data: {
        id,
        createdAt,
        updatedAt,
        userId: dataUserId,
        email,
        phoneNumber,
        fitnessAreas,
        exerciseFrequency,
        exerciseIntensity,
        experienceLevel,
        workoutDuration,
        availableEquipment,
        workoutTypes,
        preferredDays,
        preferredTime,
        smsReminderTiming,
        smsConsent,
        movementsToAvoid,
        selectedTrainer,
        isProcessed,
        userProfileId,
      },
    });

  } catch (error: any) {
    console.error('Get onboarding API error:', error);
    
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
 * OPTIONS /api/onboarding
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
      'Access-Control-Max-Age': '86400',
    },
  });
}