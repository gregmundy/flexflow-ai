"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingStepProps, MovementRestriction, MovementRestrictionOption } from "../types";

const movementOptions: MovementRestrictionOption[] = [
  {
    id: "high-impact-jumping",
    title: "High-Impact Jumping",
    description: "Jumping jacks, plyometrics, box jumps",
    icon: "🦘"
  },
  {
    id: "overhead-movements",
    title: "Overhead Movements",
    description: "Shoulder presses, overhead reaches",
    icon: "🙋"
  },
  {
    id: "deep-squatting",
    title: "Deep Squatting",
    description: "Deep squats, pistol squats",
    icon: "🤸"
  },
  {
    id: "running-jogging",
    title: "Running & Jogging",
    description: "High-impact cardio activities",
    icon: "🏃"
  },
  {
    id: "heavy-lifting",
    title: "Heavy Lifting",
    description: "Maximum effort strength training",
    icon: "🏋️"
  },
  {
    id: "twisting-movements",
    title: "Twisting Movements",
    description: "Rotational exercises, Russian twists",
    icon: "🌪️"
  },
  {
    id: "balance-challenging",
    title: "Balance-Challenging Exercises",
    description: "Single-leg stands, bosu ball work",
    icon: "⚖️"
  },
  {
    id: "floor-exercises",
    title: "Floor Exercises",
    description: "Ground-based movements, get-ups",
    icon: "🧘"
  },
  {
    id: "none",
    title: "None - I'm comfortable with all movements",
    description: "No movement restrictions or preferences",
    icon: "✅"
  }
];

export function MovementPreferencesStep({ data, updateData }: OnboardingStepProps) {
  const selectedMovements = data.movementsToAvoid || [];

  const toggleMovement = (movementId: MovementRestriction) => {
    let newMovements: MovementRestriction[];
    
    // Special handling for "none" option
    if (movementId === "none") {
      newMovements = selectedMovements.includes("none") ? [] : ["none"];
    } else {
      // Remove "none" if selecting any specific movement
      const withoutNone = selectedMovements.filter(id => id !== "none");
      const isSelected = withoutNone.includes(movementId);
      
      if (isSelected) {
        newMovements = withoutNone.filter(id => id !== movementId);
      } else {
        newMovements = [...withoutNone, movementId];
      }
    }
    
    updateData({ movementsToAvoid: newMovements });
  };

  const hasNoneSelected = selectedMovements.includes("none");
  const specificMovementsCount = selectedMovements.filter(id => id !== "none").length;

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
              Safe Movement Preferences
            </CardTitle>
            <p className="glass-text-secondary text-base leading-relaxed max-w-2xl mx-auto mb-4">
              Are there any movements or exercise types you prefer to avoid? This helps us create 
              workouts that are comfortable and appropriate for you.
            </p>
            <div className="glass-card-subtle p-4 rounded-lg text-left">
              <p className="text-sm glass-text-secondary leading-relaxed">
                <strong className="glass-text-primary">Please note:</strong> This is about movement preferences, not medical restrictions. 
                If you have injuries or medical conditions that limit your movement, please consult your healthcare 
                provider before starting any exercise program.
              </p>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Movement Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              Select any movements you&apos;d prefer to avoid
            </CardTitle>
            <p className="glass-text-secondary text-sm mb-4">
              Your AI trainer will create alternative exercises that work the same muscle groups
            </p>
            <div className="space-y-3">
              {movementOptions.map((option, index) => {
                const isSelected = selectedMovements.includes(option.id);
                const isDisabled = option.id !== "none" && hasNoneSelected;
                
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card
                      variant="glass-interactive"
                      className={`cursor-pointer transition-all duration-300 ${
                        isDisabled 
                          ? "opacity-50 cursor-not-allowed" 
                          : isSelected 
                            ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                            : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                      } ${option.id === "none" ? "border-2 border-green-300" : ""}`}
                      onClick={() => !isDisabled && toggleMovement(option.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">{option.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-semibold ${
                                isSelected ? "glass-text-purple" : "glass-text-primary"
                              }`}>
                                {option.title}
                              </h4>
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

      {/* Alternative Exercises Info */}
      {specificMovementsCount > 0 && !hasNoneSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-blue" className="p-6">
            <CardHeader>
              <CardTitle variant="glass" className="text-lg font-semibold mb-3">
                Alternative Exercise Examples
              </CardTitle>
              <div className="grid md:grid-cols-2 gap-4">
                {specificMovementsCount > 0 && selectedMovements.includes("high-impact-jumping") && (
                  <div className="glass-card-subtle p-4 rounded-lg">
                    <h5 className="font-medium glass-text-primary mb-2">Instead of High-Impact Jumping:</h5>
                    <p className="glass-text-secondary text-sm">Step-ups, marching in place, low-impact cardio</p>
                  </div>
                )}
                {specificMovementsCount > 0 && selectedMovements.includes("heavy-lifting") && (
                  <div className="glass-card-subtle p-4 rounded-lg">
                    <h5 className="font-medium glass-text-primary mb-2">Instead of Heavy Lifting:</h5>
                    <p className="glass-text-secondary text-sm">Resistance bands, bodyweight, lighter weights with higher reps</p>
                  </div>
                )}
                {specificMovementsCount > 0 && selectedMovements.includes("floor-exercises") && (
                  <div className="glass-card-subtle p-4 rounded-lg">
                    <h5 className="font-medium glass-text-primary mb-2">Instead of Floor Exercises:</h5>
                    <p className="glass-text-secondary text-sm">Chair-based exercises, standing movements, wall exercises</p>
                  </div>
                )}
                {specificMovementsCount > 0 && selectedMovements.includes("overhead-movements") && (
                  <div className="glass-card-subtle p-4 rounded-lg">
                    <h5 className="font-medium glass-text-primary mb-2">Instead of Overhead Movements:</h5>
                    <p className="glass-text-secondary text-sm">Chest-level exercises, lateral raises, front raises</p>
                  </div>
                )}
              </div>
              <p className="glass-text-secondary text-sm mt-4 leading-relaxed">
                Your AI trainer will automatically suggest these alternatives while maintaining the effectiveness 
                of your workouts and targeting the same muscle groups.
              </p>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="glass-purple" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-3">
              Movement Preferences Set
            </CardTitle>
            <div className="glass-card-subtle p-4 rounded-lg">
              {hasNoneSelected ? (
                <p className="glass-text-secondary text-sm leading-relaxed">
                  ✅ <strong>Great!</strong> You&apos;re comfortable with all movement types. Your AI trainer will have 
                  full flexibility to create diverse, challenging workouts using any exercise style that 
                  matches your goals and preferences.
                </p>
              ) : specificMovementsCount === 0 ? (
                <p className="glass-text-secondary text-sm leading-relaxed">
                  Please select your movement preferences to continue, or choose &quot;None&quot; if you&apos;re comfortable with all movements.
                </p>
              ) : (
                <div>
                  <p className="glass-text-secondary text-sm leading-relaxed mb-3">
                    <strong>Noted!</strong> Your AI trainer will avoid {specificMovementsCount} movement type{specificMovementsCount !== 1 ? 's' : ''} 
                    and suggest effective alternatives that target the same muscle groups. This ensures your 
                    workouts remain challenging while respecting your preferences.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMovements.filter(id => id !== "none").map((movementId) => {
                      const movement = movementOptions.find(opt => opt.id === movementId);
                      return movement ? (
                        <span key={movementId} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {movement.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}