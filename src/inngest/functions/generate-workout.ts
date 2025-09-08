import { inngest } from '../client';
import { db } from '@/db';
import { 
  userProfiles, 
  userPreferences, 
  workoutPlans, 
  aiGenerationLogs,
  type NewWorkoutPlan,
  type NewAIGenerationLog,
  type Exercise 
} from '@/db/schema';
import { aiClient } from '@/lib/ai/client';
import { promptGenerator } from '@/lib/ai/prompts';
import { aiResponseParser } from '@/lib/ai/parser';
import { eq } from 'drizzle-orm';

export const generateWorkout = inngest.createFunction(
  {
    id: 'generate-workout',
    name: 'Generate AI-Powered Workout',
    concurrency: {
      limit: 5, // Limit concurrent workout generations
    },
  },
  {
    event: 'workout/generate'
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

    // Step 1: Fetch user profile and preferences
    const userProfile = await step.run('fetch-user-profile', async () => {
      const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (!profile[0]) {
        throw new Error(`User profile not found for userId: ${userId}`);
      }

      const prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userProfileId, userId))
        .limit(1);

      return {
        profile: profile[0],
        preferences: prefs[0] || null,
      };
    });

    // Step 2: Generate AI workout
    const aiResult = await step.run('generate-ai-workout', async () => {
      const startTime = Date.now();
      
      try {
        // Prepare workout generation parameters
        const workoutParams = {
          coachId,
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

        // Generate AI prompts
        const systemPrompt = promptGenerator.generateWorkoutSystemPrompt(coachId);
        const userPrompt = promptGenerator.generateWorkoutUserPrompt(workoutParams);

        // Call AI service
        const aiResponse = await aiClient.generateWorkout(systemPrompt, userPrompt);
        
        if (!aiResponse.success) {
          throw new Error(`AI generation failed: ${aiResponse.error}`);
        }

        // Parse AI response
        const parseResult = aiResponseParser.parseWorkoutResponse(aiResponse.content!);
        
        let finalWorkout: Exercise[];
        let fallbackUsed = false;

        if (!parseResult.success) {
          // Use fallback workout
          console.warn('AI parsing failed, using fallback workout:', parseResult.error);
          finalWorkout = aiResponseParser.generateFallbackWorkout(workoutType, fitnessLevel);
          fallbackUsed = true;
        } else {
          finalWorkout = parseResult.data!;
        }

        // Log the AI generation
        const logData: NewAIGenerationLog = {
          requestType: 'workout_generation',
          userId,
          coachPersonality: coachId as any,
          aiProvider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          requestPrompt: `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`,
          responseContent: aiResponse.content,
          tokenUsage: aiResponse.usage?.totalTokens,
          responseTimeMs: aiResponse.responseTimeMs,
          success: true,
          schemaValidation: parseResult.success,
          exerciseCount: finalWorkout.length,
          fallbackUsed,
        };

        await db.insert(aiGenerationLogs).values(logData);

        return {
          workout: finalWorkout,
          aiResponse,
          fallbackUsed,
        };
      } catch (error) {
        // Log the failure
        const errorLogData: NewAIGenerationLog = {
          requestType: 'workout_generation',
          userId,
          coachPersonality: coachId as any,
          aiProvider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          requestPrompt: 'Failed before prompt generation',
          responseContent: null,
          responseTimeMs: Date.now() - startTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          schemaValidation: false,
          fallbackUsed: true,
        };

        await db.insert(aiGenerationLogs).values(errorLogData);

        // Return fallback workout
        return {
          workout: aiResponseParser.generateFallbackWorkout(workoutType, fitnessLevel),
          aiResponse: null,
          fallbackUsed: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Step 3: Save workout plan to database
    const workoutPlan = await step.run('save-workout-plan', async () => {
      // Map lowercase workout types to database enum values
      const workoutTypeMap: Record<string, any> = {
        'strength': 'STRENGTH',
        'bodyweight': 'BODYWEIGHT', 
        'flexibility': 'FLEXIBILITY',
        'mobility': 'MOBILITY',
        'cardio': 'CARDIO',
        'hiit': 'HIIT'
      };

      // Map lowercase fitness levels to database enum values
      const fitnessLevelMap: Record<string, any> = {
        'beginner': 'BEGINNER',
        'intermediate': 'INTERMEDIATE', 
        'advanced': 'ADVANCED'
      };

      const planData: NewWorkoutPlan = {
        userProfileId: userId,
        name: `${coachId} ${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Workout`,
        description: `AI-generated ${duration}-minute ${workoutType} workout by coach ${coachId}`,
        estimatedDuration: duration,
        targetMuscleGroups: [], // Could be extracted from exercises
        workoutType: workoutTypeMap[workoutType] || 'STRENGTH',
        difficultyLevel: fitnessLevelMap[fitnessLevel] || 'INTERMEDIATE',
        generatedByAI: true,
        aiModel: 'claude-3-sonnet-20240229',
        generationPrompt: `Generated for ${coachId} coach with ${workoutType} focus`,
        coachPersonality: coachId as any,
        exercisesData: aiResult.workout,
      };

      const inserted = await db.insert(workoutPlans).values(planData).returning();
      return inserted[0];
    });

    // Step 4: Return success response
    return {
      success: true,
      workoutPlan,
      exerciseCount: aiResult.workout.length,
      fallbackUsed: aiResult.fallbackUsed,
      generationTime: aiResult.aiResponse?.responseTimeMs,
      message: `Successfully generated ${workoutType} workout with ${aiResult.workout.length} exercises`,
    };
  }
);