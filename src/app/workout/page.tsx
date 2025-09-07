"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Play, 
  Pause, 
  Star,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Zap,
  Target,
  Heart,
  Plus,
  Minus,
  Weight,
  SkipForward,
  RotateCcw,
  RefreshCw,
  X,
  Search,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Circle,
  CheckCircle,
  Dot
} from "lucide-react";

// Types
interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  instructions: string;
  hasWeight: boolean;
  targetWeight?: number;
  weightUnit?: 'lbs' | 'kg';
  alternativeExercises?: string[];
}

interface SetData {
  setNumber: number;
  weight: number;
  reps: number;
  difficulty: number;
  isExtra?: boolean; // For sets beyond planned
}

interface ExerciseProgress {
  exerciseId: number;
  completedSets: SetData[];
  plannedSets: number;
  isSubstituted?: boolean;
  substitutedWith?: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface WorkoutData {
  trainerId: string;
  exercises: Exercise[];
  exerciseProgress: { [exerciseId: number]: ExerciseProgress };
  feedback: {
    overall: number;
    energy: number;
    comments: string;
  };
}

// Validation schemas
const exerciseDataSchema = z.object({
  actualReps: z.number().min(1, "Please enter number of reps"),
  actualWeight: z.number().min(0, "Weight must be positive").optional(),
  difficulty: z.number().min(1).max(5),
});

const feedbackSchema = z.object({
  overall: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  comments: z.string().optional(),
});

type ExerciseDataForm = z.infer<typeof exerciseDataSchema>;
type FeedbackForm = z.infer<typeof feedbackSchema>;

// Sample workout data - different workout types
const workoutTemplates = {
  strength: {
    trainer: "MAX",
    trainerAvatar: "💪",
    trainerColor: "bg-red-500",
    focus: "Upper Body Strength Training",
    estimatedTime: "35 minutes",
    exercises: [
      { 
        id: 1,
        name: "Bench Press", 
        sets: 3, 
        reps: "8-10", 
        restTime: 180,
        hasWeight: true,
        targetWeight: 135,
        weightUnit: 'lbs' as const,
        instructions: "Choose a weight that challenges you for the target rep range. Increase weight when you can complete all reps with good form.",
        alternativeExercises: ["Push-ups", "Dumbbell Press", "Incline Press", "Chest Press Machine"]
      },
      { 
        id: 2,
        name: "Bent-Over Rows", 
        sets: 3, 
        reps: "8-10", 
        restTime: 180,
        hasWeight: true,
        targetWeight: 95,
        weightUnit: 'lbs' as const,
        instructions: "Keep your back straight and core tight. Pull the bar to your lower chest, squeezing shoulder blades together.",
        alternativeExercises: ["Cable Rows", "T-Bar Rows", "Chest-Supported Rows", "Dumbbell Rows"]
      },
      { 
        id: 3,
        name: "Overhead Press", 
        sets: 3, 
        reps: "6-8", 
        restTime: 180,
        hasWeight: true,
        targetWeight: 75,
        weightUnit: 'lbs' as const,
        instructions: "Press weight straight up overhead. Keep core tight and avoid arching your back excessively.",
        alternativeExercises: ["Dumbbell Press", "Pike Push-ups", "Shoulder Press Machine", "Arnold Press"]
      },
      { 
        id: 4,
        name: "Bicep Curls", 
        sets: 3, 
        reps: "12-15", 
        restTime: 120,
        hasWeight: true,
        targetWeight: 25,
        weightUnit: 'lbs' as const,
        instructions: "Control the weight on both the lifting and lowering phases. Keep your elbows stationary at your sides.",
        alternativeExercises: ["Hammer Curls", "Cable Curls", "Resistance Band Curls", "Preacher Curls"]
      }
    ]
  },
  bodyweight: {
    trainer: "ZARA",
    trainerAvatar: "⚡",
    trainerColor: "bg-green-500",
    focus: "Full Body HIIT Circuit",
    estimatedTime: "25 minutes",
    exercises: [
      {
        id: 1,
        name: "Push-ups",
        sets: 3,
        reps: "10-15",
        restTime: 60,
        hasWeight: false,
        instructions: "Keep your body in a straight line from head to heels. Lower until your chest nearly touches the ground, then push back up with control.",
        alternativeExercises: ["Knee Push-ups", "Incline Push-ups", "Wall Push-ups", "Diamond Push-ups"]
      },
      {
        id: 2,
        name: "Bodyweight Squats",
        sets: 3,
        reps: "15-20",
        restTime: 60,
        hasWeight: false,
        instructions: "Lower down as if sitting back into a chair, keeping your chest up and knees tracking over your toes. Go down until thighs are parallel to the floor.",
        alternativeExercises: ["Chair Squats", "Jump Squats", "Single-Leg Squats", "Sumo Squats"]
      },
      {
        id: 3,
        name: "Mountain Climbers",
        sets: 3,
        reps: "20-30",
        restTime: 60,
        hasWeight: false,
        instructions: "Start in plank position. Quickly alternate bringing each knee toward your chest while keeping your core tight and hips level.",
        alternativeExercises: ["High Knees", "Plank Jacks", "Running in Place", "Bear Crawls"]
      },
      {
        id: 4,
        name: "Plank Hold",
        sets: 3,
        reps: "30-60s",
        restTime: 60,
        hasWeight: false,
        instructions: "Hold a straight line from head to heels, engaging your core and glutes. Keep your breathing steady and avoid sagging hips.",
        alternativeExercises: ["Knee Plank", "Side Plank", "Plank Up-Downs", "Dead Bug"]
      }
    ]
  },
  flexibility: {
    trainer: "SAGE",
    trainerAvatar: "🧘",
    trainerColor: "bg-purple-500",
    focus: "Evening Flexibility & Recovery",
    estimatedTime: "20 minutes",
    exercises: [
      {
        id: 1,
        name: "Cat-Cow Stretch",
        sets: 2,
        reps: "8-12",
        restTime: 30,
        hasWeight: false,
        instructions: "Start on hands and knees. Alternate between arching your back (cow) and rounding your spine (cat). Move slowly and breathe deeply with each movement.",
        alternativeExercises: ["Child's Pose Flow", "Spinal Twists", "Neck Rolls", "Shoulder Circles"]
      },
      {
        id: 2,
        name: "Forward Fold",
        sets: 2,
        reps: "Hold 30-45s",
        restTime: 30,
        hasWeight: false,
        instructions: "Stand tall, then hinge at your hips to fold forward. Let your arms hang heavy or hold opposite elbows. Focus on lengthening your spine and breathing deeply.",
        alternativeExercises: ["Seated Forward Fold", "Wide-Leg Forward Fold", "Ragdoll Pose", "Standing Side Bend"]
      },
      {
        id: 3,
        name: "Hip Flexor Stretch",
        sets: 2,
        reps: "Hold 30s each leg",
        restTime: 30,
        hasWeight: false,
        instructions: "Step into a lunge position. Lower your back knee toward the ground and press your hips forward gently. Feel the stretch in the front of your back leg.",
        alternativeExercises: ["Pigeon Pose", "Figure-4 Stretch", "90/90 Hip Stretch", "Standing Hip Flexor Stretch"]
      },
      {
        id: 4,
        name: "Gentle Spinal Twist",
        sets: 2,
        reps: "Hold 30s each side",
        restTime: 30,
        hasWeight: false,
        instructions: "Sit with legs extended, cross one leg over. Place opposite hand on the floor behind you, gently twist toward the crossed leg. Honor your body's limits.",
        alternativeExercises: ["Supine Spinal Twist", "Standing Twist", "Thread the Needle", "Eagle Arms Twist"]
      }
    ]
  },
  mobility: {
    trainer: "ACE",
    trainerAvatar: "🤗",
    trainerColor: "bg-blue-500",
    focus: "Morning Mobility & Activation",
    estimatedTime: "15 minutes",
    exercises: [
      {
        id: 1,
        name: "Arm Circles",
        sets: 2,
        reps: "10 forward, 10 back",
        restTime: 20,
        hasWeight: false,
        instructions: "Stand with arms extended out to your sides. Make slow, controlled circles, gradually increasing the size. Focus on warming up your shoulders gently.",
        alternativeExercises: ["Shoulder Shrugs", "Cross-body Arm Swings", "Wall Angels", "Doorway Chest Stretch"]
      },
      {
        id: 2,
        name: "Leg Swings",
        sets: 2,
        reps: "10 each direction",
        restTime: 20,
        hasWeight: false,
        instructions: "Hold onto a wall for balance. Swing one leg forward and back, then side to side. Keep the movement controlled and within a comfortable range.",
        alternativeExercises: ["Marching in Place", "Ankle Circles", "Knee Lifts", "Calf Raises"]
      },
      {
        id: 3,
        name: "Neck Rolls",
        sets: 2,
        reps: "5 each direction",
        restTime: 20,
        hasWeight: false,
        instructions: "Slowly roll your head in a gentle circle, taking care not to force any position. Move with kindness toward your neck and listen to your body.",
        alternativeExercises: ["Neck Side Bends", "Chin Tucks", "Shoulder Blade Squeezes", "Upper Trap Stretch"]
      },
      {
        id: 4,
        name: "Gentle Back Extension",
        sets: 2,
        reps: "8-10",
        restTime: 20,
        hasWeight: false,
        instructions: "Lie face down, place hands under your shoulders. Gently press up, lifting your chest while keeping hips on the ground. Only go as far as feels comfortable.",
        alternativeExercises: ["Cobra Pose", "Camel Pose", "Standing Back Bend", "Bridge Pose"]
      }
    ]
  }
};

// Select workout type - you can change this to test different workout types
// Options: 'strength', 'bodyweight', 'flexibility', 'mobility'
const currentWorkoutType: keyof typeof workoutTemplates = 'bodyweight'; // 👈 Change this to test different workout types!
const sampleWorkout = {
  ...workoutTemplates[currentWorkoutType],
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
};

// Enhanced Timer component with skip and duration controls
const RestTimer = ({ 
  initialDuration, 
  onComplete, 
  onSkip 
}: { 
  initialDuration: number; 
  onComplete: () => void; 
  onSkip?: () => void;
}) => {
  // Duration presets in seconds
  const PRESET_DURATIONS = [30, 60, 120, 180, 300]; // 30s, 1m, 2m, 3m, 5m
  
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Handle completion in a separate useEffect
  useEffect(() => {
    if (timeLeft === 0 && !isActive) {
      onComplete();
    }
  }, [timeLeft, isActive, onComplete]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setTimeLeft(selectedDuration);
    setIsActive(false);
  };

  const skipRest = () => {
    setIsActive(false);
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const updateDuration = (newDuration: number) => {
    setSelectedDuration(newDuration);
    setTimeLeft(newDuration);
    setIsActive(false);
  };

  const adjustDuration = (adjustment: number) => {
    const newDuration = Math.max(10, selectedDuration + adjustment); // Minimum 10 seconds
    updateDuration(newDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDurationLabel = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = seconds / 60;
    return minutes === Math.floor(minutes) ? `${minutes}m` : `${minutes.toFixed(1)}m`;
  };

  const progressPercentage = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  return (
    <Card className="w-full bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-3 space-y-3">
        {/* Compact Header with Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-blue-700">Rest Time</p>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Duration Preset Buttons */}
        <div className="grid grid-cols-5 gap-1">
          {PRESET_DURATIONS.map((preset) => (
            <Button
              key={preset}
              variant={selectedDuration === preset ? "default" : "outline"}
              size="sm"
              onClick={() => updateDuration(preset)}
              className={`h-8 text-xs font-medium ${
                selectedDuration === preset 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-blue-50"
              }`}
              disabled={isActive}
            >
              {formatDurationLabel(preset)}
            </Button>
          ))}
        </div>

        {/* Primary Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button 
              onClick={startTimer} 
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              className="flex-1 h-10 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
              variant="outline"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={resetTimer} 
            variant="outline" 
            size="sm"
            className="h-10 px-3"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={skipRest}
            variant="outline"
            className="flex-1 h-10 border-orange-400 text-orange-600 hover:bg-orange-50 font-semibold"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Star Rating Component
const StarRating = ({ rating, onRatingChange, label }: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
  label: string;
}) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star 
              className={`w-8 h-8 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Weight Input Component
const WeightInput = ({ 
  weight, 
  onWeightChange, 
  unit = 'lbs',
  targetWeight,
  label 
}: { 
  weight: number; 
  onWeightChange: (weight: number) => void;
  unit?: 'lbs' | 'kg';
  targetWeight?: number;
  label: string;
}) => {
  const incrementWeight = () => {
    const increment = unit === 'lbs' ? 5 : 2.5;
    onWeightChange(weight + increment);
  };

  const decrementWeight = () => {
    const decrement = unit === 'lbs' ? 5 : 2.5;
    const newWeight = Math.max(0, weight - decrement);
    onWeightChange(newWeight);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {targetWeight && (
          <p className="text-xs text-gray-500">
            Target: {targetWeight} {unit}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={decrementWeight}
          className="h-10 w-10 p-0 shrink-0"
          disabled={weight <= 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <Input
            type="number"
            value={weight || ""}
            onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
            className="h-10 text-center pr-12"
            min="0"
            step={unit === 'lbs' ? 5 : 2.5}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
            {unit}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={incrementWeight}
          className="h-10 w-10 p-0 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onWeightChange(weight + (unit === 'lbs' ? 10 : 5))}
          className="text-xs h-7 px-2"
        >
          +{unit === 'lbs' ? 10 : 5}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onWeightChange(weight + (unit === 'lbs' ? 25 : 10))}
          className="text-xs h-7 px-2"
        >
          +{unit === 'lbs' ? 25 : 10}
        </Button>
      </div>
    </div>
  );
};

// Exercise Substitution Modal Component
const ExerciseSubstitutionModal = ({ 
  exercise, 
  isOpen, 
  onClose, 
  onSubstitute 
}: { 
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onSubstitute: (newExerciseName: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Substitute Exercise</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Equipment unavailable for <strong>{exercise.name}</strong>? Choose an alternative:
          </p>
        </div>
        
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {exercise.alternativeExercises?.map((altExercise, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start p-4 h-auto text-left"
              onClick={() => {
                onSubstitute(altExercise);
                onClose();
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{altExercise}</span>
                <RefreshCw className="w-4 h-4 text-green-600" />
              </div>
            </Button>
          ))}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Your completed sets will be preserved with the substituted exercise
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Exercise Navigation Header Component
const ExerciseNavigationHeader = ({ 
  exercises, 
  currentExerciseIndex, 
  exerciseProgress,
  onExerciseSelect 
}: {
  exercises: Exercise[];
  currentExerciseIndex: number;
  exerciseProgress: { [exerciseId: number]: ExerciseProgress };
  onExerciseSelect: (index: number) => void;
}) => {
  const getExerciseStatus = (exercise: Exercise) => {
    const progress = exerciseProgress[exercise.id];
    if (!progress) return 'not-started';
    return progress.status;
  };

  const getStatusIcon = (exercise: Exercise) => {
    const status = getExerciseStatus(exercise);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Dot className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="sticky top-0 bg-white shadow-sm z-10">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-gray-600">Exercise Progress</h2>
          <span className="text-xs text-gray-500">
            {currentExerciseIndex + 1} of {exercises.length}
          </span>
        </div>
        
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {exercises.map((exercise, index) => {
            const progress = exerciseProgress[exercise.id];
            const isSubstituted = progress?.isSubstituted;
            const displayName = isSubstituted ? progress.substitutedWith : exercise.name;
            
            return (
              <button
                key={exercise.id}
                onClick={() => onExerciseSelect(index)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
                  index === currentExerciseIndex
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getStatusIcon(exercise)}
                <span className={`${isSubstituted ? 'italic' : ''} truncate max-w-16`}>
                  {displayName}
                </span>
                {isSubstituted && (
                  <RefreshCw className="w-2 h-2 opacity-70" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function WorkoutPage() {
  // Screen state: 'overview' | 'exercise' | 'completion'
  const [currentScreen, setCurrentScreen] = useState<'overview' | 'exercise' | 'completion'>('overview');
  
  // Exercise state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  
  // Initialize exercise progress for all exercises
  const initializeExerciseProgress = () => {
    const progress: { [exerciseId: number]: ExerciseProgress } = {};
    sampleWorkout.exercises.forEach(exercise => {
      progress[exercise.id] = {
        exerciseId: exercise.id,
        completedSets: [],
        plannedSets: exercise.sets,
        status: 'not-started'
      };
    });
    return progress;
  };
  
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    trainerId: "MAX",
    exercises: sampleWorkout.exercises,
    exerciseProgress: initializeExerciseProgress(),
    feedback: {
      overall: 0,
      energy: 0,
      comments: ""
    }
  });

  // Modal states
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Forms
  const exerciseForm = useForm<ExerciseDataForm>({
    resolver: zodResolver(exerciseDataSchema),
    defaultValues: {
      actualReps: parseInt(sampleWorkout.exercises[0].reps.split('-')[0]) || 8,
      actualWeight: sampleWorkout.exercises[0].targetWeight || 0,
      difficulty: 3
    }
  });

  const feedbackForm = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overall: 4,
      energy: 3,
      comments: ""
    }
  });

  const currentExercise = sampleWorkout.exercises[currentExerciseIndex];
  const currentProgress = workoutData.exerciseProgress[currentExercise.id];
  const totalExercises = sampleWorkout.exercises.length;
  const completedSets = currentProgress?.completedSets.length || 0;
  const totalPlannedSets = currentProgress?.plannedSets || currentExercise.sets;
  const isInExtraSets = completedSets >= totalPlannedSets;
  const isLastPlannedSet = currentSet === totalPlannedSets - 1;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;

  // Handlers
  const startWorkout = () => {
    setCurrentScreen('exercise');
  };

  const completeSet = (data: ExerciseDataForm) => {
    const newSet: SetData = {
      setNumber: completedSets + 1,
      weight: data.actualWeight || 0,
      reps: data.actualReps,
      difficulty: data.difficulty,
      isExtra: isInExtraSets
    };

    // Update exercise progress
    setWorkoutData(prev => {
      const updatedProgress = { ...prev.exerciseProgress };
      const exerciseProgress = { ...updatedProgress[currentExercise.id] };
      
      exerciseProgress.completedSets.push(newSet);
      exerciseProgress.status = 'in-progress';
      
      // Mark as completed if we've done all planned sets (unless they want to continue with extra sets)
      if (exerciseProgress.completedSets.length >= exerciseProgress.plannedSets) {
        exerciseProgress.status = 'completed';
      }
      
      updatedProgress[currentExercise.id] = exerciseProgress;
      
      return { ...prev, exerciseProgress: updatedProgress };
    });

    // Move to rest timer (we'll check completion in the rest timer completion handler)
    setShowRestTimer(true);
  };

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
    
    // Check if all exercises are completed before continuing
    const allExercisesCompleted = Object.values(workoutData.exerciseProgress).every(progress => 
      progress && progress.completedSets.length >= progress.plannedSets
    );
    
    if (allExercisesCompleted) {
      setCurrentScreen('completion');
      return;
    }
    
    setCurrentSet(prev => prev + 1);
    
    // Reset form with current exercise data
    const displayExercise = currentProgress?.isSubstituted 
      ? { ...currentExercise, name: currentProgress.substitutedWith || currentExercise.name }
      : currentExercise;
      
    exerciseForm.reset({
      actualReps: parseInt(displayExercise.reps.split('-')[0]) || 8,
      actualWeight: displayExercise.targetWeight || 0,
      difficulty: 3
    });
  }, [currentExercise, currentProgress, exerciseForm, workoutData.exerciseProgress]);

  const submitWorkout = (data: FeedbackForm) => {
    setWorkoutData(prev => ({ ...prev, feedback: data }));
    // Here you would typically send the data to your backend
    console.log('Workout completed:', { ...workoutData, feedback: data });
    
    // Show success message or redirect
    alert('Workout submitted! Great job crushing it today! 💪');
  };

  // Navigation functions
  const navigateToExercise = (exerciseIndex: number) => {
    if (exerciseIndex >= 0 && exerciseIndex < sampleWorkout.exercises.length) {
      const exercise = sampleWorkout.exercises[exerciseIndex];
      const progress = workoutData.exerciseProgress[exercise.id];
      
      setCurrentExerciseIndex(exerciseIndex);
      setCurrentSet(progress?.completedSets.length || 0); // Start from next incomplete set
      setShowRestTimer(false);
      
      // Reset form with exercise data
      const displayExercise = progress?.isSubstituted 
        ? { ...exercise, name: progress.substitutedWith || exercise.name }
        : exercise;
        
      exerciseForm.reset({
        actualReps: parseInt(displayExercise.reps.split('-')[0]) || 8,
        actualWeight: displayExercise.targetWeight || 0,
        difficulty: 3
      });
    }
  };

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      navigateToExercise(currentExerciseIndex - 1);
    }
  };
  
  const goToNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      navigateToExercise(currentExerciseIndex + 1);
    }
  };

  // Exercise substitution
  const handleExerciseSubstitution = (newExerciseName: string) => {
    setWorkoutData(prev => {
      const updatedProgress = { ...prev.exerciseProgress };
      const exerciseProgress = { ...updatedProgress[currentExercise.id] };
      
      exerciseProgress.isSubstituted = true;
      exerciseProgress.substitutedWith = newExerciseName;
      
      updatedProgress[currentExercise.id] = exerciseProgress;
      
      return { ...prev, exerciseProgress: updatedProgress };
    });
  };

  // Add extra set functionality
  const handleAddExtraSet = () => {
    // Just continue with current set logic - the completedSets >= plannedSets check will handle extra sets
    setCurrentSet(prev => prev + 1);
    exerciseForm.reset({
      actualReps: parseInt(currentExercise.reps.split('-')[0]) || 8,
      actualWeight: currentExercise.targetWeight || 0,
      difficulty: 3
    });
  };

  const calculateProgress = () => {
    const totalPlannedSets = sampleWorkout.exercises.reduce((total, ex) => total + ex.sets, 0);
    const totalCompletedSets = Object.values(workoutData.exerciseProgress).reduce((total, progress) => {
      // Count only completed sets up to planned sets for progress calculation
      return total + Math.min(progress.completedSets.length, progress.plannedSets);
    }, 0);
    return Math.round((totalCompletedSets / totalPlannedSets) * 100);
  };

  // Helper function to get display name for current exercise
  const getCurrentExerciseDisplayName = () => {
    return currentProgress?.isSubstituted ? currentProgress.substitutedWith : currentExercise.name;
  };

  // Helper function to check if we can add extra sets
  const canAddExtraSets = () => {
    return completedSets >= totalPlannedSets && !showRestTimer;
  };

  // Initialize exercise as in-progress when starting
  useEffect(() => {
    if (currentScreen === 'exercise') {
      setWorkoutData(prev => {
        const updatedProgress = { ...prev.exerciseProgress };
        const exerciseProgress = { ...updatedProgress[currentExercise.id] };
        
        if (exerciseProgress.status === 'not-started') {
          exerciseProgress.status = 'in-progress';
          updatedProgress[currentExercise.id] = exerciseProgress;
          return { ...prev, exerciseProgress: updatedProgress };
        }
        
        return prev;
      });
    }
  }, [currentScreen, currentExercise.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Screen 1: Overview */}
          {currentScreen === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="p-4 space-y-6"
            >
              {/* Trainer Greeting */}
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      {sampleWorkout.trainerAvatar}
                    </div>
                    <div>
                      <Badge variant="outline" className="border-white/30 text-white mb-2">
                        {sampleWorkout.trainer}
                      </Badge>
                      <CardTitle className="text-xl font-bold">
                        Time to LIFT HEAVY, champion!
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-red-100">
                    Today we're hitting the weights HARD! Build that strength like the beast you are! Let's break some personal records! 💪
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Workout Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Today's Workout
                    <Badge variant="secondary">{sampleWorkout.date}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {sampleWorkout.focus}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {sampleWorkout.estimatedTime}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleWorkout.exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{exercise.name}</p>
                        <p className="text-sm text-gray-600">
                          {exercise.sets} sets × {exercise.reps}
                          {exercise.hasWeight && (
                            <span className="ml-2 text-blue-600 font-medium">
                              @ {exercise.targetWeight} {exercise.weightUnit}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Start Button */}
              <Button
                onClick={startWorkout}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Workout
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Screen 2: Exercise Execution */}
          {currentScreen === 'exercise' && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Exercise Navigation Header */}
              <ExerciseNavigationHeader
                exercises={sampleWorkout.exercises}
                currentExerciseIndex={currentExerciseIndex}
                exerciseProgress={workoutData.exerciseProgress}
                onExerciseSelect={navigateToExercise}
              />
              
              <div className="p-3 space-y-4">
              {/* Compact Progress Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Set {currentSet + 1} of {currentExercise.sets}{isInExtraSets && ' (Extra)'}
                  </span>
                  <span className="text-gray-500">
                    {calculateProgress()}% complete
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              {/* Current Exercise - Compact */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {getCurrentExerciseDisplayName()}
                        </CardTitle>
                        {currentProgress?.isSubstituted && (
                          <Badge variant="outline" className="text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Sub
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {currentExercise.instructions}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSubstitutionModal(true)}
                      className="text-blue-600 hover:text-blue-700 shrink-0 ml-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {currentExercise.hasWeight ? (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-6 text-center">
                        <div>
                          <p className="text-lg font-bold text-red-600">
                            {currentExercise.targetWeight} {currentExercise.weightUnit}
                          </p>
                          <p className="text-xs text-red-700">Target Weight</p>
                        </div>
                        <div className="w-px h-8 bg-red-200"></div>
                        <div>
                          <p className="text-lg font-bold text-red-600">
                            {currentExercise.reps}
                          </p>
                          <p className="text-xs text-red-700">Target Reps</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-red-600">
                        {currentExercise.reps}
                      </p>
                      <p className="text-xs text-red-700">Target Reps</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rest Timer (if active) */}
              {showRestTimer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <RestTimer 
                    initialDuration={currentExercise.restTime} 
                    onComplete={handleRestComplete} 
                  />
                </motion.div>
              )}

              {/* Exercise Input Form - Compact */}
              {!showRestTimer && (
                <Form {...exerciseForm}>
                  <form onSubmit={exerciseForm.handleSubmit(completeSet)} className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Record Your Set</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Compact Weight and Reps Row */}
                        <div className={`grid ${currentExercise.hasWeight ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                          {/* Weight Input (if exercise has weight) */}
                          {currentExercise.hasWeight && (
                            <FormField
                              control={exerciseForm.control}
                              name="actualWeight"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm">Weight ({currentExercise.weightUnit})</FormLabel>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => field.onChange((field.value || 0) - (currentExercise.weightUnit === 'lbs' ? 5 : 2.5))}
                                      className="h-10 w-10 p-0 shrink-0"
                                      disabled={(field.value || 0) <= 0}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="h-10 text-center"
                                      min="0"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => field.onChange((field.value || 0) + (currentExercise.weightUnit === 'lbs' ? 5 : 2.5))}
                                      className="h-10 w-10 p-0 shrink-0"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {/* Actual Reps Input */}
                          <FormField
                            control={exerciseForm.control}
                            name="actualReps"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Reps completed</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min="1"
                                    className="h-10 text-center"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Difficulty Rating - Compact */}
                        <FormField
                          control={exerciseForm.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-sm">Difficulty</FormLabel>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => field.onChange(star)}
                                      className="p-1 hover:scale-110 transition-transform"
                                    >
                                      <Star 
                                        className={`w-6 h-6 ${
                                          star <= field.value 
                                            ? 'fill-yellow-400 text-yellow-400' 
                                            : 'fill-gray-200 text-gray-300'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 text-center">
                                1 = Too Easy • 3 = Just Right • 5 = Very Hard
                              </p>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Action Buttons Row */}
                    <div className="flex gap-2">
                      {/* Navigation Buttons */}
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={goToPreviousExercise}
                        disabled={currentExerciseIndex === 0}
                        className="h-12 px-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {/* Complete Set Button */}
                      <Button
                        type="submit"
                        className={`flex-1 h-12 font-semibold ${
                          isInExtraSets
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        }`}
                      >
                        {isInExtraSets ? (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Extra Set
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete Set
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={goToNextExercise}
                        disabled={currentExerciseIndex === totalExercises - 1}
                        className="h-12 px-3"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Add Extra Set Button (shown after completing all planned sets) */}
                    {canAddExtraSets() && (
                      <Button
                        type="button"
                        onClick={handleAddExtraSet}
                        variant="outline"
                        className="w-full h-10 border-green-400 text-green-600 hover:bg-green-50 font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Extra Set
                      </Button>
                    )}
                  </form>
                </Form>
                )}
                
              </div>
            </motion.div>
          )}

          {/* Screen 3: Completion & Feedback */}
          {currentScreen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="p-4 space-y-6"
            >
              {/* Celebration Header */}
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center">
                <CardContent className="pt-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                  >
                    <Trophy className="w-16 h-16 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">WEIGHTS DEMOLISHED!</h2>
                  <p className="text-green-100">
                    You just CRUSHED that strength session like a true warrior! Those weights didn't stand a chance against your beast mode power! MAX is PUMPED! 💪
                  </p>
                </CardContent>
              </Card>

              {/* Workout Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Workout Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{totalExercises}</p>
                      <p className="text-sm text-gray-600">Exercises</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {sampleWorkout.exercises.reduce((total, ex) => total + ex.sets, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Sets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Form */}
              <Form {...feedbackForm}>
                <form onSubmit={feedbackForm.handleSubmit(submitWorkout)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        How was your workout?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Rating */}
                      <FormField
                        control={feedbackForm.control}
                        name="overall"
                        render={({ field }) => (
                          <FormItem>
                            <StarRating
                              rating={field.value}
                              onRatingChange={field.onChange}
                              label="Overall workout rating"
                            />
                          </FormItem>
                        )}
                      />

                      {/* Energy Level */}
                      <FormField
                        control={feedbackForm.control}
                        name="energy"
                        render={({ field }) => (
                          <FormItem>
                            <StarRating
                              rating={field.value}
                              onRatingChange={field.onChange}
                              label="Energy level after workout"
                            />
                          </FormItem>
                        )}
                      />

                      {/* Comments */}
                      <FormField
                        control={feedbackForm.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional feedback for MAX (optional)</FormLabel>
                            <FormControl>
                              <textarea
                                {...field}
                                className="min-h-[80px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="How did the workout feel? Any exercises you loved or want to modify?"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Submit & Complete
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Exercise Substitution Modal */}
      <ExerciseSubstitutionModal
        exercise={currentExercise}
        isOpen={showSubstitutionModal}
        onClose={() => setShowSubstitutionModal(false)}
        onSubstitute={handleExerciseSubstitution}
      />
    </div>
  );
}