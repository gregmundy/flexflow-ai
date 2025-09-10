"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingStepProps, ExperienceLevel } from "../types";

const experienceOptions: { 
  id: ExperienceLevel; 
  title: string; 
  description: string; 
  details: string[];
  icon: string; 
}[] = [
  {
    id: "beginner",
    title: "Beginner",
    description: "New to fitness or getting back into it after a break",
    details: [
      "Learning proper form and technique",
      "Building foundation strength and habits",
      "Need guidance on exercise selection",
      "Prefer step-by-step instructions"
    ],
    icon: "🌱"
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Have some fitness experience and know basic exercises",
    details: [
      "Comfortable with basic movements",
      "Ready for more variety and challenge",
      "Can modify exercises as needed",
      "Want to progress to new goals"
    ],
    icon: "🌿"
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Experienced with complex movements and training principles",
    details: [
      "Strong foundation in multiple exercise styles",
      "Understand periodization and progression",
      "Can safely perform complex movements",
      "Looking for sophisticated programming"
    ],
    icon: "🌳"
  }
];

export function ExperienceStep({ data, updateData }: OnboardingStepProps) {
  const selectedLevel = data.experienceLevel;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card variant="glass-elevated" className="p-6 text-center">
          <CardHeader>
            <CardTitle variant="glass" className="text-xl font-bold mb-2">
              What&apos;s your fitness experience level?
            </CardTitle>
            <p className="glass-text-secondary text-base leading-relaxed max-w-2xl mx-auto">
              This helps us match you with workouts at the right difficulty level, 
              with appropriate progressions and safety considerations.
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Experience Level Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="space-y-4">
          {experienceOptions.map((option, index) => {
            const isSelected = selectedLevel === option.id;
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  variant="glass-interactive"
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                      : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                  }`}
                  onClick={() => updateData({ experienceLevel: option.id })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="text-4xl">{option.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-xl font-bold ${
                            isSelected ? "glass-text-purple" : "glass-text-primary"
                          }`}>
                            {option.title}
                          </h3>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected 
                              ? "bg-purple-500 border-purple-500" 
                              : "border-gray-300 glass-card-subtle"
                          }`}>
                            {isSelected && (
                              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="glass-text-secondary text-base mb-4 leading-relaxed">
                          {option.description}
                        </p>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {option.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center gap-2 text-sm glass-text-muted">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Level Summary */}
      {selectedLevel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-purple" className="p-6">
            <CardHeader>
              <CardTitle variant="glass" className="text-lg font-semibold mb-3">
                Perfect! You&apos;re set as {experienceOptions.find(opt => opt.id === selectedLevel)?.title}
              </CardTitle>
              <div className="glass-card-subtle p-4 rounded-lg">
                <p className="glass-text-secondary text-sm leading-relaxed">
                  Your AI trainer will create {selectedLevel === 'beginner' ? 'foundational' : 
                  selectedLevel === 'intermediate' ? 'progressive' : 'advanced'} workouts 
                  that match your experience level. We&apos;ll include proper warm-ups, 
                  {selectedLevel === 'beginner' ? ' detailed form cues,' : 
                   selectedLevel === 'intermediate' ? ' technique refinements,' : ' complex movement patterns,'} 
                  and appropriate progressions to help you reach your goals safely and effectively.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {selectedLevel === 'beginner' ? 'Foundation Building' : 
                   selectedLevel === 'intermediate' ? 'Skill Development' : 'Performance Training'}
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {selectedLevel === 'beginner' ? 'Form Focus' : 
                   selectedLevel === 'intermediate' ? 'Progressive Challenges' : 'Advanced Techniques'}
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Safety First
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      )}
    </div>
  );
}