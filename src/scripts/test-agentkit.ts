/**
 * Test script for AgentKit trainer integration
 * 
 * This script tests the AgentKit trainer agents to ensure they can generate
 * workouts with authentic trainer personalities.
 */

import { createWorkoutNetwork, trainerAgents, generateFallbackWorkout } from '@/lib/ai/agentkit-trainers';

async function testTrainerAgent(coachId: string) {
  console.log(`\n🤖 Testing ${coachId} trainer agent...`);
  
  try {
    // Create network for this trainer
    const network = createWorkoutNetwork(coachId);
    
    // Set up test parameters
    const testParams = {
      workoutType: 'strength',
      duration: 30,
      fitnessLevel: 'intermediate',
      equipment: ['dumbbells', 'resistance_bands'],
      primaryGoals: ['build_strength', 'muscle_tone'],
      preferences: {
        intensity: 'moderate',
        variety: 'balanced',
        restTime: 'standard',
      },
    };
    
    // Set initial state
    network.state.data = {
      params: testParams,
      userProfile: {
        profile: {
          fitnessLevel: 'intermediate',
          availableEquipment: ['dumbbells', 'resistance_bands'],
          primaryGoals: ['build_strength', 'muscle_tone'],
          injuriesLimitations: null,
        },
        preferences: {
          workoutIntensityPreference: 'moderate',
          exerciseVarietyPreference: 'balanced',
          restTimePreferences: 'standard',
        },
      },
    };
    
    const prompt = `Generate a 30-minute strength workout for an intermediate user with dumbbells and resistance bands. Focus on building strength and muscle tone.`;
    
    console.log(`   📝 Prompt: ${prompt.substring(0, 100)}...`);
    
    // Test the network
    const startTime = Date.now();
    const result = await network.run(prompt);
    const endTime = Date.now();
    
    const finalState = network.state.data;
    
    console.log(`   ⏱️  Generation time: ${endTime - startTime}ms`);
    console.log(`   ✅ Validation passed: ${finalState.validationPassed}`);
    console.log(`   🏋️  Exercise count: ${finalState.generatedWorkout?.length || 0}`);
    
    if (finalState.validationPassed && finalState.generatedWorkout) {
      console.log(`   🎯 Sample exercise: ${finalState.generatedWorkout[0]?.name}`);
      console.log(`   💬 Sample instruction: ${finalState.generatedWorkout[0]?.instructions.substring(0, 100)}...`);
    }
    
    return {
      success: finalState.validationPassed || false,
      exerciseCount: finalState.generatedWorkout?.length || 0,
      responseTime: endTime - startTime,
    };
    
  } catch (error) {
    console.error(`   ❌ Error testing ${coachId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function testFallbackWorkouts() {
  console.log(`\n🔄 Testing fallback workout generation...`);
  
  const testCases = [
    { workoutType: 'strength', fitnessLevel: 'beginner', coachId: 'MAX' },
    { workoutType: 'cardio', fitnessLevel: 'intermediate', coachId: 'ZARA' },
    { workoutType: 'flexibility', fitnessLevel: 'advanced', coachId: 'SAGE' },
  ];
  
  testCases.forEach(({ workoutType, fitnessLevel, coachId }, index) => {
    const fallbackWorkout = generateFallbackWorkout(workoutType, fitnessLevel, coachId);
    console.log(`   ${index + 1}. ${coachId} ${workoutType} (${fitnessLevel}): ${fallbackWorkout.length} exercises`);
  });
}

async function runAllTests() {
  console.log('🚀 Starting AgentKit trainer tests...\n');
  
  // Test fallback system first
  await testFallbackWorkouts();
  
  // Test all trainer agents
  const trainerIds = Object.keys(trainerAgents);
  const results: Record<string, any> = {};
  
  for (const coachId of trainerIds) {
    results[coachId] = await testTrainerAgent(coachId);
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const successful = Object.entries(results).filter(([_, result]) => result.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful > 0) {
    const avgResponseTime = Object.values(results)
      .filter((r: any) => r.success && r.responseTime)
      .reduce((sum: number, r: any) => sum + r.responseTime, 0) / successful;
    console.log(`⏱️  Average response time: ${Math.round(avgResponseTime)}ms`);
  }
  
  console.log('\n🎯 Individual Results:');
  Object.entries(results).forEach(([coach, result]) => {
    const status = result.success ? '✅' : '❌';
    const details = result.success 
      ? `${result.exerciseCount} exercises, ${result.responseTime}ms`
      : result.error;
    console.log(`   ${status} ${coach}: ${details}`);
  });
  
  console.log('\n🤖 AgentKit trainer testing complete!');
}

// Check if this script is being run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testTrainerAgent, testFallbackWorkouts, runAllTests };