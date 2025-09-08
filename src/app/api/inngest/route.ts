import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';

// Import all Inngest functions
import { generateWorkout } from '@/inngest/functions/generate-workout';
import { generateWorkoutAgentKit } from '@/inngest/functions/generate-workout-agentkit';
import { scheduleWorkouts } from '@/inngest/functions/schedule-workouts';
import { adaptWorkout } from '@/inngest/functions/adapt-workout';

// Create the Inngest API handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateWorkout, // Legacy function for backward compatibility
    generateWorkoutAgentKit, // New AgentKit-powered function
    scheduleWorkouts,
    adaptWorkout,
  ],
});