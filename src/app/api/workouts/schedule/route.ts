import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { inngest } from '@/inngest/client';

// Request validation schema
const scheduleWorkoutSchema = z.object({
  userId: z.string().uuid(),
  frequency: z.number().min(1).max(7).default(3), // 1-7 workouts per week
  preferredTimeSlots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).optional(), // HH:MM format
  duration: z.number().min(10).max(120).default(30),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = scheduleWorkoutSchema.parse(body);
    
    // Send event to Inngest for processing
    const eventResult = await inngest.send({
      name: 'workout/schedule',
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      message: 'Workout scheduling initiated',
      eventId: eventResult.ids[0],
      data: {
        userId: validatedData.userId,
        frequency: validatedData.frequency,
        duration: validatedData.duration,
        timeSlots: validatedData.preferredTimeSlots || [],
      },
    });
  } catch (error) {
    console.error('Workout scheduling API error:', error);
    
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
        error: 'Failed to initiate workout scheduling',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}