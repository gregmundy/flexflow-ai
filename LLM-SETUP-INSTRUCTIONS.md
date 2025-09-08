# FlexFlow LLM Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Get Anthropic API Key
1. Visit [https://console.anthropic.com/](https://console.anthropic.com/)
2. Create account or sign in
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-api03-`)

### Step 2: Update Environment Variables
Replace the placeholder in `.env.local`:

```bash
# Change this line:
ANTHROPIC_API_KEY=your-real-anthropic-key-here

# To your actual key:
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### Step 3: Test the Connection
```bash
# Make a test request
curl http://localhost:3000/api/test/workout

# Check the logs for "AI Client Error" - should be gone
```

## What's Fixed
- ✅ Updated to current Claude 3.5 Sonnet model (`claude-3-5-sonnet-20241022`)
- ✅ Fixed API key placeholder
- ✅ Fallback system still works if LLM fails
- ✅ All existing functionality preserved

## Pricing
- **Claude 3.5 Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Typical workout generation**: ~500 input + 1200 output tokens = ~$0.02 per workout

## Alternative: OpenAI Setup
If you prefer OpenAI, you can:
1. Get API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Set `OPENAI_API_KEY=sk-...` in `.env.local`
3. Update the AI client to use OpenAI SDK (requires code changes)

## Monitoring
Check the `ai_generation_logs` table in your database to monitor:
- Success rate
- Token usage
- Response times
- Fallback usage

## Testing Commands
```bash
# Test workout generation
curl -X POST http://localhost:3000/api/test/workout

# Check if real LLM is being used (look for actual AI-generated content vs template)
# Template workouts have generic instructions like "Keep your body in a straight line"
# AI workouts will have coach personality and detailed instructions
```