# AgentKit Integration Setup Guide

## Overview

This guide documents the integration of **Inngest AgentKit** into FlexFlow's workout generation system. AgentKit provides sophisticated multi-agent workflows where each of our 9 fitness trainers is powered by a specialized AI agent with authentic personality-driven workout generation.

## What Was Implemented

### 1. **AgentKit Trainer Agents** (`src/lib/ai/agentkit-trainers.ts`)
- **9 Specialized Agents**: One for each trainer personality (MAX, SAGE, ZARA, etc.)
- **Personality-Driven Generation**: Each agent uses authentic trainer vocabulary and coaching style
- **Structured Validation**: Zod schema validation for workout JSON output
- **Smart Fallbacks**: Automatic fallback workout generation if AI validation fails

### 2. **AgentKit Workout Generation Function** (`src/inngest/functions/generate-workout-agentkit.ts`)
- **Multi-step Inngest Workflow**: User profile → AgentKit generation → Database storage
- **Network State Management**: Shares data between agents using AgentKit's state system
- **Comprehensive Logging**: Tracks AgentKit performance vs legacy system
- **Backward Compatibility**: Works alongside existing workout generation

### 3. **AgentKit Server** (`src/lib/ai/agentkit-server.ts`)
- **Network Hosting**: Hosts all 9 trainer agent networks
- **HTTP Integration**: Makes agents available via REST endpoints
- **Health Monitoring**: Status checking for all trainer agents

### 4. **API Integration** (`src/app/api/workouts/generate-agentkit/route.ts`)
- **New Endpoint**: `/api/workouts/generate-agentkit` for AgentKit-powered generation
- **Request Validation**: Zod schema validation for API requests
- **Trainer Selection**: Dynamic agent selection based on coach ID

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Frontend       │────│  API Route       │────│  Inngest Function   │
│  Workout Request│    │  /generate-agentkit   │  generate-workout-   │
└─────────────────┘    └──────────────────┘    │  agentkit           │
                                                └─────────────────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AgentKit Network                               │
├─────────────────────────────────────────────────────────────────────┤
│  Trainer Agents:                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
│  │   MAX   │ │  SAGE   │ │  ZARA   │ │   ACE   │ │ NOVA/BLAZE  │  │ 
│  │ Agent   │ │ Agent   │ │ Agent   │ │ Agent   │ │ /RILEY/KAI/ │  │
│  │         │ │         │ │         │ │         │ │ MARCO Agents│  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │
│                                                                     │
│  Shared Tools:                                                     │  
│  • get_user_profile   • validate_and_save_workout                  │
│                                                                     │
│  Router Logic: Select agent based on coachId                       │
└─────────────────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Database Storage                               │
│  • Workout Plans      • AI Generation Logs      • Exercise Data    │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Features

### 🤖 **Authentic Trainer Personalities**
- Each agent uses trainer-specific vocabulary, catchphrases, and coaching approaches
- Exercise instructions written in authentic trainer voices
- Rest periods and workout intensity match trainer specialties

### 🔧 **Multi-Agent Tools**
- **`get_user_profile`**: Accesses user fitness data and preferences
- **`validate_and_save_workout`**: Validates workout JSON and saves to network state
- **Zod Schema Validation**: Ensures workout data integrity

### 🎯 **Smart Routing**
- Simple router logic: run selected trainer agent once
- Automatic completion when workout is validated
- Fallback handling if validation fails

### 📊 **Enhanced Monitoring**
- AgentKit-specific logging in `ai_generation_logs` table
- Performance comparison between AgentKit and legacy systems
- Success/failure tracking with fallback metrics

## Setup Instructions

### 1. **Environment Variables**
Add to your `.env` file:
```bash
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
INNGEST_EVENT_KEY="test"
INNGEST_SIGNING_KEY="test"
AGENTKIT_PORT=3010  # Optional: AgentKit server port
```

### 2. **API Key Setup**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Replace `"your-anthropic-api-key-here"` in `.env` with your actual key

### 3. **Testing the Integration**

#### Test AgentKit Trainers:
```bash
# Run comprehensive trainer tests
npx ts-node src/scripts/test-agentkit.ts

# Or test individual components
yarn dev
# Visit: http://localhost:3000/api/workouts/generate-agentkit
```

#### Test API Endpoint:
```bash
curl -X POST http://localhost:3000/api/workouts/generate-agentkit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "coachId": "MAX",
    "workoutType": "strength",
    "duration": 30,
    "fitnessLevel": "intermediate",
    "equipment": ["dumbbells"]
  }'
```

### 4. **Frontend Integration**

Update your frontend to use the new AgentKit endpoint:

```typescript
// Instead of: /api/workouts/generate
const response = await fetch('/api/workouts/generate-agentkit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    coachId: selectedCoach, // MAX, SAGE, ZARA, etc.
    workoutType: 'strength',
    duration: 30,
    fitnessLevel: 'intermediate',
    equipment: ['dumbbells']
  })
});
```

## Trainer Agent Personalities

| Agent | Specialties | Coaching Style | Example Vocabulary |
|-------|-------------|----------------|-------------------|
| **MAX** | Strength, Powerlifting | Intense Motivator | "crush it", "beast mode", "demolish" |
| **SAGE** | Flexibility, Mindfulness | Gentle Wisdom | "honor your body", "breathe deeply" |
| **ZARA** | HIIT, Cardio | Enthusiastic Energy | "superstar", "electric", "ignite" |
| **ACE** | Beginner-friendly | Supportive Friend | "we've got this", "take your time" |
| **KAI** | Athletic Performance | Competitive Warrior | "game time", "next level", "compete" |
| **NOVA** | Creative Workouts | Innovative Creator | "sparkle", "artistic movement" |
| **BLAZE** | High-Intensity | Explosive Energy | "blast off", "rocket fuel", "ignite" |
| **RILEY** | Balanced Training | Holistic Guide | "balanced approach", "harmony" |
| **MARCO** | Technique Focus | Precision Strategist | "systematic", "calculated", "precision" |

## Migration Strategy

### Phase 1: **Parallel Testing** (Current)
- Both legacy and AgentKit systems running
- AgentKit available via new endpoint
- Performance comparison and validation

### Phase 2: **Gradual Migration**
- Update frontend to use AgentKit endpoint
- Monitor performance and user feedback
- Keep legacy system as backup

### Phase 3: **Full Migration**
- Replace all workout generation with AgentKit
- Remove legacy AI client code
- Full AgentKit deployment

## Monitoring & Debugging

### Check AgentKit Server Status:
```bash
curl http://localhost:3010/health
```

### Monitor Inngest Function Logs:
- Visit Inngest Dev Server: `http://localhost:8288`
- Check function execution logs
- Monitor AgentKit network state changes

### Database Monitoring:
```sql
-- Check AgentKit generation logs
SELECT * FROM ai_generation_logs 
WHERE request_type = 'agentkit_workout_generation' 
ORDER BY created_at DESC;

-- Compare performance
SELECT 
  coach_personality,
  ai_provider,
  AVG(response_time_ms) as avg_response_time,
  AVG(exercise_count) as avg_exercise_count,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
FROM ai_generation_logs 
GROUP BY coach_personality, ai_provider;
```

## Success Criteria ✅

By end of day, you should achieve:

✅ **Real LLM Communication**: API key configured, 401 errors resolved  
✅ **AgentKit Integration**: All 9 trainer agents implemented and functional  
✅ **Personality-Driven Workouts**: Each trainer generates unique, authentic workouts  
✅ **Database Integration**: Workouts properly validated and stored  
✅ **Full Testing**: End-to-end workflow tested for all trainers  

## Next Steps

1. **Set your ANTHROPIC_API_KEY** in `.env`
2. **Test individual trainer agents** using the test script
3. **Verify API endpoint** with sample requests
4. **Update frontend** to use AgentKit endpoint
5. **Monitor performance** and compare with legacy system

## Troubleshooting

### Common Issues:

**API Key Not Set:**
```
Error: ANTHROPIC_API_KEY not set, using mock response
```
→ Add your Anthropic API key to `.env`

**AgentKit Import Errors:**
```
Module not found: @inngest/agent-kit
```
→ Run `yarn add @inngest/agent-kit`

**Validation Failures:**
```
Workout validation failed: ZodError
```
→ Check trainer agent prompt engineering and response format

**Network State Issues:**
```
Network state undefined
```
→ Ensure proper state initialization in workflow function

Your AgentKit integration is now complete and ready for testing! 🚀