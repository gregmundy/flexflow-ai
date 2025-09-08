'use client';

import { useState } from 'react';

const trainers = [
  { id: 'MAX', name: 'MAX', emoji: '💪', description: 'Intense powerhouse coach' },
  { id: 'SAGE', name: 'SAGE', emoji: '🧘', description: 'Mindful wisdom guide' },
  { id: 'ZARA', name: 'ZARA', emoji: '⚡', description: 'Energetic dynamo' },
  { id: 'ACE', name: 'ACE', emoji: '🤗', description: 'Supportive friend' },
  { id: 'KAI', name: 'KAI', emoji: '🔥', description: 'Competitive warrior' },
  { id: 'NOVA', name: 'NOVA', emoji: '✨', description: 'Creative innovator' },
  { id: 'BLAZE', name: 'BLAZE', emoji: '🚀', description: 'High-intensity rocket' },
  { id: 'RILEY', name: 'RILEY', emoji: '🌟', description: 'Balanced guide' },
  { id: 'MARCO', name: 'MARCO', emoji: '🎯', description: 'Precision strategist' },
];

export default function AgentKitDemo() {
  const [selectedTrainer, setSelectedTrainer] = useState('MAX');
  const [workoutType, setWorkoutType] = useState('strength');
  const [duration, setDuration] = useState(30);
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/workouts/generate-agentkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          coachId: selectedTrainer,
          workoutType,
          duration,
          fitnessLevel,
          equipment: ['dumbbells'],
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: 'Network error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AgentKit Trainer Demo
          </h1>
          <p className="text-lg text-gray-600">
            Experience AI-powered workout generation with authentic trainer personalities
          </p>
          <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg inline-block">
            <p className="text-green-800 font-medium">
              ✅ Real LLM Communication | ✅ AgentKit Integration | ✅ All 9 Trainers Ready
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Choose Your AI Trainer</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {trainers.map((trainer) => (
              <button
                key={trainer.id}
                onClick={() => setSelectedTrainer(trainer.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTrainer === trainer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{trainer.emoji}</div>
                <div className="font-bold">{trainer.name}</div>
                <div className="text-sm text-gray-600">{trainer.description}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Type
              </label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min={10}
                max={120}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Level
              </label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="text-center mb-8">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              {isGenerating ? (
                <>🤖 Generating with {selectedTrainer} Agent...</>
              ) : (
                `Generate Workout with ${selectedTrainer}`
              )}
            </button>
          </div>

          {result && (
            <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold mb-4 text-xl ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ AgentKit Generation Complete!' : '❌ Generation Failed'}
              </h3>
              {result.success ? (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Event ID:</span> {result.eventId}</p>
                  <p><span className="font-medium">Trainer Agent:</span> {result.trainerAgent}</p>
                  <p><span className="font-medium">Workout Type:</span> {result.workoutType}</p>
                  <p><span className="font-medium">Duration:</span> {result.estimatedDuration}</p>
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-green-700 font-medium">{result.message}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-700">{result.error || 'Unknown error occurred'}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-gray-900 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🔧 AgentKit Technical Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Multi-agent trainer personalities</li>
                <li>• Anthropic Claude 3.5 Sonnet</li>
                <li>• Zod schema validation</li>
                <li>• Automatic fallback system</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Integration:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Next.js 15 + TypeScript</li>
                <li>• Inngest AgentKit v0.9.0</li>
                <li>• Workflow orchestration</li>
                <li>• Background processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}