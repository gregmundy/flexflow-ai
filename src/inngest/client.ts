import { Inngest } from 'inngest';

// Create the Inngest client
export const inngest = new Inngest({
  id: 'flexflow',
  name: 'FlexFlow AI Workout Generator',
});

// Event types for type safety
export type WorkoutGenerationEvent = {
  name: 'workout/generate';
  data: {
    userId: string;
    coachId: string;
    workoutType?: string;
    duration?: number;
    equipment?: string[];
    fitnessLevel?: string;
    preferences?: {
      intensity?: string;
      variety?: string;
      restTime?: string;
    };
  };
};

export type WorkoutScheduleEvent = {
  name: 'workout/schedule';
  data: {
    userId: string;
    frequency: number; // workouts per week
    preferredTimeSlots: string[];
    duration: number;
  };
};

export type WorkoutAdaptationEvent = {
  name: 'workout/adapt';
  data: {
    userId: string;
    workoutId: string;
    feedback: {
      overallRating: number;
      energyLevel: number;
      difficulty: string;
      enjoyment: number;
      comments?: string;
    };
    performance: {
      completedSets: number;
      totalSets: number;
      exerciseFeedback: Record<string, any>;
    };
  };
};

export type MotivationalMessageEvent = {
  name: 'coach/motivate';
  data: {
    userId: string;
    coachId: string;
    context: 'pre_workout' | 'during_set' | 'rest' | 'post_workout';
    messageType: 'motivation' | 'instruction' | 'feedback' | 'celebration';
    exerciseData?: any;
  };
};

// Union type for all events
export type FlexFlowEvents = 
  | WorkoutGenerationEvent
  | WorkoutScheduleEvent  
  | WorkoutAdaptationEvent
  | MotivationalMessageEvent;