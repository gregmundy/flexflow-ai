"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingStepProps, ExerciseFrequency, ExerciseIntensity } from "../types";

const frequencyOptions: { id: ExerciseFrequency; title: string; description: string; icon: string }[] = [
  {
    id: "never",
    title: "Never / Rarely",
    description: "I don't currently exercise regularly",
    icon: "😴"
  },
  {
    id: "1-2-per-month",
    title: "1-2 times per month",
    description: "Very occasional activity",
    icon: "🚶"
  },
  {
    id: "1-per-week",
    title: "Once per week",
    description: "Light weekly activity",
    icon: "🏃"
  },
  {
    id: "2-3-per-week",
    title: "2-3 times per week",
    description: "Regular moderate activity",
    icon: "💪"
  },
  {
    id: "4-5-per-week",
    title: "4-5 times per week",
    description: "Very active lifestyle",
    icon: "🔥"
  },
  {
    id: "daily",
    title: "Daily",
    description: "Exercise is part of my daily routine",
    icon: "⚡"
  }
];

const intensityOptions: { id: ExerciseIntensity; title: string; description: string; icon: string }[] = [
  {
    id: "light",
    title: "Light Activity",
    description: "Walking, gentle stretching, easy yoga",
    icon: "🌸"
  },
  {
    id: "moderate",
    title: "Moderate Activity",
    description: "Brisk walking, swimming, recreational sports",
    icon: "🌊"
  },
  {
    id: "vigorous",
    title: "Vigorous Activity",
    description: "Running, intense gym sessions, competitive sports",
    icon: "🔥"
  },
  {
    id: "mixed",
    title: "Mixed Intensity",
    description: "I vary between different intensity levels",
    icon: "🎨"
  }
];

export function ActivityLevelStep({ data, updateData }: OnboardingStepProps) {
  const selectedFrequency = data.exerciseFrequency;
  const selectedIntensity = data.exerciseIntensity;

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card variant="glass-elevated" className="p-6 text-center">
          <CardHeader>
            <CardTitle variant="glass" className="text-xl font-bold mb-2">
              Tell us about your current activity level
            </CardTitle>
            <p className="glass-text-secondary text-base leading-relaxed max-w-2xl mx-auto">
              This helps us understand where you&apos;re starting from so we can create 
              appropriate workouts that challenge you without overwhelming you.
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Exercise Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              How often do you currently exercise?
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {frequencyOptions.map((option, index) => {
                const isSelected = selectedFrequency === option.id;
                
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      variant="glass-interactive"
                      className={`cursor-pointer transition-all duration-300 h-full ${
                        isSelected 
                          ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                          : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                      }`}
                      onClick={() => updateData({ exerciseFrequency: option.id })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <h4 className={`font-semibold mb-2 ${
                          isSelected ? "glass-text-purple" : "glass-text-primary"
                        }`}>
                          {option.title}
                        </h4>
                        <p className="glass-text-secondary text-sm">
                          {option.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Exercise Intensity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              What intensity level do you typically prefer?
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {intensityOptions.map((option, index) => {
                const isSelected = selectedIntensity === option.id;
                
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      variant="glass-interactive"
                      className={`cursor-pointer transition-all duration-300 h-full ${
                        isSelected 
                          ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                          : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                      }`}
                      onClick={() => updateData({ exerciseIntensity: option.id })}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">{option.icon}</div>
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-2 ${
                              isSelected ? "glass-text-purple" : "glass-text-primary"
                            }`}>
                              {option.title}
                            </h4>
                            <p className="glass-text-secondary text-sm leading-relaxed">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Summary */}
      {selectedFrequency && selectedIntensity && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-purple" className="p-6">
            <CardHeader>
              <CardTitle variant="glass" className="text-lg font-semibold mb-3">
                Your Activity Profile
              </CardTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-1">Frequency</h5>
                  <p className="glass-text-secondary text-sm">
                    {frequencyOptions.find(opt => opt.id === selectedFrequency)?.title}
                  </p>
                </div>
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-1">Intensity</h5>
                  <p className="glass-text-secondary text-sm">
                    {intensityOptions.find(opt => opt.id === selectedIntensity)?.title}
                  </p>
                </div>
              </div>
              <p className="glass-text-secondary text-sm mt-4 leading-relaxed">
                Great! This gives us a clear picture of your starting point. Your AI trainer will 
                create workouts that match your current level and gradually help you progress.
              </p>
            </CardHeader>
          </Card>
        </motion.div>
      )}
    </div>
  );
}