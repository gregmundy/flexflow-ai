import { inngest } from '@/inngest/client';
import type { Exercise } from '@/db/schema';
import coachesData from '@/data/coaches.json';

export interface WorkoutGenerationRequest {
  userId: string;
  coachId: keyof typeof coachesData;
  workoutType?: 'strength' | 'bodyweight' | 'flexibility' | 'mobility' | 'cardio' | 'hiit';
  duration?: number;
  equipment?: string[];
  fitnessLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  preferences?: {
    intensity?: 'low' | 'moderate' | 'high';
    variety?: 'repetitive' | 'balanced' | 'high_variety';
    restTime?: 'short' | 'standard' | 'extended';
  };
}

export interface WorkoutScheduleRequest {
  userId: string;
  frequency: number;
  preferredTimeSlots?: string[];
  duration?: number;
}

export interface WorkoutFeedbackRequest {
  userId: string;
  workoutId: string;
  feedback: {
    overallRating: number;
    energyLevel: number;
    difficulty: 'too_easy' | 'just_right' | 'too_hard';
    enjoyment: number;
    comments?: string;
  };
  performance: {
    completedSets: number;
    totalSets: number;
    exerciseFeedback?: Record<string, any>;
  };
}

/**
 * Utility class for generating AI-powered workouts
 * Provides a simple interface to the Inngest-powered workout system
 */
export class WorkoutGenerator {
  /**
   * Generate a new AI-powered workout
   */
  static async generateWorkout(request: WorkoutGenerationRequest) {
    try {
      const result = await inngest.send({
        name: 'workout/generate',
        data: request,
      });

      return {
        success: true,
        eventId: result.ids[0],
        message: `Workout generation initiated for coach ${request.coachId}`,
        data: request,
      };
    } catch (error) {
      console.error('Workout generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule workouts for a user
   */
  static async scheduleWorkouts(request: WorkoutScheduleRequest) {
    try {
      const result = await inngest.send({
        name: 'workout/schedule',
        data: request,
      });

      return {
        success: true,
        eventId: result.ids[0],
        message: `Workout scheduling initiated for ${request.frequency} workouts per week`,
        data: request,
      };
    } catch (error) {
      console.error('Workout scheduling failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Submit workout feedback for adaptation
   */
  static async submitFeedback(request: WorkoutFeedbackRequest) {
    try {
      const result = await inngest.send({
        name: 'workout/adapt',
        data: request,
      });

      return {
        success: true,
        eventId: result.ids[0],
        message: 'Workout adaptation initiated based on feedback',
        data: {
          overallRating: request.feedback.overallRating,
          completionRate: (request.performance.completedSets / request.performance.totalSets * 100).toFixed(1),
        },
      };
    } catch (error) {
      console.error('Feedback submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get available coaches
   */
  static getAvailableCoaches() {
    return Object.entries(coachesData).map(([id, coach]) => ({
      id: id as keyof typeof coachesData,
      name: coach.name,
      avatar: coach.avatar,
      color: coach.color,
      description: coach.description,
      specialties: coach.specialties,
    }));
  }

  /**
   * Get coach details
   */
  static getCoachDetails(coachId: keyof typeof coachesData) {
    return coachesData[coachId] || null;
  }

  /**
   * Generate a fallback workout when AI is not available
   * This ensures the system always works even if external services fail
   */
  static generateFallbackWorkout(
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
        instructions: 'Keep your body in a straight line from head to heels. Lower until your chest nearly touches the ground, then push back up.',
        hasWeight: false,
        alternativeExercises: ['Knee Push-ups', 'Wall Push-ups', 'Incline Push-ups', 'Diamond Push-ups', 'Wide-Grip Push-ups'],
      },
      {
        id: 2,
        name: 'Bodyweight Squats',
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '10-15' : '15-20',
        restTime: 60,
        instructions: 'Lower down as if sitting back into a chair, keeping your chest up and knees tracking over your toes. Go down until thighs are parallel to the floor.',
        hasWeight: false,
        alternativeExercises: ['Chair Squats', 'Sumo Squats', 'Jump Squats', 'Single-Leg Squats', 'Pulse Squats'],
      },
      {
        id: 3,
        name: 'Plank Hold',
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '20-30s' : '30-60s',
        restTime: 60,
        instructions: 'Hold a straight line from head to heels, engaging your core and glutes. Keep your breathing steady and avoid sagging hips.',
        hasWeight: false,
        alternativeExercises: ['Knee Plank', 'Side Plank', 'Plank Up-Downs', 'Plank Jacks', 'Mountain Climber Plank'],
      },
      {
        id: 4,
        name: 'Mountain Climbers',
        sets: 3,
        reps: fitnessLevel === 'beginner' ? '15-20' : '20-30',
        restTime: 60,
        instructions: 'Start in plank position. Quickly alternate bringing each knee toward your chest while keeping your core tight and hips level.',
        hasWeight: false,
        alternativeExercises: ['High Knees', 'Running in Place', 'Bear Crawls', 'Burpees', 'Jump Jacks'],
      },
    ];

    const strengthWorkout: Exercise[] = [
      {
        id: 1,
        name: 'Dumbbell Chest Press',
        sets: 3,
        reps: '8-12',
        restTime: 120,
        instructions: 'Lie on a bench or floor, press dumbbells up from chest level. Control the weight on both lifting and lowering phases.',
        hasWeight: true,
        targetWeight: 25,
        weightUnit: 'lbs',
        alternativeExercises: ['Push-ups', 'Resistance Band Chest Press', 'Incline Press', 'Chest Flyes', 'Decline Press'],
      },
      {
        id: 2,
        name: 'Dumbbell Rows',
        sets: 3,
        reps: '8-12',
        restTime: 120,
        instructions: 'Hinge at hips, keep back straight. Pull dumbbells to your sides, squeezing shoulder blades together.',
        hasWeight: true,
        targetWeight: 20,
        weightUnit: 'lbs',
        alternativeExercises: ['Resistance Band Rows', 'Inverted Rows', 'T-Bar Rows', 'Cable Rows', 'Chest-Supported Rows'],
      },
      {
        id: 3,
        name: 'Goblet Squats',
        sets: 3,
        reps: '10-15',
        restTime: 90,
        instructions: 'Hold dumbbell at chest level. Squat down keeping chest up and knees tracking over toes.',
        hasWeight: true,
        targetWeight: 30,
        weightUnit: 'lbs',
        alternativeExercises: ['Bodyweight Squats', 'Dumbbell Squats', 'Sumo Squats', 'Front Squats', 'Bulgarian Split Squats'],
      },
    ];

    return workoutType === 'strength' ? strengthWorkout : bodyweightWorkout;
  }

  /**
   * Validate workout data structure
   */
  static validateWorkout(workout: any[]): boolean {
    if (!Array.isArray(workout) || workout.length === 0) {
      return false;
    }

    return workout.every(exercise => (
      typeof exercise.id === 'number' &&
      typeof exercise.name === 'string' &&
      typeof exercise.sets === 'number' &&
      typeof exercise.reps === 'string' &&
      typeof exercise.restTime === 'number' &&
      typeof exercise.instructions === 'string' &&
      typeof exercise.hasWeight === 'boolean' &&
      Array.isArray(exercise.alternativeExercises)
    ));
  }
}