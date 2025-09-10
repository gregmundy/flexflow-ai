"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingStepProps, Equipment, WorkoutType, EquipmentOption, WorkoutTypeOption } from "../types";

const equipmentOptions: EquipmentOption[] = [
  { id: "bodyweight-only", title: "Bodyweight Only", description: "No equipment needed", icon: "🤸" },
  { id: "resistance-bands", title: "Resistance Bands", description: "Portable and versatile", icon: "🔴" },
  { id: "dumbbells", title: "Dumbbells", description: "Free weight training", icon: "🏋️" },
  { id: "barbells", title: "Barbells", description: "Heavy compound movements", icon: "🏋️" },
  { id: "kettlebells", title: "Kettlebells", description: "Dynamic strength training", icon: "⚫" },
  { id: "yoga-mat", title: "Yoga Mat", description: "Floor exercises and stretching", icon: "🧘" },
  { id: "pull-up-bar", title: "Pull-up Bar", description: "Upper body bodyweight", icon: "💪" },
  { id: "cardio-equipment", title: "Cardio Equipment", description: "Treadmill, bike, etc.", icon: "🚴" },
  { id: "full-gym-access", title: "Full Gym Access", description: "Complete gym facility", icon: "🏃" }
];

const workoutTypeOptions: WorkoutTypeOption[] = [
  { id: "strength-training", title: "Strength Training", description: "Build muscle and power", icon: "💪" },
  { id: "cardio", title: "Cardiovascular", description: "Heart health and endurance", icon: "❤️" },
  { id: "hiit", title: "HIIT", description: "High-intensity intervals", icon: "⚡" },
  { id: "yoga-pilates", title: "Yoga & Pilates", description: "Mind-body connection", icon: "🧘" },
  { id: "stretching", title: "Stretching", description: "Flexibility and mobility", icon: "🤸" },
  { id: "sports-specific", title: "Sports Specific", description: "Athletic performance", icon: "⚽" },
  { id: "dance-movement", title: "Dance & Movement", description: "Fun and expressive", icon: "💃" },
  { id: "outdoor-activities", title: "Outdoor Activities", description: "Nature-based fitness", icon: "🌲" }
];

export function WorkoutPreferencesStep({ data, updateData }: OnboardingStepProps) {
  const [duration, setDuration] = useState(data.workoutDuration || 30);
  const selectedEquipment = data.availableEquipment || [];
  const selectedTypes = data.workoutTypes || [];

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    updateData({ workoutDuration: newDuration });
  };

  const toggleEquipment = (equipmentId: Equipment) => {
    const isSelected = selectedEquipment.includes(equipmentId);
    let newEquipment: Equipment[];
    
    if (isSelected) {
      newEquipment = selectedEquipment.filter(id => id !== equipmentId);
    } else {
      newEquipment = [...selectedEquipment, equipmentId];
    }
    
    updateData({ availableEquipment: newEquipment });
  };

  const toggleWorkoutType = (typeId: WorkoutType) => {
    const isSelected = selectedTypes.includes(typeId);
    let newTypes: WorkoutType[];
    
    if (isSelected) {
      newTypes = selectedTypes.filter(id => id !== typeId);
    } else {
      newTypes = [...selectedTypes, typeId];
    }
    
    updateData({ workoutTypes: newTypes });
  };

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
              Customize your workout preferences
            </CardTitle>
            <p className="glass-text-secondary text-base leading-relaxed max-w-2xl mx-auto">
              Tell us about your preferred workout duration, available equipment, and training styles 
              so we can create the perfect workouts for your situation.
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Workout Duration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              Preferred workout duration: {duration} minutes
            </CardTitle>
            <div className="space-y-4">
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((duration - 15) / (90 - 15)) * 100}%, #e5e7eb ${((duration - 15) / (90 - 15)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm glass-text-muted">
                <span>15 min</span>
                <span className="glass-text-primary font-medium">
                  {duration < 30 ? "Quick" : duration < 60 ? "Moderate" : "Extended"}
                </span>
                <span>90 min</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Available Equipment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              What equipment do you have access to?
            </CardTitle>
            <p className="glass-text-secondary text-sm mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {equipmentOptions.map((option, index) => {
                const isSelected = selectedEquipment.includes(option.id);
                
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
                      onClick={() => toggleEquipment(option.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <h4 className={`font-semibold text-sm mb-1 ${
                          isSelected ? "glass-text-purple" : "glass-text-primary"
                        }`}>
                          {option.title}
                        </h4>
                        <p className="glass-text-secondary text-xs leading-relaxed">
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

      {/* Workout Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              What types of workouts do you enjoy?
            </CardTitle>
            <p className="glass-text-secondary text-sm mb-4">Select all that interest you</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {workoutTypeOptions.map((option, index) => {
                const isSelected = selectedTypes.includes(option.id);
                
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
                      onClick={() => toggleWorkoutType(option.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <h4 className={`font-semibold text-sm mb-1 ${
                          isSelected ? "glass-text-purple" : "glass-text-primary"
                        }`}>
                          {option.title}
                        </h4>
                        <p className="glass-text-secondary text-xs leading-relaxed">
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

      {/* Summary */}
      {selectedEquipment.length > 0 && selectedTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-purple" className="p-6">
            <CardHeader>
              <CardTitle variant="glass" className="text-lg font-semibold mb-4">
                Your Workout Preferences
              </CardTitle>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-2">Duration</h5>
                  <p className="glass-text-secondary text-sm">{duration} minutes</p>
                </div>
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-2">Equipment</h5>
                  <p className="glass-text-secondary text-sm">{selectedEquipment.length} types selected</p>
                </div>
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-2">Workout Types</h5>
                  <p className="glass-text-secondary text-sm">{selectedTypes.length} styles selected</p>
                </div>
              </div>
              <p className="glass-text-secondary text-sm leading-relaxed">
                Perfect! Your AI trainer will create {duration}-minute workouts using your available equipment 
                and incorporating your favorite training styles. This ensures every workout is both 
                effective and enjoyable.
              </p>
            </CardHeader>
          </Card>
        </motion.div>
      )}
    </div>
  );
}