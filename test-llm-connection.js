#!/usr/bin/env node

/**
 * Simple test script to verify Anthropic API connection
 * Run with: node test-llm-connection.js
 */

const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔄 Testing Anthropic API connection...\n');
  
  // Check if API key is set
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found in environment variables');
    console.log('📝 Make sure to set it in .env.local file');
    return;
  }
  
  if (apiKey.includes('test-key') || apiKey.includes('your-real')) {
    console.log('❌ API key appears to be a placeholder');
    console.log('🔑 Please replace with your actual Anthropic API key');
    console.log('   Get one at: https://console.anthropic.com/');
    return;
  }
  
  console.log('✅ API key found and appears valid');
  console.log(`🔑 Key starts with: ${apiKey.substring(0, 20)}...`);
  
  // Test the connection
  try {
    const client = new Anthropic({
      apiKey: apiKey,
    });
    
    console.log('\n🧪 Testing API call...');
    
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Say "FlexFlow LLM connection successful!" and nothing else.'
        }
      ],
    });
    
    const content = response.content[0];
    if (content.type === 'text') {
      console.log('✅ API call successful!');
      console.log('📝 Response:', content.text);
      console.log('📊 Token usage:', response.usage);
      console.log('\n🎉 Your FlexFlow app can now generate real AI workouts!');
      console.log('🏃‍♂️ Try visiting: http://localhost:3000/api/test/workout');
    } else {
      console.log('❌ Unexpected response type:', content.type);
    }
    
  } catch (error) {
    console.log('❌ API call failed:');
    console.log('📄 Error:', error.message);
    
    if (error.status === 401) {
      console.log('🔐 Authentication failed - check your API key');
    } else if (error.status === 429) {
      console.log('⏱️ Rate limited - try again in a moment');
    } else {
      console.log('🔗 Network or API issue');
    }
  }
}

// Run the test
testConnection().catch(console.error);