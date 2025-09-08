import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIClientConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

export const DEFAULT_CONFIG: AIClientConfig = {
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4000,
  temperature: 0.7,
};

export interface AIResponse {
  success: boolean;
  content: string | null;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  responseTimeMs: number;
}

export class AIClient {
  private config: AIClientConfig;

  constructor(config: Partial<AIClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async generateResponse(
    systemPrompt: string,
    userPrompt: string,
    options: Partial<AIClientConfig> = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const finalConfig = { ...this.config, ...options };

    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('ANTHROPIC_API_KEY not set, using mock response for POC');
        return this.getMockResponse(startTime);
      }

      const response = await anthropic.messages.create({
        model: finalConfig.model,
        max_tokens: finalConfig.maxTokens,
        temperature: finalConfig.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const responseTimeMs = Date.now() - startTime;
      const content = response.content[0];

      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI');
      }

      return {
        success: true,
        content: content.text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        responseTimeMs,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      console.error('AI Client Error:', error);

      return {
        success: false,
        content: null,
        error: error instanceof Error ? error.message : 'Unknown AI error',
        responseTimeMs,
      };
    }
  }

  // Wrapper for generating workouts specifically
  async generateWorkout(
    systemPrompt: string,
    workoutRequest: string,
    options: Partial<AIClientConfig> = {}
  ): Promise<AIResponse> {
    return this.generateResponse(
      systemPrompt,
      workoutRequest,
      {
        ...options,
        maxTokens: 4000, // Ensure sufficient tokens for workout generation
      }
    );
  }

  // Wrapper for generating motivational messages
  async generateMotivation(
    systemPrompt: string,
    motivationRequest: string,
    options: Partial<AIClientConfig> = {}
  ): Promise<AIResponse> {
    return this.generateResponse(
      systemPrompt,
      motivationRequest,
      {
        ...options,
        maxTokens: 500, // Smaller token limit for motivational messages
        temperature: 0.8, // Higher temperature for more creative motivation
      }
    );
  }

  // Wrapper for workout adaptation
  async adaptWorkout(
    systemPrompt: string,
    adaptationRequest: string,
    options: Partial<AIClientConfig> = {}
  ): Promise<AIResponse> {
    return this.generateResponse(
      systemPrompt,
      adaptationRequest,
      {
        ...options,
        maxTokens: 3000,
        temperature: 0.6, // Lower temperature for more consistent adaptations
      }
    );
  }

  // Mock response for POC when API key is not available
  private getMockResponse(startTime: number): AIResponse {
    const mockWorkoutJson = `[
      {
        "id": 1,
        "name": "Push-ups",
        "sets": 3,
        "reps": "8-12",
        "restTime": 90,
        "instructions": "Keep your core tight and lower your chest to the ground. Push back up with control. You've got this!",
        "hasWeight": false,
        "alternativeExercises": ["Knee Push-ups", "Wall Push-ups", "Incline Push-ups", "Diamond Push-ups", "Wide-Grip Push-ups"]
      },
      {
        "id": 2,
        "name": "Bodyweight Squats",
        "sets": 3,
        "reps": "12-15",
        "restTime": 90,
        "instructions": "Sit back like you're sitting in a chair, keep your chest up and core engaged. Drive through your heels to stand up!",
        "hasWeight": false,
        "alternativeExercises": ["Chair Squats", "Jump Squats", "Sumo Squats", "Single Leg Squats", "Pulse Squats"]
      },
      {
        "id": 3,
        "name": "Dumbbell Rows",
        "sets": 3,
        "reps": "10-12",
        "restTime": 90,
        "instructions": "Pull the weight to your ribs, squeeze your shoulder blades together. Control the weight down!",
        "hasWeight": true,
        "targetWeight": 25,
        "weightUnit": "lbs",
        "alternativeExercises": ["Bent-over Rows", "Single-Arm Rows", "Resistance Band Rows", "Inverted Rows", "T-Bar Rows"]
      },
      {
        "id": 4,
        "name": "Plank Hold",
        "sets": 3,
        "reps": "30-45s",
        "restTime": 60,
        "instructions": "Hold your body in a straight line from head to heels. Keep breathing and stay strong!",
        "hasWeight": false,
        "alternativeExercises": ["Knee Plank", "Side Plank", "Plank Up-Downs", "Mountain Climber Plank", "Plank with Leg Lift"]
      },
      {
        "id": 5,
        "name": "Dumbbell Shoulder Press",
        "sets": 3,
        "reps": "8-10",
        "restTime": 90,
        "instructions": "Press the weights overhead in a controlled motion. Keep your core tight and don't arch your back!",
        "hasWeight": true,
        "targetWeight": 20,
        "weightUnit": "lbs",
        "alternativeExercises": ["Push Press", "Pike Push-ups", "Handstand Push-ups", "Arnold Press", "Military Press"]
      }
    ]`;

    return {
      success: true,
      content: mockWorkoutJson,
      usage: {
        inputTokens: 450,
        outputTokens: 1200,
        totalTokens: 1650,
      },
      responseTimeMs: Date.now() - startTime,
    };
  }
}

// Create a default instance
export const aiClient = new AIClient();