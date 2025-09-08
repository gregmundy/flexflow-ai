import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { inngest } from '@/inngest/client';

// Request validation schema
const workoutFeedbackSchema = z.object({
  userId: z.string().uuid(),
  workoutId: z.string().uuid(),
  feedback: z.object({
    overallRating: z.number().min(1).max(5),
    energyLevel: z.number().min(1).max(5),
    difficulty: z.enum(['too_easy', 'just_right', 'too_hard']),
    enjoyment: z.number().min(1).max(5),
    comments: z.string().optional(),
  }),
  performance: z.object({
    completedSets: z.number().min(0),
    totalSets: z.number().min(1),
    exerciseFeedback: z.record(z.string(), z.any()).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = workoutFeedbackSchema.parse(body);
    
    // Send event to Inngest for processing
    const eventResult = await inngest.send({
      name: 'workout/adapt',
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      message: 'Workout adaptation initiated based on your feedback',
      eventId: eventResult.ids[0],
      data: {
        userId: validatedData.userId,
        workoutId: validatedData.workoutId,
        overallRating: validatedData.feedback.overallRating,
        completionRate: (validatedData.performance.completedSets / validatedData.performance.totalSets * 100).toFixed(1),
      },
    });
  } catch (error) {
    console.error('Workout feedback API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid feedback data',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process workout feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}