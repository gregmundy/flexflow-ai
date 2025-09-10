/**
 * FlexFlow AI Onboarding API Usage Examples
 * 
 * This file contains comprehensive examples of how to use the onboarding API system
 * for processing user onboarding data and creating user profiles.
 */

// Example onboarding data structure
export const exampleOnboardingData = {
  // Step 2: Fitness Focus Areas
  fitnessAreas: ['STRENGTH', 'MUSCLE_GAIN', 'GENERAL_FITNESS'],
  
  // Step 3: Activity Level
  exerciseFrequency: '3-4 times per week',
  exerciseIntensity: 'moderate',
  
  // Step 4: Experience Level
  experienceLevel: 'intermediate' as const,
  
  // Step 5: Workout Preferences
  workoutDuration: 45, // minutes
  availableEquipment: ['dumbbells', 'resistance_bands', 'yoga_mat'],
  workoutTypes: ['STRENGTH', 'HIIT'],
  
  // Step 6: Schedule Preferences
  preferredDays: ['monday', 'wednesday', 'friday', 'saturday'],
  preferredTime: '07:00',
  smsReminderTiming: '30 minutes before',
  smsConsent: true,
  
  // Step 7: Movement Preferences
  movementsToAvoid: ['jumping', 'high_impact'],
  
  // Step 8: Trainer Selection
  selectedTrainer: 'MAX',
  
  // Compliance
  healthDisclaimer: true,
  privacyConsent: true,
  
  // Optional user identification
  email: 'user@example.com',
  phoneNumber: '+1234567890',
};

/**
 * Example 1: Save onboarding data (anonymous user)
 */
export const saveOnboardingDataExample = async () => {
  try {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'unique-session-id-123', // Optional session tracking
      },
      body: JSON.stringify(exampleOnboardingData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Onboarding saved:', result.data);
      // Result includes:
      // - onboardingId: string
      // - userId?: string
      // - userProfile?: object (if profile was created)
      // - aiPromptData: string (ready for AI workout generation)
      
      return result.data;
    } else {
      console.error('Failed to save onboarding:', result.error);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error saving onboarding:', error);
    throw error;
  }
};

/**
 * Example 2: Save onboarding data with immediate profile creation (authenticated user)
 */
export const saveOnboardingWithUserExample = async (userId: string) => {
  try {
    const onboardingDataWithUser = {
      ...exampleOnboardingData,
      userId, // This will trigger immediate profile creation
    };

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token', // If using authentication
      },
      body: JSON.stringify(onboardingDataWithUser),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Onboarding and profile created:', result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error saving onboarding with user:', error);
    throw error;
  }
};

/**
 * Example 3: Retrieve user preferences by user ID
 */
export const getUserPreferencesExample = async (userId: string) => {
  try {
    const response = await fetch(`/api/onboarding/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer your-jwt-token',
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('User preferences:', result.data);
      // Result includes structured preferences:
      // - fitnessProfile: { level, areas, goals }
      // - activityProfile: { frequency, intensity, duration, types }
      // - equipment: { available, limitations }
      // - schedule: { preferredDays, preferredTime, reminderTiming, smsEnabled }
      // - coaching: { selectedTrainer }
      // - aiPromptData: string (ready for AI)
      
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error retrieving user preferences:', error);
    throw error;
  }
};

/**
 * Example 4: Update user preferences
 */
export const updateUserPreferencesExample = async (userId: string, updates: Partial<typeof exampleOnboardingData>) => {
  try {
    const response = await fetch(`/api/onboarding/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Preferences updated:', result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

/**
 * Example 5: Create user profile from existing onboarding data
 */
export const createUserProfileExample = async (onboardingId: string) => {
  try {
    const response = await fetch('/api/onboarding/create-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ onboardingId }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('User profile created:', result.data);
      // Result includes:
      // - userProfile: { id, email, fitnessLevel, primaryGoals, etc. }
      // - preferences: { workoutIntensityPreference, reminderTime, etc. }
      
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Example 6: Retrieve onboarding data by session ID (anonymous users)
 */
export const getOnboardingBySessionExample = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/onboarding?sessionId=${sessionId}`, {
      method: 'GET',
    });

    const result = await response.json();

    if (result.success) {
      console.log('Onboarding data:', result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error retrieving onboarding by session:', error);
    throw error;
  }
};

/**
 * Example 7: Generate AI workout prompt from user preferences
 */
export const generateWorkoutPromptExample = async (userId: string) => {
  try {
    // Get user preferences first
    const preferences = await getUserPreferencesExample(userId);
    
    // The aiPromptData is already included in the preferences response
    const aiPrompt = preferences.aiPromptData;
    
    console.log('AI Workout Prompt:', aiPrompt);
    
    // Now you can use this prompt with your AI service
    // Example with Anthropic Claude:
    /*
    const workoutResponse = await fetch('/api/workouts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        prompt: aiPrompt,
        trainerPersonality: preferences.coaching.selectedTrainer,
      }),
    });
    */
    
    return aiPrompt;
  } catch (error) {
    console.error('Error generating workout prompt:', error);
    throw error;
  }
};

/**
 * Example 8: Complete onboarding flow for React component
 */
export class OnboardingFlow {
  private sessionId: string;
  private onboardingData: any = {};

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Step-by-step data collection
  async saveStep(stepNumber: number, stepData: any) {
    this.onboardingData = { ...this.onboardingData, ...stepData };
    
    // Save to localStorage for persistence
    localStorage.setItem(`onboarding_${this.sessionId}`, JSON.stringify(this.onboardingData));
  }

  // Final submission
  async submitOnboarding(userId?: string) {
    try {
      const finalData = {
        ...this.onboardingData,
        ...(userId && { userId }),
      };

      const result = await saveOnboardingDataExample();
      
      // Clear localStorage after successful submission
      localStorage.removeItem(`onboarding_${this.sessionId}`);
      
      return result;
    } catch (error) {
      console.error('Failed to submit onboarding:', error);
      throw error;
    }
  }

  // Recovery from localStorage
  recoverOnboardingData() {
    const saved = localStorage.getItem(`onboarding_${this.sessionId}`);
    if (saved) {
      this.onboardingData = JSON.parse(saved);
    }
    return this.onboardingData;
  }
}

/**
 * Example 9: Error handling patterns
 */
export const handleOnboardingErrors = (error: any) => {
  if (error.status === 400) {
    // Validation errors
    console.error('Validation failed:', error.details);
    return { type: 'validation', errors: error.details };
  }
  
  if (error.status === 429) {
    // Rate limiting
    console.error('Rate limited:', error.message);
    return { type: 'rate_limit', message: 'Please try again later' };
  }
  
  if (error.status === 409) {
    // Conflict (e.g., user already exists)
    console.error('Conflict:', error.message);
    return { type: 'conflict', message: error.message };
  }
  
  if (error.status === 404) {
    // Not found
    console.error('Not found:', error.message);
    return { type: 'not_found', message: error.message };
  }
  
  // General server error
  console.error('Server error:', error);
  return { type: 'server_error', message: 'Something went wrong. Please try again.' };
};

/**
 * Example 10: TypeScript interfaces for API responses
 */
export interface OnboardingResponse {
  success: boolean;
  data?: {
    onboardingId: string;
    userId?: string;
    userProfile?: {
      id: string;
      email: string;
      fitnessLevel: string;
    };
    aiPromptData: string;
    message: string;
  };
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface UserPreferencesResponse {
  success: boolean;
  data?: {
    id: string;
    userId: string;
    fitnessProfile: {
      level: string;
      areas: string[];
      goals: string[];
    };
    activityProfile: {
      frequency: string;
      intensity: string;
      duration: number;
      types: string[];
    };
    equipment: {
      available: string[];
      limitations: string[];
    };
    schedule: {
      preferredDays: string[];
      preferredTime: string;
      reminderTiming: string;
      smsEnabled: boolean;
    };
    coaching: {
      selectedTrainer: string;
    };
    aiPromptData: string;
  };
  error?: string;
  message?: string;
}

/**
 * Example 11: Integration with AI workout generation
 */
export const integrateWithAIWorkoutGeneration = async (userId: string) => {
  try {
    // 1. Get user preferences
    const preferences = await getUserPreferencesExample(userId);
    
    // 2. Generate workout using AI prompt
    const workoutRequest = {
      userId,
      prompt: preferences.aiPromptData,
      trainerPersonality: preferences.coaching.selectedTrainer,
      duration: preferences.activityProfile.duration,
      equipment: preferences.equipment.available,
    };
    
    // 3. Call existing workout generation API
    const workoutResponse = await fetch('/api/workouts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workoutRequest),
    });
    
    const workout = await workoutResponse.json();
    
    if (workout.success) {
      console.log('Generated workout:', workout.data);
      return workout.data;
    } else {
      throw new Error(workout.message);
    }
  } catch (error) {
    console.error('Error integrating with AI workout generation:', error);
    throw error;
  }
};

/**
 * Example 12: SMS integration for reminders
 */
export const setupSMSReminders = async (userId: string) => {
  try {
    const preferences = await getUserPreferencesExample(userId);
    
    if (!preferences.schedule.smsEnabled) {
      console.log('SMS reminders not enabled for user');
      return;
    }
    
    // Setup SMS reminder based on user preferences
    const reminderData = {
      userId,
      phoneNumber: preferences.phoneNumber,
      reminderTime: preferences.schedule.reminderTime,
      reminderTiming: preferences.schedule.reminderTiming,
      workoutDays: preferences.schedule.preferredDays,
      trainerPersonality: preferences.coaching.selectedTrainer,
    };
    
    // Call SMS service API (implement based on your SMS provider)
    const smsResponse = await fetch('/api/sms/setup-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderData),
    });
    
    return await smsResponse.json();
  } catch (error) {
    console.error('Error setting up SMS reminders:', error);
    throw error;
  }
};