import { z } from 'zod';
import type { Exercise } from '@/db/schema';

// Zod schema for validating AI-generated exercises
const ExerciseSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  sets: z.number().min(1).max(10),
  reps: z.string().min(1),
  restTime: z.number().min(10).max(600), // 10 seconds to 10 minutes
  instructions: z.string().min(10),
  hasWeight: z.boolean(),
  targetWeight: z.number().optional(),
  weightUnit: z.enum(['lbs', 'kg']).optional(),
  alternativeExercises: z.array(z.string()).optional(),
});

const WorkoutSchema = z.array(ExerciseSchema).min(3).max(8); // 3-8 exercises

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
}

export class AIResponseParser {
  // Parse workout generation response
  parseWorkoutResponse(aiResponse: string): ParseResult<Exercise[]> {
    try {
      // Clean the response - remove any text before/after JSON
      let cleanedResponse = this.extractJsonFromResponse(aiResponse);
      
      if (!cleanedResponse) {
        return {
          success: false,
          error: 'No valid JSON found in AI response',
        };
      }

      // Parse JSON
      const parsedData = JSON.parse(cleanedResponse);
      
      // Validate against schema
      const validatedData = WorkoutSchema.parse(parsedData);
      
      // Additional business logic validation
      const validationResult = this.validateWorkoutBusinessLogic(validatedData);
      if (!validationResult.success) {
        return validationResult;
      }

      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      console.error('Workout parsing error:', error);
      
      // Try fallback parsing
      const fallbackResult = this.tryFallbackWorkoutParsing(aiResponse);
      if (fallbackResult.success) {
        return {
          ...fallbackResult,
          fallbackUsed: true,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse workout response',
      };
    }
  }

  // Parse motivation response
  parseMotivationResponse(aiResponse: string): ParseResult<string> {
    try {
      // Clean the response
      const cleaned = aiResponse.trim();
      
      // Basic validation
      if (cleaned.length < 10) {
        return {
          success: false,
          error: 'Motivation message too short',
        };
      }

      if (cleaned.length > 500) {
        // Truncate if too long
        const truncated = cleaned.substring(0, 500) + '...';
        return {
          success: true,
          data: truncated,
        };
      }

      return {
        success: true,
        data: cleaned,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse motivation response',
      };
    }
  }

  // Parse adaptation response
  parseAdaptationResponse(aiResponse: string): ParseResult<{
    analysis: string;
    recommendations: string[];
    intensityAdjustment: 'increase' | 'maintain' | 'decrease';
    focusAreas: string[];
    motivationalNote: string;
  }> {
    try {
      const cleanedResponse = this.extractJsonFromResponse(aiResponse);
      
      if (!cleanedResponse) {
        return {
          success: false,
          error: 'No valid JSON found in adaptation response',
        };
      }

      const parsedData = JSON.parse(cleanedResponse);

      // Validate required fields
      if (!parsedData.analysis || !parsedData.recommendations || !parsedData.intensityAdjustment) {
        return {
          success: false,
          error: 'Missing required fields in adaptation response',
        };
      }

      return {
        success: true,
        data: {
          analysis: parsedData.analysis,
          recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
          intensityAdjustment: ['increase', 'maintain', 'decrease'].includes(parsedData.intensityAdjustment) 
            ? parsedData.intensityAdjustment 
            : 'maintain',
          focusAreas: Array.isArray(parsedData.focusAreas) ? parsedData.focusAreas : [],
          motivationalNote: parsedData.motivationalNote || '',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse adaptation response',
      };
    }
  }

  // Extract JSON from AI response
  private extractJsonFromResponse(response: string): string | null {
    try {
      // Remove any markdown code blocks
      let cleaned = response.replace(/```json\s*|\s*```/g, '');
      cleaned = cleaned.replace(/```\s*|\s*```/g, '');
      
      // Try to find JSON array or object
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      const objectMatch = cleaned.match(/\{[\s\S]*\}/);
      
      if (arrayMatch) {
        return arrayMatch[0];
      } else if (objectMatch) {
        return objectMatch[0];
      }
      
      // If no brackets found, try the whole cleaned response
      const trimmed = cleaned.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        return trimmed;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Validate workout business logic
  private validateWorkoutBusinessLogic(workout: Exercise[]): ParseResult<Exercise[]> {
    try {
      // Check for duplicate exercise IDs
      const ids = workout.map(ex => ex.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        return {
          success: false,
          error: 'Duplicate exercise IDs found',
        };
      }

      // Validate weight exercises have weight info
      for (const exercise of workout) {
        if (exercise.hasWeight && !exercise.targetWeight) {
          return {
            success: false,
            error: `Exercise "${exercise.name}" is marked as having weight but no target weight specified`,
          };
        }

        if (exercise.hasWeight && exercise.targetWeight && !exercise.weightUnit) {
          // Default to lbs if not specified
          exercise.weightUnit = 'lbs';
        }

        // Ensure alternative exercises exist
        if (!exercise.alternativeExercises || exercise.alternativeExercises.length < 3) {
          return {
            success: false,
            error: `Exercise "${exercise.name}" needs at least 3 alternative exercises`,
          };
        }
      }

      return {
        success: true,
        data: workout,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Business logic validation failed',
      };
    }
  }

  // Fallback parsing for when primary parsing fails
  private tryFallbackWorkoutParsing(response: string): ParseResult<Exercise[]> {
    try {
      // Try to parse a simpler structure and enhance it
      const lines = response.split('\n');
      const exercises: Exercise[] = [];
      let currentId = 1;

      for (const line of lines) {
        // Look for exercise patterns
        const exerciseMatch = line.match(/^[-*]\s*(.+?)(?:\s*-\s*(.+))?$/);
        if (exerciseMatch) {
          const name = exerciseMatch[1].trim();
          if (name && name.length > 2) {
            exercises.push({
              id: currentId++,
              name: name,
              sets: 3,
              reps: '8-12',
              restTime: 60,
              instructions: `Perform ${name} with proper form and control.`,
              hasWeight: name.toLowerCase().includes('weight') || name.toLowerCase().includes('dumbbell'),
              targetWeight: name.toLowerCase().includes('weight') ? 25 : undefined,
              weightUnit: 'lbs',
              alternativeExercises: ['Bodyweight variation', 'Machine variation', 'Band variation'],
            });
          }
        }
      }

      if (exercises.length >= 3) {
        return {
          success: true,
          data: exercises.slice(0, 6), // Limit to 6 exercises
        };
      }

      return {
        success: false,
        error: 'Fallback parsing could not extract enough exercises',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Fallback parsing failed',
      };
    }
  }

  // Generate fallback workout when AI fails completely
  generateFallbackWorkout(
    workoutType: string = 'bodyweight',
    fitnessLevel: string = 'beginner'
  ): Exercise[] {
    const bodyweightWorkout: Exercise[] = [
      {
        id: 1,
        name: 'Push-ups',
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '5-10' : '10-15',
        restTime: 60,
        instructions: 'Keep your body in a straight line. Lower until chest nearly touches ground.',
        hasWeight: false,
        alternativeExercises: ['Knee Push-ups', 'Wall Push-ups', 'Incline Push-ups'],
      },
      {
        id: 2,
        name: 'Bodyweight Squats',
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '10-15' : '15-20',
        restTime: 60,
        instructions: 'Lower down as if sitting back into a chair. Keep chest up.',
        hasWeight: false,
        alternativeExercises: ['Chair Squats', 'Sumo Squats', 'Jump Squats'],
      },
      {
        id: 3,
        name: 'Plank Hold',
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '20-30s' : '30-60s',
        restTime: 60,
        instructions: 'Hold a straight line from head to heels. Keep core tight.',
        hasWeight: false,
        alternativeExercises: ['Knee Plank', 'Side Plank', 'Plank Up-Downs'],
      },
      {
        id: 4,
        name: 'Mountain Climbers',
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '15-20' : '20-30',
        restTime: 60,
        instructions: 'Quickly alternate bringing knees to chest. Keep hips level.',
        hasWeight: false,
        alternativeExercises: ['High Knees', 'Running in Place', 'Bear Crawls'],
      },
    ];

    return bodyweightWorkout;
  }
}

// Create a default instance
export const aiResponseParser = new AIResponseParser();