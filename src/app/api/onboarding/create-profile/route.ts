import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService, RateLimiter, handleDatabaseError } from '@/lib/services/onboarding';
import { headers } from 'next/headers';
import { z } from 'zod';

// Enable runtime edge for better performance
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createProfileSchema = z.object({
  onboardingId: z.string().uuid('Invalid onboarding ID format'),
});

/**
 * POST /api/onboarding/create-profile
 * Create user profile from onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    if (!RateLimiter.isAllowed(`create-profile-${clientIp}`, 3, 60000)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many profile creation requests. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    const validation = createProfileSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid onboarding ID provided',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { onboardingId } = validation.data;

    try {
      // Create user profile from onboarding data
      const result = await OnboardingService.createUserProfileFromOnboarding(onboardingId);

      // Return success with profile data
      return NextResponse.json({
        success: true,
        data: {
          userProfile: {
            id: result.userProfile.id,
            email: result.userProfile.email,
            phoneNumber: result.userProfile.phoneNumber,
            fitnessLevel: result.userProfile.fitnessLevel,
            primaryGoals: result.userProfile.primaryGoals,
            preferredCoach: result.userProfile.preferredCoach,
            createdAt: result.userProfile.createdAt,
          },
          preferences: {
            id: result.preferences.id,
            workoutIntensityPreference: result.preferences.workoutIntensityPreference,
            reminderTime: result.preferences.reminderTime,
            enableDailyReminders: result.preferences.enableDailyReminders,
          },
          message: 'User profile created successfully',
        },
      }, { status: 201 });

    } catch (serviceError: any) {
      console.error('Profile creation service error:', serviceError);
      
      if (serviceError.message === 'Onboarding data not found') {
        return NextResponse.json(
          {
            error: 'Not found',
            message: 'Onboarding data not found',
          },
          { status: 404 }
        );
      }

      if (serviceError.message.includes('already exists')) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'User profile already exists for this onboarding data',
          },
          { status: 409 }
        );
      }

      throw serviceError; // Re-throw for general error handling
    }

  } catch (error: any) {
    console.error('Create profile API error:', error);
    
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
 * OPTIONS /api/onboarding/create-profile
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id',
      'Access-Control-Max-Age': '86400',
    },
  });
}