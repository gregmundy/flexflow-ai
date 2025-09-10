"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingStepProps, TrainerProfile } from "../types";

// Using the same trainer data from the main page
const trainers: TrainerProfile[] = [
  {
    name: "MAX",
    avatar: "💪",
    personality: "Classic Motivator",
    description: "Classic motivator who believes in pushing limits and achieving breakthrough results",
    style: "Rise and CRUSH it, champion! Time to level up with beast mode strength training like a warrior!",
    color: "bg-indigo-500",
    image: "/coaches/MAX.webp"
  },
  {
    name: "ZARA",
    avatar: "⚡",
    personality: "Energy Booster", 
    description: "High-energy coach who makes fitness fun and keeps your motivation soaring",
    style: "Hey superstar! You're amazing! Let's go crush it with high-energy workouts - your energy is contagious!",
    color: "bg-emerald-500",
    image: "/coaches/ZARA.webp"
  },
  {
    name: "BLAZE",
    avatar: "💯",
    personality: "The Athletic Performer",
    description: "Performance-focused fitness coach for athletic training and competitive workouts",
    style: "Champion mindset activated! Today we achieve athletic excellence and compete at peak performance levels!",
    color: "bg-red-500",
    image: "/coaches/BLAZE.webp"
  },
  {
    name: "SAGE", 
    avatar: "🧘",
    personality: "Mindful Guide",
    description: "Mindful fitness assistant focused on balanced movement and sustainable wellness",
    style: "Good morning! Let's flow into balance today. Honor your body with mindful movement, breathe deeply, and embrace awareness.",
    color: "bg-fuchsia-400",
    image: "/coaches/SAGE.webp"
  },
  {
    name: "KAI",
    avatar: "📊",
    personality: "Data-Driven Optimizer",
    description: "Analytical fitness coach using data tracking methods to enhance your workouts",
    style: "Data shows optimal efficiency today! Let's optimize your metrics with precise analysis and targeted performance improvements.",
    color: "bg-sky-400",
    image: "/coaches/KAI.webp"
  },
  {
    name: "NOVA",
    avatar: "🚀",
    personality: "Transformation Catalyst",
    description: "Breakthrough specialist who helps you transform and reach the next level",
    style: "Ready for breakthrough transformation? Time to catalyst your evolution and unlock your next level potential!",
    color: "bg-cyan-500",
    image: "/coaches/NOVA.webp"
  },
  {
    name: "ACE",
    avatar: "🤗",
    personality: "Gentle Supporter",
    description: "Patient, understanding coach who believes in gradual progress and celebrating every step",
    style: "Good morning, friend! You've got this - let's make gentle progress with kind movement that honors your journey.",
    color: "bg-pink-500",
    image: "/coaches/ACE.webp"
  },
  {
    name: "RILEY",
    avatar: "🌟",
    personality: "Balanced Lifestyle Coach",
    description: "Practical coach who understands real life and helps integrate fitness sustainably",
    style: "Let's find realistic balance today! Sustainable progress that's manageable and fits your life perfectly.",
    color: "bg-teal-500",
    image: "/coaches/RILEY.webp"
  },
  {
    name: "MARCO",
    avatar: "👨‍🍳",
    personality: "The Chef",
    description: "Passionate chef making healthy eating delicious with Mediterranean-inspired meal prep and simple ingredients",
    style: "Let's create something delicious! Fresh ingredients, amazing flavors - healthy eating that actually tastes incredible!",
    color: "bg-green-500",
    image: "/coaches/MARCO.webp"
  }
];

export function TrainerSelectionStep({ data, updateData, onNext }: OnboardingStepProps) {
  const selectedTrainer = data.selectedTrainer;

  const selectTrainer = (trainerName: string) => {
    updateData({ selectedTrainer: trainerName });
  };

  const selectedTrainerData = trainers.find(t => t.name === selectedTrainer);

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
              Choose Your AI Trainer
            </CardTitle>
            <p className="glass-text-secondary text-base leading-relaxed max-w-2xl mx-auto">
              Each trainer has a unique personality and coaching style. Choose the one that motivates 
              you most - you can always switch trainers later to keep your fitness journey fresh.
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Trainer Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer, index) => {
            const isSelected = selectedTrainer === trainer.name;
            
            return (
              <motion.div
                key={trainer.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card
                  variant="glass-interactive"
                  className={`h-full transition-all duration-300 overflow-hidden ${
                    isSelected 
                      ? "glass-selection-card selected ring-4 ring-purple-400 bg-purple-50" 
                      : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                  }`}
                  onClick={() => selectTrainer(trainer.name)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden glass-card-subtle ring-2 ring-white/20">
                          <Image
                            src={trainer.image}
                            alt={`${trainer.name} - ${trainer.personality}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            priority={index < 6}
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`text-xs font-bold px-3 py-1 rounded-full glass-card-subtle ${trainer.color} text-white`}>
                            {trainer.name}
                          </div>
                        </div>
                        <CardTitle variant="glass" className={`text-lg font-bold leading-tight mb-1 ${
                          isSelected ? "glass-text-purple" : "glass-text-primary"
                        }`}>
                          {trainer.personality}
                        </CardTitle>
                      </div>
                    </div>
                    
                    <p className="glass-text-secondary text-sm leading-relaxed mb-4">
                      {trainer.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="glass-card-subtle rounded-xl p-4 border-l-4 border-l-purple-400/30">
                      <p className="text-xs leading-relaxed font-medium italic glass-text-secondary">
                        &quot;{trainer.style}&quot;
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Trainer Preview */}
      {selectedTrainerData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-purple" className="p-8">
            <CardHeader>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden glass-card-subtle ring-3 ring-purple-300">
                  <Image
                    src={selectedTrainerData.image}
                    alt={`${selectedTrainerData.name} - ${selectedTrainerData.personality}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <CardTitle variant="glass" className="text-2xl font-bold glass-text-primary mb-2">
                    Meet {selectedTrainerData.name}
                  </CardTitle>
                  <p className="glass-text-secondary text-lg">
                    Your {selectedTrainerData.personality}
                  </p>
                </div>
              </div>

              <div className="glass-card-subtle p-6 rounded-xl mb-6">
                <h4 className="font-semibold glass-text-primary mb-3">What to expect from {selectedTrainerData.name}:</h4>
                <p className="glass-text-secondary text-sm leading-relaxed mb-4">
                  {selectedTrainerData.description}
                </p>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <p className="text-sm font-medium italic glass-text-primary">
                    Sample message: &quot;{selectedTrainerData.style}&quot;
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="glass-purple"
                  size="lg"
                  onClick={onNext}
                  className="font-semibold px-8"
                >
                  Complete Setup with {selectedTrainerData.name}
                </Button>
                <p className="glass-text-secondary text-sm mt-3">
                  You can always switch trainers later in your settings
                </p>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {/* Call-to-Action when no trainer is selected */}
      {!selectedTrainer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card variant="glass" className="p-6 text-center">
            <CardHeader>
              <p className="glass-text-secondary">
                👆 Choose your AI trainer above to complete your FlexFlow setup
              </p>
              <p className="glass-text-muted text-sm mt-2">
                Each trainer will create workouts tailored to your preferences and goals
              </p>
            </CardHeader>
          </Card>
        </motion.div>
      )}
    </div>
  );
}