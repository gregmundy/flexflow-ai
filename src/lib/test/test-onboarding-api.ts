/**
 * Test script for onboarding API endpoints
 * Run this in a browser console or Node.js environment
 */

const BASE_URL = 'http://localhost:3002';

// Test data
const testOnboardingData = {
  fitnessAreas: ['STRENGTH', 'MUSCLE_GAIN'],
  exerciseFrequency: '3-4 times per week',
  exerciseIntensity: 'moderate',
  experienceLevel: 'intermediate' as const,
  workoutDuration: 45,
  availableEquipment: ['dumbbells', 'resistance_bands'],
  workoutTypes: ['STRENGTH', 'HIIT'],
  preferredDays: ['monday', 'wednesday', 'friday'],
  preferredTime: '07:00',
  smsReminderTiming: '30 minutes before',
  smsConsent: true,
  movementsToAvoid: ['jumping'],
  selectedTrainer: 'MAX',
  healthDisclaimer: true,
  privacyConsent: true,
  email: 'test@example.com',
};

/**
 * Test 1: Save onboarding data
 */
export async function testSaveOnboarding() {
  console.log('🧪 Testing POST /api/onboarding...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': 'test-session-123',
      },
      body: JSON.stringify(testOnboardingData),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Save onboarding test passed');
      console.log('📝 Onboarding ID:', result.data.onboardingId);
      console.log('🤖 AI Prompt generated:', !!result.data.aiPromptData);
      return result.data;
    } else {
      console.error('❌ Save onboarding test failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Save onboarding test error:', error);
    return null;
  }
}

/**
 * Test 2: Retrieve onboarding data by session
 */
export async function testGetOnboardingBySession(sessionId: string = 'test-session-123') {
  console.log('🧪 Testing GET /api/onboarding?sessionId=...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/onboarding?sessionId=${sessionId}`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Get onboarding by session test passed');
      console.log('📊 Data retrieved:', !!result.data);
      return result.data;
    } else {
      console.error('❌ Get onboarding by session test failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Get onboarding by session test error:', error);
    return null;
  }
}

/**
 * Test 3: Create user profile from onboarding
 */
export async function testCreateProfile(onboardingId: string) {
  console.log('🧪 Testing POST /api/onboarding/create-profile...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/onboarding/create-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ onboardingId }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Create profile test passed');
      console.log('👤 User Profile ID:', result.data.userProfile.id);
      console.log('⚙️ Preferences ID:', result.data.preferences.id);
      return result.data;
    } else {
      console.error('❌ Create profile test failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Create profile test error:', error);
    return null;
  }
}

/**
 * Test 4: Get user preferences (requires userId from profile creation)
 */
export async function testGetUserPreferences(userId: string) {
  console.log(`🧪 Testing GET /api/onboarding/${userId}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/onboarding/${userId}`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Get user preferences test passed');
      console.log('🎯 Fitness Profile:', result.data.fitnessProfile);
      console.log('🏃 Activity Profile:', result.data.activityProfile);
      console.log('🤖 AI Prompt available:', !!result.data.aiPromptData);
      return result.data;
    } else {
      console.error('❌ Get user preferences test failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Get user preferences test error:', error);
    return null;
  }
}

/**
 * Test 5: Update user preferences
 */
export async function testUpdateUserPreferences(userId: string) {
  console.log(`🧪 Testing PUT /api/onboarding/${userId}...`);
  
  const updates = {
    workoutDuration: 60, // Changed from 45 to 60
    exerciseIntensity: 'high', // Changed from moderate to high
    selectedTrainer: 'ZARA', // Changed from MAX to ZARA
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/onboarding/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Update user preferences test passed');
      console.log('📝 Updated at:', result.data.updatedAt);
      console.log('🤖 New AI Prompt generated:', !!result.data.aiPromptData);
      return result.data;
    } else {
      console.error('❌ Update user preferences test failed:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Update user preferences test error:', error);
    return null;
  }
}

/**
 * Run all tests in sequence
 */
export async function runAllTests() {
  console.log('🚀 Starting onboarding API tests...\n');
  
  // Test 1: Save onboarding data
  const saveResult = await testSaveOnboarding();
  if (!saveResult) {
    console.log('❌ Test suite failed at save onboarding');
    return;
  }
  
  console.log('\n---\n');
  
  // Test 2: Retrieve by session
  const getResult = await testGetOnboardingBySession();
  if (!getResult) {
    console.log('❌ Test suite failed at get onboarding by session');
    return;
  }
  
  console.log('\n---\n');
  
  // Test 3: Create profile
  const profileResult = await testCreateProfile(saveResult.onboardingId);
  if (!profileResult) {
    console.log('❌ Test suite failed at create profile');
    return;
  }
  
  const userId = profileResult.userProfile.id;
  console.log('\n---\n');
  
  // Test 4: Get user preferences
  const preferencesResult = await testGetUserPreferences(userId);
  if (!preferencesResult) {
    console.log('❌ Test suite failed at get user preferences');
    return;
  }
  
  console.log('\n---\n');
  
  // Test 5: Update preferences
  const updateResult = await testUpdateUserPreferences(userId);
  if (!updateResult) {
    console.log('❌ Test suite failed at update user preferences');
    return;
  }
  
  console.log('\n🎉 All onboarding API tests passed successfully!');
  console.log('\n📊 Test Summary:');
  console.log('✅ Save onboarding data');
  console.log('✅ Retrieve onboarding by session');
  console.log('✅ Create user profile');
  console.log('✅ Get user preferences');
  console.log('✅ Update user preferences');
  
  return {
    onboardingId: saveResult.onboardingId,
    userId,
    profileId: profileResult.userProfile.id,
    success: true,
  };
}

/**
 * Test validation errors
 */
export async function testValidationErrors() {
  console.log('🧪 Testing validation errors...');
  
  const invalidData = {
    fitnessAreas: [], // Invalid: empty array
    exerciseFrequency: '', // Invalid: empty string
    experienceLevel: 'invalid' as any, // Invalid: not in enum
    workoutDuration: 5, // Invalid: too short
    // Missing required fields
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });

    const result = await response.json();
    
    if (response.status === 400 && result.error === 'Validation failed') {
      console.log('✅ Validation error handling test passed');
      console.log('📝 Validation errors:', result.details);
      return true;
    } else {
      console.error('❌ Validation error handling test failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Validation error handling test error:', error);
    return false;
  }
}

// Export for use in browser console or testing framework
if (typeof window !== 'undefined') {
  (window as any).testOnboardingAPI = {
    runAllTests,
    testSaveOnboarding,
    testGetOnboardingBySession,
    testCreateProfile,
    testGetUserPreferences,
    testUpdateUserPreferences,
    testValidationErrors,
  };
}