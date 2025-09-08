import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { inngest } from '@/inngest/client';

// Request validation schema
const generateWorkoutSchema = z.object({
  userId: z.string().uuid(),
  coachId: z.enum(['MAX', 'SAGE', 'KAI', 'ZARA', 'ACE', 'NOVA', 'BLAZE', 'RILEY', 'MARCO']),
  workoutType: z.enum(['strength', 'bodyweight', 'flexibility', 'mobility', 'cardio', 'hiit']).optional(),
  duration: z.number().min(10).max(120).optional(),
  equipment: z.array(z.string()).optional(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  preferences: z.object({
    intensity: z.enum(['low', 'moderate', 'high']).optional(),
    variety: z.enum(['repetitive', 'balanced', 'high_variety']).optional(),
    restTime: z.enum(['short', 'standard', 'extended']).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = generateWorkoutSchema.parse(body);
    
    // Send event to Inngest for processing
    const eventResult = await inngest.send({
      name: 'workout/generate',
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      message: 'Workout generation initiated',
      eventId: eventResult.ids[0],
      data: {
        userId: validatedData.userId,
        coachId: validatedData.coachId,
        workoutType: validatedData.workoutType || 'strength',
        estimatedDuration: validatedData.duration || 30,
      },
    });
  } catch (error) {
    console.error('Workout generation API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate workout generation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check generation status or retrieve generated workouts
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
    
    // Here you could query the database for recent workout plans
    // For now, return a simple response
    return NextResponse.json({
      success: true,
      message: 'Use POST to generate new workouts',
      userId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
      },
      { status: 500 }
    );
  }
}