import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Simple AI workout generation API
 * Uses Anthropic Claude directly without AgentKit complexity
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const WorkoutGenerationRequest = z.object({
  coachId: z.enum(['MAX', 'SAGE', 'ZARA', 'ACE', 'KAI', 'NOVA', 'BLAZE', 'RILEY', 'MARCO']),
  workoutType: z.enum(['strength', 'bodyweight', 'flexibility', 'mobility', 'cardio', 'hiit']).default('strength'),
  duration: z.number().min(10).max(120).default(30),
  equipment: z.array(z.string()).default([]),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

// Trainer personalities
const trainerPersonalities = {
  MAX: "You are MAX, the intense powerhouse coach. You're all about crushing goals and pushing limits. Your catchphrase is 'WEIGHTS DON'T STAND A CHANCE!' and you love high energy, aggressive motivation. Use powerful language and show intense enthusiasm.",
  SAGE: "You are SAGE, the mindful wisdom guide. You focus on balance, mindfulness, and sustainable progress. You speak calmly and thoughtfully, emphasizing the connection between mind and body. Use gentle but encouraging language.",
  ZARA: "You are ZARA, the energetic dynamo. You're bubbly, enthusiastic, and make fitness fun! You love variety and creative movements. Use exclamation points and positive energy in your communication.",
  ACE: "You are ACE, the supportive friend. You're encouraging, understanding, and always there to help. You create a safe, non-judgmental environment and celebrate every small victory.",
  KAI: "You are KAI, the competitive warrior. You're driven by competition, data, and performance metrics. You speak with precision and focus on achievements and personal records.",
  NOVA: "You are NOVA, the creative innovator. You love trying new techniques and unique workout approaches. You're inventive and always looking for fresh ways to challenge the body.",
  BLAZE: "You are BLAZE, the high-intensity rocket. You're all about explosive power, speed, and maximum effort. You speak with urgency and love high-intensity interval training.",
  RILEY: "You are RILEY, the balanced guide. You focus on overall wellness, proper form, and sustainable habits. You speak with wisdom and emphasize long-term health.",
  MARCO: "You are MARCO, the precision strategist. You're methodical, detailed, and focused on perfect technique. You analyze every movement and optimize for maximum efficiency."
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = WorkoutGenerationRequest.parse(body);
    
    console.log('🎯 Simple AI workout generation:', {
      coachId: validatedData.coachId,
      workoutType: validatedData.workoutType,
      duration: validatedData.duration,
    });
    
    const startTime = Date.now();
    
    try {
      const systemPrompt = `${trainerPersonalities[validatedData.coachId]}

You are creating a ${validatedData.duration}-minute ${validatedData.workoutType} workout for a ${validatedData.fitnessLevel} level user.

Available equipment: ${validatedData.equipment.length > 0 ? validatedData.equipment.join(', ') : 'bodyweight only'}

IMPORTANT: You must respond with ONLY a valid JSON array of exercises in this exact format:
[
  {
    "id": 1,
    "name": "Exercise Name",
    "sets": 3,
    "reps": "8-12",
    "restTime": 90,
    "instructions": "Your coaching instructions in your personality style",
    "hasWeight": false,
    "alternativeExercises": ["Alternative 1", "Alternative 2", "Alternative 3"]
  }
]

Do not include any other text, explanations, or formatting - just the JSON array.`;

      const userPrompt = `Create a ${validatedData.duration}-minute ${validatedData.workoutType} workout with 4-6 exercises. Make sure each exercise instruction reflects your personality as ${validatedData.coachId}!`;

      console.log('🤖 Making direct Anthropic API call...');
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const endTime = Date.now();
      const content = response.content[0];
      
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI');
      }

      console.log('✅ AI response received:', content.text.substring(0, 200) + '...');
      
      // Try to parse the JSON response
      let exercises;
      try {
        exercises = JSON.parse(content.text.trim());
        
        // Validate it's an array
        if (!Array.isArray(exercises)) {
          throw new Error('Response is not an array');
        }
        
        console.log('🎉 Successfully parsed AI-generated workout with', exercises.length, 'exercises');
        
        return NextResponse.json({
          success: true,
          message: `Real AI workout generated by ${validatedData.coachId} trainer using Claude 3.5 Sonnet`,
          coachId: validatedData.coachId,
          workoutType: validatedData.workoutType,
          duration: validatedData.duration,
          exercises: exercises,
          generationTime: endTime - startTime,
          realLLM: true,
          fallbackUsed: false,
          tokenUsage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          },
        });
        
      } catch (parseError) {
        console.warn('⚠️ Failed to parse AI response as JSON:', parseError);
        console.log('Raw AI response:', content.text);
        
        // Use fallback workout but still show we got LLM response
        const fallbackWorkout = [
          {
            id: 1,
            name: "AI-Generated Exercise (Parse Failed)",
            sets: 3,
            reps: "8-12",
            restTime: 90,
            instructions: content.text.substring(0, 200) + "... (Raw AI response - parse failed)",
            hasWeight: false,
            alternativeExercises: ["Alternative 1", "Alternative 2", "Alternative 3"]
          }
        ];
        
        return NextResponse.json({
          success: true,
          message: `AI response received from ${validatedData.coachId} but JSON parsing failed`,
          coachId: validatedData.coachId,
          workoutType: validatedData.workoutType,
          duration: validatedData.duration,
          exercises: fallbackWorkout,
          generationTime: endTime - startTime,
          realLLM: true,
          fallbackUsed: true,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          rawAIResponse: content.text,
          tokenUsage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          },
        });
      }
      
    } catch (error) {
      console.error('❌ Direct AI generation error:', error);
      
      const fallbackWorkout = [
        {
          id: 1,
          name: "Fallback Exercise",
          sets: 3,
          reps: "8-12", 
          restTime: 90,
          instructions: `${validatedData.coachId} coach fallback workout - API error occurred`,
          hasWeight: false,
          alternativeExercises: ["Alternative 1", "Alternative 2", "Alternative 3"]
        }
      ];
      
      return NextResponse.json({
        success: true,
        message: `Fallback workout for ${validatedData.coachId} trainer - API error`,
        coachId: validatedData.coachId,
        workoutType: validatedData.workoutType,
        duration: validatedData.duration,
        exercises: fallbackWorkout,
        generationTime: Date.now() - startTime,
        realLLM: false,
        fallbackUsed: true,
        error: error instanceof Error ? error.message : 'Unknown AI error',
      });
    }
    
  } catch (error) {
    console.error('Simple AI workout generation API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate workout',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple AI Workout Generation API',
    description: 'Direct Anthropic Claude integration - no AgentKit complexity',
    availableTrainers: Object.keys(trainerPersonalities),
    endpoint: 'POST /api/workouts/generate-simple-ai',
    realLLM: true,
  });
}