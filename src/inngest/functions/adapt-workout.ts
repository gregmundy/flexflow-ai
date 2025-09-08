import { inngest } from '../client';
import { db } from '@/db';
import { 
  userProfiles, 
  userPreferences, 
  workouts,
  workoutFeedback,
  aiGenerationLogs,
  type NewAIGenerationLog,
  type NewUserPreferences 
} from '@/db/schema';
import { aiClient } from '@/lib/ai/client';
import { promptGenerator } from '@/lib/ai/prompts';
import { aiResponseParser } from '@/lib/ai/parser';
import { eq } from 'drizzle-orm';

export const adaptWorkout = inngest.createFunction(
  {
    id: 'adapt-workout',
    name: 'Adapt Workout Based on Feedback',
    concurrency: {
      limit: 5, // Limit concurrent adaptations
    },
  },
  {
    event: 'workout/adapt'
  },
  async ({ event, step }) => {
    const { 
      userId, 
      workoutId, 
      feedback,
      performance 
    } = event.data;

    // Step 1: Fetch user profile and workout data
    const userData = await step.run('fetch-user-data', async () => {
      const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (!profile[0]) {
        throw new Error(`User profile not found for userId: ${userId}`);
      }

      const workout = await db
        .select()
        .from(workouts)
        .where(eq(workouts.id, workoutId))
        .limit(1);

      if (!workout[0]) {
        throw new Error(`Workout not found for workoutId: ${workoutId}`);
      }

      const prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userProfileId, userId))
        .limit(1);

      return {
        profile: profile[0],
        workout: workout[0],
        preferences: prefs[0] || null,
      };
    });

    // Step 2: Analyze feedback with AI
    const analysisResult = await step.run('analyze-feedback', async () => {
      const startTime = Date.now();
      
      try {
        // Get the coach from user preferences
        const coachId = userData.profile.preferredCoach;
        
        // Generate AI prompts for analysis
        const systemPrompt = promptGenerator.generateAdaptationSystemPrompt(coachId);
        const userPrompt = promptGenerator.generateAdaptationUserPrompt(feedback, performance);

        // Call AI service for analysis
        const aiResponse = await aiClient.adaptWorkout(systemPrompt, userPrompt);
        
        if (!aiResponse.success) {
          throw new Error(`AI adaptation failed: ${aiResponse.error}`);
        }

        // Parse AI response
        const parseResult = aiResponseParser.parseAdaptationResponse(aiResponse.content!);
        
        if (!parseResult.success) {
          throw new Error(`Failed to parse adaptation response: ${parseResult.error}`);
        }

        // Log the AI generation
        const logData: NewAIGenerationLog = {
          requestType: 'adaptation',
          userId,
          coachPersonality: coachId as any,
          aiProvider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          requestPrompt: `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`,
          responseContent: aiResponse.content,
          tokenUsage: aiResponse.usage?.totalTokens,
          responseTimeMs: aiResponse.responseTimeMs,
          success: true,
          schemaValidation: parseResult.success,
          fallbackUsed: false,
        };

        await db.insert(aiGenerationLogs).values(logData);

        return {
          analysis: parseResult.data!,
          aiResponse,
        };
      } catch (error) {
        // Log the failure and provide fallback analysis
        const errorLogData: NewAIGenerationLog = {
          requestType: 'adaptation',
          userId,
          coachPersonality: userData.profile.preferredCoach as any,
          aiProvider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          requestPrompt: 'Failed before prompt generation',
          responseContent: null,
          responseTimeMs: Date.now() - startTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          schemaValidation: false,
          fallbackUsed: true,
        };

        await db.insert(aiGenerationLogs).values(errorLogData);

        // Generate fallback analysis based on basic rules
        const fallbackAnalysis = generateFallbackAnalysis(feedback, performance);
        
        return {
          analysis: fallbackAnalysis,
          aiResponse: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Step 3: Update user preferences based on analysis
    const updatedPreferences = await step.run('update-user-preferences', async () => {
      const analysis = analysisResult.analysis;
      const currentPrefs = userData.preferences;
      
      // Calculate new preference adjustments
      const adjustments = calculatePreferenceAdjustments(feedback, performance, analysis);
      
      if (currentPrefs) {
        // Update existing preferences
        const updates: Partial<NewUserPreferences> = {};
        
        if (adjustments.intensityChange) {
          updates.workoutIntensityPreference = adjustments.newIntensity;
        }
        
        if (adjustments.varietyChange) {
          updates.exerciseVarietyPreference = adjustments.newVariety;
        }
        
        if (adjustments.restTimeChange) {
          updates.restTimePreferences = adjustments.newRestTime;
        }
        
        // Add exercises to avoid if feedback was very negative
        if (feedback.overallRating <= 2 && feedback.comments) {
          const currentAvoid = currentPrefs.avoidExercises as string[] || [];
          const newAvoid = [...currentAvoid, ...extractExercisesToAvoid(feedback.comments)];
          updates.avoidExercises = Array.from(new Set(newAvoid)); // Remove duplicates
        }
        
        // Add exercises to favorites if feedback was very positive
        if (feedback.overallRating >= 4 && performance.completedSets / performance.totalSets > 0.8) {
          const currentFavorites = currentPrefs.favoriteExercises as string[] || [];
          const newFavorites = [...currentFavorites, ...extractFavoriteExercises(performance.exerciseFeedback)];
          updates.favoriteExercises = Array.from(new Set(newFavorites)); // Remove duplicates
        }
        
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date();
          
          await db
            .update(userPreferences)
            .set(updates)
            .where(eq(userPreferences.userProfileId, userId));
        }
        
        return { updated: Object.keys(updates).length > 0, changes: updates };
      } else {
        // Create initial preferences
        const newPrefs: NewUserPreferences = {
          userProfileId: userId,
          workoutIntensityPreference: adjustments.newIntensity || 'moderate',
          exerciseVarietyPreference: adjustments.newVariety || 'balanced',
          restTimePreferences: adjustments.newRestTime || 'standard',
          avoidExercises: feedback.overallRating <= 2 && feedback.comments 
            ? extractExercisesToAvoid(feedback.comments) 
            : [],
          favoriteExercises: feedback.overallRating >= 4 
            ? extractFavoriteExercises(performance.exerciseFeedback) 
            : [],
        };
        
        await db.insert(userPreferences).values(newPrefs);
        return { updated: true, changes: newPrefs };
      }
    });

    // Step 4: Generate recommendations for next workout
    const recommendations = await step.run('generate-recommendations', async () => {
      const analysis = analysisResult.analysis;
      
      return {
        nextWorkoutAdjustments: {
          intensityLevel: analysis.intensityAdjustment,
          focusAreas: analysis.focusAreas,
          suggestedDuration: calculateSuggestedDuration(feedback, performance, userData.profile.preferredWorkoutDuration),
          recommendedCoach: feedback.overallRating >= 4 
            ? userData.profile.preferredCoach 
            : suggestAlternativeCoach(userData.profile),
        },
        coachingTips: analysis.recommendations,
        motivationalMessage: analysis.motivationalNote,
        shouldGenerateNewPlan: shouldGenerateNewWorkoutPlan(feedback, performance),
      };
    });

    // Step 5: Trigger new workout generation if needed
    const newWorkoutTriggered = await step.run('trigger-new-workout-if-needed', async () => {
      if (recommendations.shouldGenerateNewPlan) {
        const generationEvent = {
          name: 'workout/generate' as const,
          data: {
            userId,
            coachId: recommendations.nextWorkoutAdjustments.recommendedCoach,
            workoutType: determineNextWorkoutType(recommendations.nextWorkoutAdjustments.focusAreas, userData.profile),
            duration: recommendations.nextWorkoutAdjustments.suggestedDuration,
            equipment: userData.profile.availableEquipment as string[],
            fitnessLevel: userData.profile.fitnessLevel,
            preferences: {
              intensity: recommendations.nextWorkoutAdjustments.intensityLevel === 'maintain' 
                ? undefined 
                : recommendations.nextWorkoutAdjustments.intensityLevel === 'increase' 
                  ? 'high' 
                  : 'low',
            },
          },
        };
        
        await inngest.send(generationEvent);
        return true;
      }
      
      return false;
    });

    return {
      success: true,
      analysis: analysisResult.analysis,
      preferencesUpdated: updatedPreferences.updated,
      recommendations,
      newWorkoutTriggered,
      message: `Successfully adapted training based on feedback. ${newWorkoutTriggered ? 'New workout plan generated.' : ''}`,
    };
  }
);

// Helper functions

function generateFallbackAnalysis(feedback: any, performance: any) {
  let intensityAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';
  
  if (feedback.overallRating <= 2 || feedback.difficulty === 'too_hard') {
    intensityAdjustment = 'decrease';
  } else if (feedback.overallRating >= 4 && feedback.difficulty === 'too_easy') {
    intensityAdjustment = 'increase';
  }
  
  return {
    analysis: `Based on your feedback (${feedback.overallRating}/5 rating), I'm adjusting your future workouts.`,
    recommendations: [
      feedback.overallRating <= 2 ? 'Focus on proper form over intensity' : 'Great job! Let\'s keep building on this progress',
      performance.completedSets / performance.totalSets < 0.7 ? 'Consider longer rest periods between sets' : 'Your completion rate looks good',
      feedback.energyLevel <= 2 ? 'Plan workouts when you have more energy available' : 'Your energy levels are supporting good workouts',
    ],
    intensityAdjustment,
    focusAreas: feedback.difficulty === 'too_hard' ? ['recovery', 'form'] : ['progression', 'variety'],
    motivationalNote: feedback.overallRating >= 4 
      ? 'You\'re doing amazing! Keep up the great work!' 
      : 'Every workout is progress. Let\'s adjust and keep moving forward!',
  };
}

function calculatePreferenceAdjustments(feedback: any, performance: any, analysis: any) {
  const adjustments: any = {};
  
  // Intensity adjustments
  if (analysis.intensityAdjustment !== 'maintain') {
    adjustments.intensityChange = true;
    adjustments.newIntensity = analysis.intensityAdjustment === 'increase' ? 'high' : 'low';
  }
  
  // Variety adjustments based on enjoyment
  if (feedback.enjoymentRating && feedback.enjoymentRating <= 2) {
    adjustments.varietyChange = true;
    adjustments.newVariety = 'high_variety';
  }
  
  // Rest time adjustments
  if (performance.completedSets / performance.totalSets < 0.7) {
    adjustments.restTimeChange = true;
    adjustments.newRestTime = 'extended';
  }
  
  return adjustments;
}

function extractExercisesToAvoid(comments: string): string[] {
  // Simple extraction - in real implementation, this could be more sophisticated
  const exercises: string[] = [];
  const lowercaseComments = comments.toLowerCase();
  
  if (lowercaseComments.includes('burpee')) exercises.push('Burpees');
  if (lowercaseComments.includes('push') && lowercaseComments.includes('up')) exercises.push('Push-ups');
  if (lowercaseComments.includes('plank')) exercises.push('Plank');
  
  return exercises;
}

function extractFavoriteExercises(exerciseFeedback: any): string[] {
  const favorites: string[] = [];
  
  if (exerciseFeedback) {
    for (const [exercise, rating] of Object.entries(exerciseFeedback)) {
      if (typeof rating === 'number' && rating >= 4) {
        favorites.push(exercise);
      }
    }
  }
  
  return favorites;
}

function calculateSuggestedDuration(feedback: any, performance: any, currentDuration: number): number {
  if (feedback.lengthFeedback === 'too_long' || performance.completedSets / performance.totalSets < 0.6) {
    return Math.max(15, currentDuration - 5);
  } else if (feedback.lengthFeedback === 'too_short' && feedback.overallRating >= 4) {
    return Math.min(60, currentDuration + 5);
  }
  
  return currentDuration;
}

function suggestAlternativeCoach(profile: any): string {
  const alternatives = profile.alternativeCoaches as string[] || [];
  return alternatives[0] || profile.preferredCoach;
}

function shouldGenerateNewWorkoutPlan(feedback: any, performance: any): boolean {
  return (
    feedback.overallRating <= 2 || 
    feedback.enjoymentRating <= 2 || 
    performance.completedSets / performance.totalSets < 0.5
  );
}

function determineNextWorkoutType(focusAreas: string[], profile: any): string {
  if (focusAreas.includes('recovery')) return 'flexibility';
  if (focusAreas.includes('cardio')) return 'hiit';
  
  const preferredTypes = profile.preferredWorkoutTypes as string[] || ['strength'];
  return preferredTypes[0] || 'bodyweight';
}