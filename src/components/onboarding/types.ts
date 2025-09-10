export interface OnboardingData {
  // Step 1: Welcome & Disclaimers
  healthDisclaimer: boolean;
  dataPrivacyConsent: boolean;
  
  // Step 2: Fitness Focus Areas
  focusAreas: FitnessArea[];
  
  // Step 3: Activity Level Assessment
  exerciseFrequency: ExerciseFrequency;
  exerciseIntensity: ExerciseIntensity;
  
  // Step 4: Experience Level
  experienceLevel: ExperienceLevel;
  
  // Step 5: Workout Preferences
  workoutDuration: number; // minutes (15-90)
  availableEquipment: Equipment[];
  workoutTypes: WorkoutType[];
  
  // Step 6: Schedule Preferences
  preferredDays: WeekDay[];
  timeOfDay: TimePreference;
  smsReminderTiming: SMSTimingOption;
  smsConsentTCPA: boolean;
  
  // Step 7: Safe Movement Preferences
  movementsToAvoid: MovementRestriction[];
  
  // Step 8: AI Trainer Selection
  selectedTrainer: string;
}

export type FitnessArea = 
  | "strength-muscle"
  | "cardiovascular-endurance"
  | "weight-management"
  | "flexibility-mobility"
  | "athletic-performance"
  | "stress-relief"
  | "posture-movement"
  | "daily-energy";

export type ExerciseFrequency = 
  | "never"
  | "1-2-per-month"
  | "1-per-week"
  | "2-3-per-week"
  | "4-5-per-week"
  | "daily";

export type ExerciseIntensity = 
  | "light"
  | "moderate"
  | "vigorous"
  | "mixed";

export type ExperienceLevel = 
  | "beginner"
  | "intermediate"
  | "advanced";

export type Equipment = 
  | "bodyweight-only"
  | "resistance-bands"
  | "dumbbells"
  | "barbells"
  | "kettlebells"
  | "yoga-mat"
  | "pull-up-bar"
  | "cardio-equipment"
  | "full-gym-access";

export type WorkoutType = 
  | "strength-training"
  | "cardio"
  | "hiit"
  | "yoga-pilates"
  | "stretching"
  | "sports-specific"
  | "dance-movement"
  | "outdoor-activities";

export type WeekDay = 
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TimePreference = 
  | "early-morning"
  | "morning"
  | "afternoon"
  | "evening"
  | "flexible";

export type SMSTimingOption = 
  | "night-before"
  | "morning-of"
  | "30-min-before"
  | "no-reminders";

export type MovementRestriction = 
  | "high-impact-jumping"
  | "overhead-movements"
  | "deep-squatting"
  | "running-jogging"
  | "heavy-lifting"
  | "twisting-movements"
  | "balance-challenging"
  | "floor-exercises"
  | "none";

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

export interface OnboardingStepProps {
  data: Partial<OnboardingData>;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isValid: boolean;
}

export interface FitnessAreaOption {
  id: FitnessArea;
  title: string;
  description: string;
  icon: string;
}

export interface EquipmentOption {
  id: Equipment;
  title: string;
  description: string;
  icon: string;
}

export interface WorkoutTypeOption {
  id: WorkoutType;
  title: string;
  description: string;
  icon: string;
}

export interface MovementRestrictionOption {
  id: MovementRestriction;
  title: string;
  description: string;
  icon: string;
}

export interface TrainerProfile {
  name: string;
  avatar: string;
  personality: string;
  description: string;
  style: string;
  color: string;
  image: string;
}