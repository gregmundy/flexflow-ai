"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingStepProps, FitnessArea, FitnessAreaOption } from "../types";

const fitnessAreaOptions: FitnessAreaOption[] = [
  {
    id: "strength-muscle",
    title: "Build Strength & Muscle",
    description: "Develop muscular strength, power, and lean muscle mass",
    icon: "💪"
  },
  {
    id: "cardiovascular-endurance",
    title: "Build Cardiovascular Endurance",
    description: "Improve heart health, stamina, and aerobic capacity",
    icon: "❤️"
  },
  {
    id: "weight-management",
    title: "Support Weight Management",
    description: "Maintain healthy weight through balanced activity",
    icon: "⚖️"
  },
  {
    id: "flexibility-mobility",
    title: "Increase Flexibility & Mobility",
    description: "Enhance range of motion and joint mobility",
    icon: "🤸"
  },
  {
    id: "athletic-performance",
    title: "Train for Athletic Performance",
    description: "Sport-specific training and performance enhancement",
    icon: "🏃"
  },
  {
    id: "stress-relief",
    title: "Include Stress-Relief Activities",
    description: "Mind-body connection and stress management",
    icon: "🧘"
  },
  {
    id: "posture-movement",
    title: "Focus on Posture and Movement",
    description: "Improve posture, alignment, and movement quality",
    icon: "🏃"
  },
  {
    id: "daily-energy",
    title: "Boost Daily Energy Levels",
    description: "Increase vitality and energy for daily activities",
    icon: "⚡"
  }
];

export function FitnessAreasStep({ data, updateData }: OnboardingStepProps) {
  const selectedAreas = data.focusAreas || [];

  const toggleArea = (areaId: FitnessArea) => {
    const currentAreas = selectedAreas;
    const isSelected = currentAreas.includes(areaId);
    
    let newAreas: FitnessArea[];
    if (isSelected) {
      newAreas = currentAreas.filter(id => id !== areaId);
    } else {
      newAreas = [...currentAreas, areaId];
    }
    
    updateData({ focusAreas: newAreas });
  };

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
              What are your fitness focus areas?
            </CardTitle>
            <p className="glass-text-secondary text-base leading-relaxed max-w-2xl mx-auto">
              Select all areas that interest you. Your AI trainer will create workouts 
              that align with your goals and adapt as your priorities change.
            </p>
            <p className="text-sm glass-text-muted mt-2">
              Choose at least one area to continue
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Focus Area Options Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fitnessAreaOptions.map((option, index) => {
            const isSelected = selectedAreas.includes(option.id);
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  variant="glass-interactive"
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                      : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                  }`}
                  onClick={() => toggleArea(option.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{option.icon}</div>
                      <div className="flex-1">
                        <CardTitle 
                          variant="glass" 
                          className={`text-lg font-semibold mb-2 ${
                            isSelected ? "glass-text-purple" : "glass-text-primary"
                          }`}
                        >
                          {option.title}
                        </CardTitle>
                        <p className="glass-text-secondary text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected 
                          ? "bg-purple-500 border-purple-500" 
                          : "border-gray-300 glass-card-subtle"
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Summary */}
      {selectedAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-purple" className="p-6">
            <CardHeader>
              <CardTitle variant="glass" className="text-lg font-semibold mb-4">
                Your Selected Focus Areas ({selectedAreas.length})
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {selectedAreas.map((areaId) => {
                  const option = fitnessAreaOptions.find(opt => opt.id === areaId);
                  return option ? (
                    <div
                      key={areaId}
                      className="flex items-center gap-2 px-3 py-2 glass-card-subtle rounded-full"
                    >
                      <span className="text-sm">{option.icon}</span>
                      <span className="text-sm font-medium glass-text-primary">
                        {option.title}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              <p className="glass-text-secondary text-sm mt-4 leading-relaxed">
                Perfect! Your AI trainer will create personalized workouts focusing on these areas. 
                You can always adjust your preferences later as your goals evolve.
              </p>
            </CardHeader>
          </Card>
        </motion.div>
      )}
    </div>
  );
}