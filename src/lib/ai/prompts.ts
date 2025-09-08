import coachesData from '@/data/coaches.json';
import type { Exercise } from '@/db/schema';

export interface WorkoutGenerationParams {
  coachId: string;
  workoutType?: string;
  duration?: number;
  fitnessLevel: string;
  equipment: string[];
  primaryGoals: string[];
  preferences: {
    intensity?: string;
    variety?: string;
    restTime?: string;
  };
  limitations?: string;
  previousWorkouts?: any[];
}

export interface MotivationParams {
  coachId: string;
  context: 'pre_workout' | 'during_set' | 'rest' | 'post_workout';
  messageType: 'motivation' | 'instruction' | 'feedback' | 'celebration';
  exerciseData?: any;
  userProgress?: any;
}

export class PromptGenerator {
  // Get coach personality data
  private getCoach(coachId: string) {
    return (coachesData as any)[coachId] || coachesData.MAX;
  }

  // Generate system prompt for workout generation
  generateWorkoutSystemPrompt(coachId: string): string {
    const coach = this.getCoach(coachId);
    
    return `You are ${coach.name}, an AI fitness coach with the following personality:
- Personality: ${coach.personality}
- Specialties: ${coach.specialties.join(', ')}
- Description: ${coach.description}
- Motivational Style: ${coach.motivationalStyle}
- Workout Approach: ${coach.workoutApproach}

Your vocabulary includes words like: ${coach.vocabulary.join(', ')}
Your catchphrases include: ${coach.catchPhrases.join(', ')}

CRITICAL REQUIREMENTS:
1. You MUST respond with ONLY a valid JSON object that matches the Exercise[] TypeScript interface
2. DO NOT include any text before or after the JSON
3. Each exercise MUST have these exact fields: id, name, sets, reps, restTime, instructions, hasWeight, targetWeight?, weightUnit?, alternativeExercises?
4. The "reps" field should be a string like "8-12" or "30s" for time-based exercises
5. Include 3-5 alternative exercises for each main exercise
6. Write instructions in your coaching voice and personality
7. Use your vocabulary and style throughout the instructions
8. Set appropriate rest times based on your coaching approach

Example format:
[
  {
    "id": 1,
    "name": "Exercise Name",
    "sets": 3,
    "reps": "8-12",
    "restTime": 120,
    "instructions": "Your coaching instructions here using your vocabulary and style",
    "hasWeight": true,
    "targetWeight": 135,
    "weightUnit": "lbs",
    "alternativeExercises": ["Alternative 1", "Alternative 2", "Alternative 3", "Alternative 4", "Alternative 5"]
  }
]`;
  }

  // Generate user prompt for workout generation
  generateWorkoutUserPrompt(params: WorkoutGenerationParams): string {
    const coach = this.getCoach(params.coachId);
    
    return `Generate a ${params.duration || 30}-minute ${params.workoutType || 'strength'} workout for:

FITNESS PROFILE:
- Level: ${params.fitnessLevel}
- Goals: ${params.primaryGoals.join(', ')}
- Available Equipment: ${params.equipment.length > 0 ? params.equipment.join(', ') : 'Bodyweight only'}
${params.limitations ? `- Limitations: ${params.limitations}` : ''}

PREFERENCES:
- Intensity: ${params.preferences.intensity || 'moderate'}
- Variety: ${params.preferences.variety || 'balanced'}
- Rest Time: ${params.preferences.restTime || 'standard'}

Create a workout that:
1. Matches your coaching style (${coach.workoutApproach})
2. Uses your personality in all exercise instructions
3. Is appropriate for the fitness level and goals
4. Works with the available equipment
5. Follows your rest period style (${coach.restPeriodStyle})

Include 4-6 exercises total. Make each exercise instruction authentic to your voice as ${coach.name}.`;
  }

  // Generate system prompt for motivational messages
  generateMotivationSystemPrompt(coachId: string): string {
    const coach = this.getCoach(coachId);
    
    return `You are ${coach.name}, an AI fitness coach. Generate a motivational message using your unique personality:

PERSONALITY:
- Style: ${coach.motivationalStyle}
- Vocabulary: ${coach.vocabulary.join(', ')}
- Catchphrases: ${coach.catchPhrases.join(', ')}
- Feedback Style: ${coach.feedbackStyle}

REQUIREMENTS:
1. Keep messages under 100 words
2. Use your authentic voice and vocabulary
3. Be encouraging and supportive in your unique way
4. Match the context and message type requested
5. Include emojis that fit your personality
6. Make it feel personal and authentic

Return only the motivational message text, nothing else.`;
  }

  // Generate user prompt for motivational messages  
  generateMotivationUserPrompt(params: MotivationParams): string {
    let contextDescription = '';
    
    switch (params.context) {
      case 'pre_workout':
        contextDescription = 'before starting their workout';
        break;
      case 'during_set':
        contextDescription = 'during an exercise set';
        break;
      case 'rest':
        contextDescription = 'during rest between sets';
        break;
      case 'post_workout':
        contextDescription = 'after completing their workout';
        break;
    }

    let messageTypeDescription = '';
    switch (params.messageType) {
      case 'motivation':
        messageTypeDescription = 'motivational encouragement';
        break;
      case 'instruction':
        messageTypeDescription = 'helpful instruction or tip';
        break;
      case 'feedback':
        messageTypeDescription = 'positive feedback on their performance';
        break;
      case 'celebration':
        messageTypeDescription = 'celebration of their achievement';
        break;
    }

    return `Generate a ${messageTypeDescription} message for a user ${contextDescription}.
    
${params.exerciseData ? `Current Exercise: ${params.exerciseData.name}` : ''}
${params.userProgress ? `Progress Context: ${JSON.stringify(params.userProgress)}` : ''}

Make it authentic to your coaching style and personality.`;
  }

  // Generate system prompt for workout adaptation
  generateAdaptationSystemPrompt(coachId: string): string {
    const coach = this.getCoach(coachId);
    
    return `You are ${coach.name}, an AI fitness coach. Based on user feedback and performance, adapt future workouts:

YOUR COACHING APPROACH:
- Style: ${coach.workoutApproach}
- Personality: ${coach.personality}
- Specialties: ${coach.specialties.join(', ')}

ADAPTATION PRINCIPLES:
1. Analyze feedback for difficulty, enjoyment, and energy levels
2. Suggest specific modifications for future workouts
3. Maintain your coaching personality in recommendations
4. Focus on sustainable progression
5. Address any concerns or limitations mentioned

Respond with a JSON object containing:
{
  "analysis": "Your analysis of their feedback in your coaching voice",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "intensityAdjustment": "increase|maintain|decrease",
  "focusAreas": ["area1", "area2"],
  "motivationalNote": "Personal encouragement in your voice"
}`;
  }

  // Generate user prompt for workout adaptation
  generateAdaptationUserPrompt(feedback: any, performance: any): string {
    return `Analyze this workout feedback and performance data:

FEEDBACK:
- Overall Rating: ${feedback.overallRating}/5
- Energy Level: ${feedback.energyLevel}/5  
- Difficulty: ${feedback.difficulty}
- Enjoyment: ${feedback.enjoyment}/5
- Comments: "${feedback.comments || 'No comments'}"

PERFORMANCE:
- Completed Sets: ${performance.completedSets}/${performance.totalSets}
- Exercise Feedback: ${JSON.stringify(performance.exerciseFeedback)}

Provide coaching analysis and recommendations for future workouts based on this data.`;
  }
}

// Create a default instance
export const promptGenerator = new PromptGenerator();