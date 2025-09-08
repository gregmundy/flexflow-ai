import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';
import { z } from 'zod';

/**
 * API route for triggering AgentKit-powered workout generation
 * 
 * This endpoint triggers the new AgentKit multi-agent workout generation system,
 * which uses specialized trainer agents for each of our 9 fitness coaches.
 */

const WorkoutGenerationRequest = z.object({
  userId: z.string().uuid(),
  coachId: z.enum(['MAX', 'SAGE', 'ZARA', 'ACE', 'KAI', 'NOVA', 'BLAZE', 'RILEY', 'MARCO']),
  workoutType: z.enum(['strength', 'bodyweight', 'flexibility', 'mobility', 'cardio', 'hiit']).default('strength'),
  duration: z.number().min(10).max(120).default(30),
  equipment: z.array(z.string()).default([]),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  preferences: z.object({
    intensity: z.enum(['low', 'moderate', 'high']).optional(),
    variety: z.enum(['minimal', 'balanced', 'high']).optional(),
    restTime: z.enum(['short', 'standard', 'long']).optional(),
  }).default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validatedData = WorkoutGenerationRequest.parse(body);
    
    console.log('🤖 Triggering AgentKit workout generation:', {
      userId: validatedData.userId,
      coachId: validatedData.coachId,
      workoutType: validatedData.workoutType,
      duration: validatedData.duration,
    });
    
    // Trigger the AgentKit workout generation function
    const eventId = await inngest.send({
      name: 'workout/generate-agentkit',
      data: validatedData,
    });
    
    return NextResponse.json({
      success: true,
      message: `AgentKit workout generation started with ${validatedData.coachId} trainer agent`,
      eventId: eventId.ids[0],
      trainerAgent: `${validatedData.coachId}_trainer`,
      estimatedDuration: `${validatedData.duration} minutes`,
      workoutType: validatedData.workoutType,
      agentKitPowered: true,
    });
    
  } catch (error) {
    console.error('AgentKit workout generation API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger AgentKit workout generation',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AgentKit Workout Generation API',
    version: '1.0.0',
    availableTrainers: [
      'MAX - Intense powerhouse coach',
      'SAGE - Mindful wisdom guide', 
      'ZARA - Energetic dynamo',
      'ACE - Supportive friend',
      'KAI - Competitive warrior',
      'NOVA - Creative innovator', 
      'BLAZE - High-intensity rocket',
      'RILEY - Balanced guide',
      'MARCO - Precision strategist',
    ],
    supportedWorkoutTypes: ['strength', 'bodyweight', 'flexibility', 'mobility', 'cardio', 'hiit'],
    agentKitPowered: true,
    endpoint: 'POST /api/workouts/generate-agentkit',
  });
}