import { inngest } from '../client';
import { 
  createWorkoutNetwork,
  generateFallbackWorkout,
  type WorkoutGenerationParams,
  type WorkoutGenerationState,
} from '@/lib/ai/agentkit-trainers';

// Simplified interfaces for the proof of concept
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
 * AgentKit-powered workout generation function
 * 
 * This function orchestrates multi-agent workout generation using Inngest AgentKit,
 * with each of our 9 trainers having their own specialized AI agent.
 */
export const generateWorkoutAgentKit = inngest.createFunction(
  {
    id: 'generate-workout-agentkit',
    name: 'Generate AI Workout with AgentKit Trainers',
    concurrency: {
      limit: 10, // Allow more concurrent generations with AgentKit
    },
  },
  {
    event: 'workout/generate-agentkit'
  },
  async ({ event, step }) => {
    const { 
      userId, 
      coachId, 
      workoutType = 'strength',
      duration = 30,
      equipment = [],
      fitnessLevel = 'beginner',
      preferences = {}
    } = event.data;

    // Step 1: Mock user profile for testing (replace with real DB call later)
    const userProfile = await step.run('fetch-user-profile', async () => {
      // Mock user profile for testing
      return {
        profile: {
          fitnessLevel: fitnessLevel,
          availableEquipment: equipment,
          primaryGoals: ['build_strength', 'muscle_tone'],
          injuriesLimitations: null,
        },
        preferences: {
          workoutIntensityPreference: 'moderate',
          exerciseVarietyPreference: 'balanced', 
          restTimePreferences: 'standard',
        },
      };
    });

    // Step 2: Prepare workout parameters
    const workoutParams: WorkoutGenerationParams = {
      workoutType,
      duration,
      fitnessLevel: fitnessLevel || userProfile.profile.fitnessLevel,
      equipment: equipment.length > 0 ? equipment : userProfile.profile.availableEquipment as string[],
      primaryGoals: userProfile.profile.primaryGoals as string[],
      preferences: {
        intensity: preferences.intensity || userProfile.preferences?.workoutIntensityPreference,
        variety: preferences.variety || userProfile.preferences?.exerciseVarietyPreference,
        restTime: preferences.restTime || userProfile.preferences?.restTimePreferences,
      },
      limitations: userProfile.profile.injuriesLimitations || undefined,
    };

    // Step 3: Generate workout using AgentKit
    const agentKitResult = await step.run('generate-with-agentkit', async () => {
      const startTime = Date.now();
      
      try {
        console.log(`🤖 Starting AgentKit workout generation for ${coachId}...`);
        
        // Create the workout network for the selected trainer
        const network = createWorkoutNetwork(coachId);
        
        // Initialize network state
        const initialState: WorkoutGenerationState = {
          params: workoutParams,
          userProfile: userProfile,
        };
        
        // Set initial state
        network.state.data = initialState;
        
        // Generate workout prompt for the trainer
        const prompt = `Generate a ${duration}-minute ${workoutType} workout for a ${fitnessLevel} level user.
        
Available equipment: ${workoutParams.equipment.join(', ') || 'bodyweight only'}
Primary goals: ${workoutParams.primaryGoals.join(', ')}
${workoutParams.limitations ? `Limitations: ${workoutParams.limitations}` : ''}

Workout preferences:
- Intensity: ${workoutParams.preferences.intensity || 'moderate'}  
- Variety: ${workoutParams.preferences.variety || 'balanced'}
- Rest time preference: ${workoutParams.preferences.restTime || 'standard'}

Create a workout that showcases your unique coaching personality and expertise. Remember to use your authentic voice in all exercise instructions!`;

        // Run the AgentKit network
        const result = await network.run(prompt);
        const endTime = Date.now();
        
        console.log(`✅ AgentKit generation completed in ${endTime - startTime}ms`);
        console.log('Network final state:', network.state.data);
        
        // Check if workout was successfully generated
        const finalState = network.state.data as WorkoutGenerationState;
        
        if (finalState.validationPassed && finalState.generatedWorkout) {
          return {
            workout: finalState.generatedWorkout,
            success: true,
            fallbackUsed: false,
            responseTimeMs: endTime - startTime,
            agentResponse: result,
          };
        } else {
          // Generation failed, use fallback
          console.warn('AgentKit generation failed, using fallback workout');
          
          const fallbackWorkout = generateFallbackWorkout(workoutType, fitnessLevel, coachId);
          
          return {
            workout: fallbackWorkout,
            success: false,
            fallbackUsed: true,
            responseTimeMs: endTime - startTime,
            error: 'AgentKit workout generation failed validation',
            agentResponse: result,
          };
        }
        
      } catch (error) {
        console.error('AgentKit generation error:', error);
        
        const fallbackWorkout = generateFallbackWorkout(workoutType, fitnessLevel, coachId);
        
        return {
          workout: fallbackWorkout,
          success: false,
          fallbackUsed: true,
          responseTimeMs: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown AgentKit error',
        };
      }
    });

    // Step 4: Log the AgentKit generation (simplified for testing)
    await step.run('log-generation', async () => {
      console.log('AgentKit Generation Log:', {
        requestType: 'agentkit_workout_generation',
        userId,
        coachId,
        success: agentKitResult.success,
        exerciseCount: (agentKitResult.workout as Exercise[]).length,
        fallbackUsed: agentKitResult.fallbackUsed,
        responseTime: agentKitResult.responseTimeMs,
      });
      // TODO: Implement real database logging
    });

    // Step 5: Mock save workout plan (simplified for testing)
    const workoutPlan = await step.run('save-workout-plan', async () => {
      // Mock workout plan for testing
      const mockPlan = {
        id: 'mock-' + Date.now(),
        name: `${coachId} ${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Workout`,
        description: `AgentKit-generated ${duration}-minute ${workoutType} workout by ${coachId} trainer agent`,
        estimatedDuration: duration,
        exercisesData: agentKitResult.workout,
        generatedByAI: true,
        coachPersonality: coachId,
      };
      
      console.log('Mock Workout Plan Saved:', mockPlan);
      // TODO: Implement real database save
      return mockPlan;
    });

    // Step 6: Return success response
    return {
      success: true,
      workoutPlan,
      exerciseCount: (agentKitResult.workout as Exercise[]).length,
      fallbackUsed: agentKitResult.fallbackUsed,
      generationTime: agentKitResult.responseTimeMs,
      agentKitPowered: true,
      trainerAgent: `${coachId}_trainer`,
      message: `Successfully generated ${workoutType} workout using ${coachId} AgentKit trainer with ${(agentKitResult.workout as Exercise[]).length} exercises`,
    };
  }
);