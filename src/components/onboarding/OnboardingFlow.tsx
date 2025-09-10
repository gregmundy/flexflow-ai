"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { OnboardingData, OnboardingStep } from "./types";
import { WelcomeStep } from "./steps/WelcomeStep";
import { FitnessAreasStep } from "./steps/FitnessAreasStep";
import { ActivityLevelStep } from "./steps/ActivityLevelStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { WorkoutPreferencesStep } from "./steps/WorkoutPreferencesStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import { MovementPreferencesStep } from "./steps/MovementPreferencesStep";
import { TrainerSelectionStep } from "./steps/TrainerSelectionStep";

const STORAGE_KEY = "flexflow_onboarding_progress";

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to FlexFlow",
    description: "Important health and privacy information",
    component: WelcomeStep
  },
  {
    id: 2,
    title: "Your Fitness Focus",
    description: "What areas would you like to work on?",
    component: FitnessAreasStep
  },
  {
    id: 3,
    title: "Activity Assessment",
    description: "Tell us about your current activity level",
    component: ActivityLevelStep
  },
  {
    id: 4,
    title: "Experience Level",
    description: "What's your fitness experience?",
    component: ExperienceStep
  },
  {
    id: 5,
    title: "Workout Preferences",
    description: "Customize your workout style",
    component: WorkoutPreferencesStep
  },
  {
    id: 6,
    title: "Schedule & Reminders",
    description: "When would you like to work out?",
    component: ScheduleStep
  },
  {
    id: 7,
    title: "Movement Preferences",
    description: "Any movements you prefer to avoid?",
    component: MovementPreferencesStep
  },
  {
    id: 8,
    title: "Choose Your AI Trainer",
    description: "Select your perfect fitness coach",
    component: TrainerSelectionStep
  }
];

const initialData: Partial<OnboardingData> = {
  healthDisclaimer: false,
  dataPrivacyConsent: false,
  focusAreas: [],
  workoutDuration: 30,
  availableEquipment: [],
  workoutTypes: [],
  preferredDays: [],
  movementsToAvoid: [],
  smsConsentTCPA: false
};

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(parsed.data);
        setCurrentStep(parsed.currentStep || 0);
      } catch (error) {
        console.error("Failed to load saved onboarding progress:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data,
        currentStep,
        lastUpdated: Date.now()
      }));
    }
  }, [data, currentStep, isLoading]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = () => {
    // Clear saved progress
    localStorage.removeItem(STORAGE_KEY);
    // Redirect to dashboard or main app
    window.location.href = "/generate";
  };

  const isStepValid = (): boolean => {
    const step = onboardingSteps[currentStep];
    
    switch (step.id) {
      case 1:
        return !!(data.healthDisclaimer && data.dataPrivacyConsent);
      case 2:
        return !!(data.focusAreas && data.focusAreas.length > 0);
      case 3:
        return !!(data.exerciseFrequency && data.exerciseIntensity);
      case 4:
        return !!data.experienceLevel;
      case 5:
        return !!(data.availableEquipment && data.availableEquipment.length > 0 && 
               data.workoutTypes && data.workoutTypes.length > 0);
      case 6:
        return !!(data.preferredDays && data.preferredDays.length > 0 && 
               data.timeOfDay && data.smsReminderTiming !== undefined && data.smsConsentTCPA);
      case 7:
        return data.movementsToAvoid !== undefined;
      case 8:
        return !!data.selectedTrainer;
      default:
        return false;
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const CurrentStepComponent = currentStepData.component;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8">
          <div className="glass-loading w-64 h-4 rounded-full"></div>
          <p className="text-center mt-4 glass-text-secondary">Loading your progress...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card variant="glass-elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold glass-text-primary">
                  {currentStepData.title}
                </h1>
                <p className="glass-text-secondary mt-1">
                  {currentStepData.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm glass-text-muted">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </div>
                <div className="text-2xl font-bold glass-text-purple">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </Card>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <CurrentStepComponent
              data={data}
              updateData={updateData}
              onNext={goNext}
              onPrev={goPrev}
              isValid={isStepValid()}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <Card variant="glass" className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="glass-subtle"
                size="lg"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "bg-purple-500 w-8"
                        : index < currentStep
                        ? "bg-purple-300"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="glass-purple"
                size="lg"
                onClick={goNext}
                disabled={!isStepValid()}
                className="disabled:opacity-50"
              >
                {currentStep === onboardingSteps.length - 1 ? "Complete Setup" : "Next"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}