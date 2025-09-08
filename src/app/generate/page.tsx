"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  ArrowRight, 
  Zap, 
  Clock, 
  Target, 
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Star,
  Flame,
  Heart,
  Brain
} from "lucide-react";

// Coach data (simplified for POC)
const coaches = {
  MAX: { name: "MAX", avatar: "💪", color: "bg-red-500", description: "High-intensity powerhouse" },
  SAGE: { name: "SAGE", avatar: "🧘", color: "bg-purple-500", description: "Mindful wellness guide" },
  ZARA: { name: "ZARA", avatar: "⚡", color: "bg-green-500", description: "Energetic motivator" },
  ACE: { name: "ACE", avatar: "🤗", color: "bg-blue-500", description: "Supportive friend" },
  KAI: { name: "KAI", avatar: "📊", color: "bg-indigo-500", description: "Data-driven optimizer" },
  NOVA: { name: "NOVA", avatar: "🚀", color: "bg-pink-500", description: "Transformation catalyst" },
  BLAZE: { name: "BLAZE", avatar: "🔥", color: "bg-orange-500", description: "Athletic performance" },
  RILEY: { name: "RILEY", avatar: "🌟", color: "bg-teal-500", description: "Balanced lifestyle" },
  MARCO: { name: "MARCO", avatar: "👨‍🍳", color: "bg-yellow-500", description: "Healthy meal master" }
};

// Form validation schema
const workoutSchema = z.object({
  coachId: z.string().min(1, "Please select a coach"),
  workoutType: z.string().min(1, "Please select a workout type"),
  duration: z.number().min(15).max(60),
  fitnessLevel: z.string().min(1, "Please select your fitness level"),
  notes: z.string().optional()
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string>("");

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      coachId: "",
      workoutType: "strength",
      duration: 30,
      fitnessLevel: "intermediate",
      notes: ""
    }
  });

  const onSubmit = async (data: WorkoutFormData) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/workouts/generate-simple-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: data.coachId,
          workoutType: data.workoutType,
          duration: data.duration,
          fitnessLevel: data.fitnessLevel,
          equipment: ['dumbbells', 'bench'] // Default equipment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate workout');
      }

      const result = await response.json();
      
      // Store the generated workout in sessionStorage
      sessionStorage.setItem('generatedWorkout', JSON.stringify({
        ...result,
        trainer: data.coachId,
        trainerAvatar: coaches[data.coachId as keyof typeof coaches].avatar,
        trainerColor: coaches[data.coachId as keyof typeof coaches].color.replace('bg-', 'bg-'),
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        focus: `${data.workoutType.charAt(0).toUpperCase() + data.workoutType.slice(1)} Training`,
        estimatedTime: `${data.duration} minutes`
      }));
      
      // Redirect to workout page
      router.push('/workout');
    } catch (error) {
      console.error('Error generating workout:', error);
      alert('Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 py-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Generate Your Workout
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your AI coach and let them create a personalized workout just for you
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Coach Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Choose Your AI Coach
                </CardTitle>
                <CardDescription>
                  Each coach has a unique personality and training style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="coachId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(coaches).map(([id, coach]) => (
                            <motion.button
                              key={id}
                              type="button"
                              onClick={() => {
                                field.onChange(id);
                                setSelectedCoach(id);
                              }}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                field.value === id
                                  ? `${coach.color} border-gray-800 text-white`
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="text-3xl mb-2">{coach.avatar}</div>
                              <div className="font-bold text-sm">{coach.name}</div>
                              <div className={`text-xs mt-1 ${field.value === id ? 'text-white/80' : 'text-gray-600'}`}>
                                {coach.description}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Workout Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Workout Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Workout Type */}
                  <FormField
                    control={form.control}
                    name="workoutType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Type</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'strength', label: 'Strength', icon: '💪' },
                              { value: 'bodyweight', label: 'Bodyweight', icon: '🏃' },
                              { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
                              { value: 'mobility', label: 'Mobility', icon: '🤸' }
                            ].map((type) => (
                              <Button
                                key={type.value}
                                type="button"
                                variant={field.value === type.value ? "default" : "outline"}
                                onClick={() => field.onChange(type.value)}
                                className="h-12"
                              >
                                <span className="mr-2">{type.icon}</span>
                                {type.label}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fitness Level */}
                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fitness Level</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'beginner', label: 'Beginner' },
                              { value: 'intermediate', label: 'Intermediate' },
                              { value: 'advanced', label: 'Advanced' }
                            ].map((level) => (
                              <Button
                                key={level.value}
                                type="button"
                                variant={field.value === level.value ? "default" : "outline"}
                                onClick={() => field.onChange(level.value)}
                                className="h-12"
                              >
                                {level.label}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Duration Slider */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Duration</span>
                        <Badge variant="secondary">{field.value} minutes</Badge>
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <input
                            type="range"
                            min="15"
                            max="60"
                            step="15"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>15 min</span>
                            <span>30 min</span>
                            <span>45 min</span>
                            <span>60 min</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Any injuries, equipment limitations, or specific goals?"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Perfect Workout...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Workout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>

        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
              >
                <div className="text-6xl mb-4">
                  {selectedCoach ? coaches[selectedCoach as keyof typeof coaches].avatar : "🤖"}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {selectedCoach ? `${coaches[selectedCoach as keyof typeof coaches].name} is designing your workout...` : "Creating your workout..."}
                </h3>
                <p className="text-gray-600 mb-4">
                  This will take just a moment while we personalize everything for you.
                </p>
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}