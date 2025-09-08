import { z } from 'zod';
import {
  createAgent,
  createNetwork,
  createTool,
  anthropic,
} from '@inngest/agent-kit';
import coachesData from '@/data/coaches.json';
// Import Exercise type from the database schema
interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  instructions: string;
  hasWeight: boolean;
  targetWeight?: number;
  weightUnit?: string;
  alternativeExercises: string[];
}

/**
 * AgentKit-powered Trainer Agents
 * 
 * This module creates specialized AI agents for each of our 9 fitness trainers,
 * each with unique personalities and workout generation capabilities.
 */

export interface WorkoutGenerationParams {
  workoutType: string;
  duration: number;
  fitnessLevel: string;
  equipment: string[];
  primaryGoals: string[];
  preferences: {
    intensity?: string;
    variety?: string;
    restTime?: string;
  };
  limitations?: string;
}

export interface WorkoutGenerationState {
  params?: WorkoutGenerationParams;
  userProfile?: {
    profile: {
      fitnessLevel: string;
      availableEquipment: string[];
      primaryGoals: string[];
      injuriesLimitations: string | null;
    };
    preferences: {
      workoutIntensityPreference?: string;
      exerciseVarietyPreference?: string;
      restTimePreferences?: string;
    };
  };
  generatedWorkout?: Exercise[];
  validationPassed?: boolean;
  fallbackUsed?: boolean;
}

// Exercise validation schema
const ExerciseSchema = z.object({
  id: z.number(),
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  restTime: z.number(),
  instructions: z.string(),
  hasWeight: z.boolean(),
  targetWeight: z.number().optional(),
  weightUnit: z.string().optional(),
  alternativeExercises: z.array(z.string()),
});

const WorkoutSchema = z.array(ExerciseSchema);

// Tool for validating and saving workout
const validateWorkoutTool = createTool({
  name: 'validate_and_save_workout',
  description: 'Validate the generated workout JSON and save it to the network state',
  handler: async (input, { network }) => {
    try {
      // Validate with Zod
      const validatedWorkout = WorkoutSchema.parse(input.workout);
      
      // Save to network state
      if (network?.state?.data) {
        network.state.data.generatedWorkout = validatedWorkout;
        network.state.data.validationPassed = true;
        network.state.data.fallbackUsed = false;
      }
      
      return `Successfully validated and saved workout with ${validatedWorkout.length} exercises.`;
    } catch (error) {
      console.error('Workout validation failed:', error);
      
      // Save failed validation info
      if (network?.state?.data) {
        network.state.data.validationPassed = false;
        network.state.data.fallbackUsed = true;
      }
      
      return `Workout validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// Tool for accessing user profile data
const getUserProfileTool = createTool({
  name: 'get_user_profile',
  description: 'Get user profile and preferences from the network state',
  handler: async (input, { network }) => {
    const userProfile = network?.state.data.userProfile;
    const params = network?.state.data.params;
    
    if (!userProfile || !params) {
      throw new Error('User profile or workout parameters not available');
    }
    
    return {
      fitnessLevel: params.fitnessLevel,
      equipment: params.equipment,
      goals: params.primaryGoals,
      limitations: params.limitations,
      preferences: params.preferences,
      workoutType: params.workoutType,
      duration: params.duration,
    };
  },
});

/**
 * Create a trainer agent for a specific coach personality
 */
interface CoachData {
  name: string;
  description: string;
  personality: string;
  specialties: string[];
  motivationalStyle: string;
  workoutApproach: string;
  restPeriodStyle: string;
  feedbackStyle: string;
  vocabulary: string[];
  catchPhrases: string[];
}

function createTrainerAgent(coachId: string) {
  const coach = (coachesData as Record<string, CoachData>)[coachId];
  
  if (!coach) {
    throw new Error(`Coach ${coachId} not found in coaches data`);
  }
  
  return createAgent({
    name: `${coach.name}_trainer`,
    description: `AI fitness trainer with ${coach.name}'s personality: ${coach.description}`,
    system: `You are ${coach.name}, an AI fitness trainer with the following personality and approach:

PERSONALITY PROFILE:
- Name: ${coach.name}
- Personality: ${coach.personality}
- Specialties: ${coach.specialties.join(', ')}
- Description: ${coach.description}
- Motivational Style: ${coach.motivationalStyle}
- Workout Approach: ${coach.workoutApproach}
- Rest Period Style: ${coach.restPeriodStyle}
- Feedback Style: ${coach.feedbackStyle}

YOUR VOCABULARY: ${coach.vocabulary.join(', ')}
YOUR CATCHPHRASES: ${coach.catchPhrases.join(', ')}

CRITICAL WORKOUT GENERATION REQUIREMENTS:
1. First, use the 'get_user_profile' tool to understand the user's needs
2. Generate a workout that perfectly matches YOUR unique coaching personality
3. Create 4-6 exercises that align with the requested workout type and user's fitness level
4. Write ALL exercise instructions in YOUR authentic voice using YOUR vocabulary
5. Set rest times according to YOUR rest period style
6. Include 5 alternative exercises for each main exercise
7. Use the 'validate_and_save_workout' tool to save your completed workout

EXERCISE INSTRUCTION GUIDELINES:
- Write in YOUR coaching voice (e.g., ${coach.name === 'MAX' ? '"CRUSH those weights! Show them NO MERCY!"' : coach.name === 'SAGE' ? '"Breathe deeply and honor your body\'s wisdom"' : '"You\'ve got this! Take your time and listen to your body"'})
- Include motivational elements from YOUR catchphrases
- Match YOUR intensity level (${coach.workoutApproach})
- Reflect YOUR specialties: ${coach.specialties.join(', ')}

Remember: You are ${coach.name}, not just any trainer. Every word should reflect YOUR unique personality!`,
    
    model: anthropic({
      model: 'claude-3-5-sonnet-20241022',
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultParameters: {
        max_tokens: 4096,
        temperature: 0.7,
      },
    }),
    
    tools: [getUserProfileTool, validateWorkoutTool],
  });
}

/**
 * Create all 9 trainer agents
 */
export const trainerAgents = {
  MAX: createTrainerAgent('MAX'),
  SAGE: createTrainerAgent('SAGE'),
  ZARA: createTrainerAgent('ZARA'),
  ACE: createTrainerAgent('ACE'),
  KAI: createTrainerAgent('KAI'),
  NOVA: createTrainerAgent('NOVA'),
  BLAZE: createTrainerAgent('BLAZE'),
  RILEY: createTrainerAgent('RILEY'),
  MARCO: createTrainerAgent('MARCO'),
};

/**
 * Create the workout generation network
 */
export function createWorkoutNetwork(coachId: string) {
  const selectedAgent = trainerAgents[coachId as keyof typeof trainerAgents];
  
  if (!selectedAgent) {
    throw new Error(`Trainer agent for ${coachId} not found`);
  }
  
  return createNetwork<WorkoutGenerationState>({
    name: `${coachId}-workout-network`,
    agents: [selectedAgent],
    
    // Simple router - just run the selected trainer agent once
    router: ({ network }) => {
      // If workout is already generated and validated, we're done
      if (network?.state.data.validationPassed === true) {
        return undefined; // Stop the network
      }
      
      // If validation failed, also stop (fallback will be handled externally)
      if (network?.state.data.validationPassed === false) {
        return undefined;
      }
      
      // Otherwise, run the trainer agent
      return selectedAgent;
    },
    
    defaultModel: anthropic({
      model: 'claude-3-5-sonnet-20241022',
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultParameters: {
        max_tokens: 4096,
        temperature: 0.7,
      },
    }),
  });
}

/**
 * Generate a fallback workout if AgentKit generation fails
 */
export function generateFallbackWorkout(
  workoutType: string,
  fitnessLevel: string,
  coachId: string
): Exercise[] {
  const coach = (coachesData as Record<string, CoachData>)[coachId] || (coachesData as Record<string, CoachData>).MAX;
  
  // Simple fallback based on workout type
  const baseExercises: Omit<Exercise, 'id' | 'instructions'>[] = workoutType === 'strength' ? [
    {
      name: 'Push-ups',
      sets: 3,
      reps: fitnessLevel === 'beginner' ? '8-10' : fitnessLevel === 'intermediate' ? '10-15' : '15-20',
      restTime: 60,
      hasWeight: false,
      alternativeExercises: ['Knee Push-ups', 'Wall Push-ups', 'Diamond Push-ups', 'Wide Push-ups', 'Decline Push-ups'],
    },
    {
      name: 'Bodyweight Squats',
      sets: 3,
      reps: fitnessLevel === 'beginner' ? '10-12' : fitnessLevel === 'intermediate' ? '15-20' : '20-25',
      restTime: 60,
      hasWeight: false,
      alternativeExercises: ['Chair Squats', 'Jump Squats', 'Sumo Squats', 'Single-leg Squats', 'Pulse Squats'],
    },
    {
      name: 'Plank Hold',
      sets: 3,
      reps: fitnessLevel === 'beginner' ? '20-30s' : fitnessLevel === 'intermediate' ? '45-60s' : '60-90s',
      restTime: 45,
      hasWeight: false,
      alternativeExercises: ['Knee Plank', 'Side Plank', 'Plank Up-downs', 'Mountain Climbers', 'Plank Jacks'],
    },
  ] : [
    {
      name: 'Jumping Jacks',
      sets: 3,
      reps: '30s',
      restTime: 30,
      hasWeight: false,
      alternativeExercises: ['Step-touches', 'Modified Jacks', 'Star Jumps', 'Cross Jacks', 'Squat Jacks'],
    },
    {
      name: 'High Knees',
      sets: 3,
      reps: '30s',
      restTime: 30,
      hasWeight: false,
      alternativeExercises: ['Marching in Place', 'Knee Raises', 'Butt Kicks', 'Fast Feet', 'Mountain Climbers'],
    },
  ];
  
  // Add personality to instructions
  return baseExercises.map((exercise, index) => ({
    id: index + 1,
    ...exercise,
    instructions: `${exercise.name} - ${coach.catchPhrases[0]} Keep your form tight and ${coach.vocabulary[0]}!`,
  }));
}