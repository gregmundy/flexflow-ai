# FlexFlow AI Workout Generation System

This document describes the comprehensive AI-powered workout generation system implemented for FlexFlow.

## 🚀 System Overview

FlexFlow now includes a complete AI-driven workout generation system that:
- Generates personalized workouts using Claude AI
- Adapts workouts based on user feedback 
- Maintains coach personalities and styles
- Handles scheduling and progression
- Provides robust error handling and fallbacks

## 🏗️ Architecture

### Core Components

1. **Drizzle ORM Database Layer** (`src/db/`)
   - PostgreSQL schema with complete workout data model
   - Type-safe database operations
   - Migration support

2. **Inngest Functions** (`src/inngest/`)
   - `generateWorkout`: AI-powered workout creation
   - `scheduleWorkouts`: Automatic workout scheduling 
   - `adaptWorkout`: Feedback-based workout adaptation

3. **AI Integration** (`src/lib/ai/`)
   - Anthropic Claude integration
   - Coach-specific prompt generation
   - Response parsing and validation
   - Fallback systems

4. **API Routes** (`src/app/api/`)
   - REST endpoints for all workout operations
   - Request validation with Zod schemas
   - Error handling and logging

## 🎯 Key Features

### AI-Powered Generation
- **9 Unique Coach Personalities**: MAX, SAGE, KAI, ZARA, ACE, NOVA, BLAZE, RILEY, MARCO
- **Coach-Specific Prompts**: Each coach has unique vocabulary, style, and approach
- **Structured Output**: Validates against TypeScript Exercise interface
- **Fallback System**: Always provides workouts even if AI fails

### Adaptive Learning
- **Feedback Analysis**: AI analyzes workout feedback and performance
- **Preference Updates**: Automatically adjusts user preferences based on feedback
- **Progressive Difficulty**: Adapts intensity based on completion rates and ratings
- **Exercise Substitution**: Learns which exercises to avoid or favor

### Robust Reliability
- **Error Handling**: Comprehensive error catching and logging
- **Fallback Workouts**: Pre-defined workouts when AI is unavailable
- **Validation**: Multiple layers of data validation
- **Monitoring**: Complete AI interaction logging for improvement

## 📋 Database Schema

### Core Tables
- `user_profiles`: User fitness profiles and preferences
- `user_preferences`: Detailed AI training preferences
- `workout_plans`: Generated workout templates 
- `workouts`: Individual workout sessions
- `workout_sets`: Detailed set performance data
- `workout_feedback`: User feedback and ratings
- `ai_generation_logs`: AI interaction monitoring
- `exercise_templates`: Exercise library for AI reference

## 🔧 Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flexflow_dev"

# Inngest
INNGEST_APP_ID="flexflow"
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# AI Provider
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### 2. Database Setup
```bash
# Generate and run migrations
yarn drizzle-kit generate
yarn drizzle-kit push
```

### 3. Development Server
```bash
yarn dev
```

### 4. Inngest Dev Server (separate terminal)
```bash
npx inngest-cli@latest dev
```

## 🎮 API Usage

### Generate Workout
```typescript
POST /api/workouts/generate
{
  "userId": "user-uuid",
  "coachId": "MAX", 
  "workoutType": "strength",
  "duration": 30,
  "equipment": ["dumbbells", "bench"],
  "fitnessLevel": "INTERMEDIATE"
}
```

### Schedule Workouts
```typescript
POST /api/workouts/schedule
{
  "userId": "user-uuid",
  "frequency": 3,
  "preferredTimeSlots": ["08:00", "18:00"],
  "duration": 30
}
```

### Submit Feedback
```typescript
POST /api/workouts/feedback
{
  "userId": "user-uuid",
  "workoutId": "workout-uuid",
  "feedback": {
    "overallRating": 4,
    "energyLevel": 3,
    "difficulty": "just_right",
    "enjoyment": 5,
    "comments": "Loved the variety!"
  },
  "performance": {
    "completedSets": 12,
    "totalSets": 12,
    "exerciseFeedback": {}
  }
}
```

## 🧠 AI Coach Personalities

Each coach has distinct characteristics:

### MAX 💪
- **Style**: Intense, motivational powerhouse
- **Vocabulary**: "crush it", "beast mode", "dominate"
- **Focus**: Strength training, heavy lifting
- **Approach**: High intensity, challenging

### SAGE 🧘  
- **Style**: Mindful, wisdom-focused
- **Vocabulary**: "honor your body", "breathe deeply", "find balance"
- **Focus**: Flexibility, mobility, mindfulness
- **Approach**: Gentle progression, meditative

### ZARA ⚡
- **Style**: Energetic, celebratory
- **Vocabulary**: "superstar", "amazing", "energy explosion"
- **Focus**: HIIT, bodyweight, cardio
- **Approach**: High energy, enthusiastic

*... and 6 more unique personalities*

## 🔍 Testing the System

### Basic Workflow Test
1. Create a user profile via API
2. Generate a workout for that user
3. Submit feedback on the workout
4. Check if adaptation occurred

### Example using the WorkoutGenerator utility:
```typescript
import { WorkoutGenerator } from '@/lib/workout/generator';

// Generate workout
const result = await WorkoutGenerator.generateWorkout({
  userId: 'test-user-id',
  coachId: 'MAX',
  workoutType: 'strength',
  duration: 30,
  fitnessLevel: 'INTERMEDIATE'
});

// Get available coaches
const coaches = WorkoutGenerator.getAvailableCoaches();
```

## 🚨 Error Handling

The system includes multiple fallback layers:
1. **AI Response Parsing**: Falls back to simplified parsing if structured parsing fails
2. **Fallback Workouts**: Pre-defined workouts when AI is completely unavailable
3. **Request Validation**: Zod schemas prevent invalid data from entering the system
4. **Database Transactions**: Ensure data consistency
5. **Comprehensive Logging**: All AI interactions are logged for debugging

## 📈 Performance Considerations

- **Inngest Concurrency**: Limited concurrent AI generations to prevent API rate limits
- **Database Indexing**: Proper indexes on frequently queried fields
- **Caching**: Coach data cached as JSON file
- **Token Optimization**: Efficient prompts to minimize AI token usage
- **Batch Operations**: Multiple database operations grouped into transactions

## 🔄 Integration with Existing System

The new AI system maintains full compatibility with the existing workout page:
- **Exercise Interface**: Matches existing TypeScript interface exactly
- **Coach System**: Integrates with existing coach selection
- **Workout Flow**: Works with existing workout execution components
- **Data Migration**: Can convert existing static workouts to AI-generated format

## 🛡️ Security & Privacy

- **Data Validation**: All inputs validated before processing
- **API Keys**: Secure storage of AI provider credentials
- **User Data**: Minimal PII stored, focus on workout preferences
- **Error Logging**: Sanitized logs without sensitive data

## 🚀 Future Enhancements

The system is designed to support:
- **Multiple AI Providers**: Easy addition of OpenAI or other providers
- **Advanced Analytics**: Workout success pattern analysis
- **Social Features**: Sharing workouts between users
- **Wearable Integration**: Heart rate and performance data integration
- **Nutritional Guidance**: AI-generated meal planning

## 📱 Mobile & SMS Integration

Ready for SMS delivery:
- **Workout Summaries**: Concise workout descriptions for SMS
- **Progress Updates**: Automated check-ins and encouragement
- **Scheduling Reminders**: Smart notification timing
- **Coach Messages**: Personality-appropriate motivational texts

This AI workout generation system transforms FlexFlow from static templates into a truly personalized, adaptive fitness coaching platform powered by cutting-edge AI technology.