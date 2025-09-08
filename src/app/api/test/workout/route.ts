import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { DEMO_USER_ID, ensureDemoUserExists } from '@/lib/database/seed-demo-user';

export async function POST(request: NextRequest) {
  try {
    // Ensure demo user exists
    const demoUser = await ensureDemoUserExists();
    if (!demoUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create demo user' },
        { status: 500 }
      );
    }

    // Get test parameters from request body or use defaults
    const body = await request.json().catch(() => ({}));
    
    const testData = {
      userId: DEMO_USER_ID,
      coachId: body.coachId || 'MAX',
      workoutType: body.workoutType || 'strength',
      duration: body.duration || 30,
      equipment: body.equipment || ['dumbbells', 'bench'],
      fitnessLevel: body.fitnessLevel || 'INTERMEDIATE',
      preferences: body.preferences || {
        intensity: 'moderate',
        variety: 'balanced',
        restTime: 'standard',
      },
    };

    console.log('Sending workout generation event with data:', testData);

    // Send event to Inngest for processing
    const eventResult = await inngest.send({
      name: 'workout/generate',
      data: testData,
    });

    return NextResponse.json({
      success: true,
      message: 'Test workout generation initiated successfully',
      eventId: eventResult.ids[0],
      demoUserId: DEMO_USER_ID,
      testData,
    });
  } catch (error) {
    console.error('Test workout generation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate test workout generation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return demo user info and test instructions
    const demoUser = await ensureDemoUserExists();
    
    return NextResponse.json({
      success: true,
      message: 'FlexFlow AI Workout Generator Test Endpoint',
      demoUserId: DEMO_USER_ID,
      demoUserExists: !!demoUser,
      instructions: {
        test: 'POST to this endpoint to trigger a test workout generation',
        example: {
          method: 'POST',
          body: {
            coachId: 'MAX', // or 'SAGE', 'KAI', etc.
            workoutType: 'strength', // or 'bodyweight', 'cardio', etc.
            duration: 30,
            equipment: ['dumbbells', 'bench'],
            fitnessLevel: 'INTERMEDIATE',
            preferences: {
              intensity: 'moderate',
              variety: 'balanced',
              restTime: 'standard'
            }
          }
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get test endpoint info',
      },
      { status: 500 }
    );
  }
}