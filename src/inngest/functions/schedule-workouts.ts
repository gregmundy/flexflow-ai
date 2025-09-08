import { inngest } from '../client';
import { db } from '@/db';
import { 
  userProfiles, 
  userPreferences,
  workoutPlans,
  workouts,
  type NewWorkout,
  type UserProfile 
} from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export const scheduleWorkouts = inngest.createFunction(
  {
    id: 'schedule-workouts',
    name: 'Schedule User Workouts',
    concurrency: {
      limit: 10, // Allow multiple scheduling operations
    },
  },
  {
    event: 'workout/schedule'
  },
  async ({ event, step }) => {
    const { 
      userId, 
      frequency = 3, // workouts per week
      preferredTimeSlots = [],
      duration = 30
    } = event.data;

    // Step 1: Validate user exists and get preferences
    const userData = await step.run('fetch-user-data', async () => {
      const profile = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (!profile[0]) {
        throw new Error(`User profile not found for userId: ${userId}`);
      }

      const prefs = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userProfileId, userId))
        .limit(1);

      return {
        profile: profile[0],
        preferences: prefs[0] || null,
      };
    });

    // Step 2: Get available workout plans for user
    const availablePlans = await step.run('fetch-workout-plans', async () => {
      const plans = await db
        .select()
        .from(workoutPlans)
        .where(eq(workoutPlans.userProfileId, userId))
        .orderBy(desc(workoutPlans.createdAt))
        .limit(10);

      return plans;
    });

    // Step 3: Generate workout schedule
    const schedule = await step.run('generate-schedule', async () => {
      const scheduleItems: NewWorkout[] = [];
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Start from today
      
      // Get user's preferred workout types and coaches
      const userWorkoutTypes = userData.profile.preferredWorkoutTypes as string[] || ['strength', 'bodyweight'];
      const preferredCoach = userData.profile.preferredCoach;
      const alternativeCoaches = userData.profile.alternativeCoaches as string[] || [];
      
      // Calculate days between workouts
      const daysBetweenWorkouts = Math.ceil(7 / frequency);
      
      // Generate schedule for next 4 weeks
      const weeksToSchedule = 4;
      const totalWorkouts = frequency * weeksToSchedule;
      
      for (let i = 0; i < totalWorkouts; i++) {
        const workoutDate = new Date(startDate);
        workoutDate.setDate(startDate.getDate() + (i * daysBetweenWorkouts));
        
        // Skip if date is in the past
        if (workoutDate < new Date()) {
          continue;
        }
        
        // Select workout plan - rotate through available plans or create variety
        let selectedPlan = availablePlans[i % availablePlans.length];
        
        // If no plans available, we'll need to generate them
        if (!selectedPlan) {
          // This would trigger workout generation for missing plans
          continue;
        }
        
        // Set preferred time if available
        if (preferredTimeSlots.length > 0) {
          const timeSlot = preferredTimeSlots[i % preferredTimeSlots.length];
          const [hours, minutes] = timeSlot.split(':').map(Number);
          workoutDate.setHours(hours, minutes, 0, 0);
        } else {
          // Default to 8:00 AM
          workoutDate.setHours(8, 0, 0, 0);
        }
        
        const scheduledWorkout: NewWorkout = {
          userProfileId: userId,
          workoutPlanId: selectedPlan.id,
          scheduledDate: workoutDate,
          status: 'SCHEDULED',
          totalExercises: Array.isArray(selectedPlan.exercisesData) 
            ? (selectedPlan.exercisesData as any[]).length 
            : 0,
        };
        
        scheduleItems.push(scheduledWorkout);
      }
      
      return scheduleItems;
    });

    // Step 4: Save scheduled workouts to database
    const savedWorkouts = await step.run('save-scheduled-workouts', async () => {
      if (schedule.length === 0) {
        throw new Error('No workouts to schedule - user may need workout plans generated first');
      }
      
      // Remove any existing future schedules for this user to avoid duplicates
      const futureDate = new Date();
      await db.delete(workouts).where(
        and(
          eq(workouts.userProfileId, userId),
          gte(workouts.scheduledDate, futureDate),
          eq(workouts.status, 'SCHEDULED')
        )
      );
      
      // Insert new schedule - ensure dates are Date objects and omit auto-generated fields
      const schedulesToInsert = schedule.map(item => ({
        userProfileId: item.userProfileId,
        workoutPlanId: item.workoutPlanId,
        scheduledDate: new Date(item.scheduledDate),
        status: item.status,
        totalExercises: item.totalExercises,
      }));
      const inserted = await db.insert(workouts).values(schedulesToInsert).returning();
      return inserted;
    });

    // Step 5: Check if user needs more workout plans
    const planGenerationNeeds = await step.run('assess-plan-needs', async () => {
      const needs: Array<{
        workoutType: string;
        coachId: string;
        priority: number;
      }> = [];
      
      // If user has fewer than 3 different workout plans, generate more variety
      if (availablePlans.length < 3) {
        const userWorkoutTypes = userData.profile.preferredWorkoutTypes as string[] || ['strength', 'bodyweight'];
        const preferredCoach = userData.profile.preferredCoach;
        const alternativeCoaches = userData.profile.alternativeCoaches as string[] || [];
        
        for (const workoutType of userWorkoutTypes) {
          // Check if we have a plan for this workout type
          const hasType = availablePlans.some(plan => plan.workoutType === workoutType);
          if (!hasType) {
            needs.push({
              workoutType,
              coachId: preferredCoach,
              priority: 1,
            });
          }
        }
        
        // Add variety with alternative coaches
        for (const coach of alternativeCoaches.slice(0, 2)) {
          needs.push({
            workoutType: userWorkoutTypes[0] || 'bodyweight',
            coachId: coach,
            priority: 2,
          });
        }
      }
      
      return needs;
    });

    // Step 6: Trigger workout generation for needed plans
    const generationTasks = await step.run('trigger-plan-generation', async () => {
      const tasks = [];
      
      for (const need of planGenerationNeeds) {
        const generationEvent = {
          name: 'workout/generate' as const,
          data: {
            userId,
            coachId: need.coachId,
            workoutType: need.workoutType,
            duration: userData.profile.preferredWorkoutDuration,
            equipment: userData.profile.availableEquipment as string[],
            fitnessLevel: userData.profile.fitnessLevel,
          },
        };
        
        // Send the event to generate new workout plans
        await inngest.send(generationEvent);
        tasks.push(generationEvent);
      }
      
      return tasks;
    });

    return {
      success: true,
      scheduledWorkouts: savedWorkouts.length,
      scheduleStartDate: schedule[0]?.scheduledDate,
      scheduleEndDate: schedule[schedule.length - 1]?.scheduledDate,
      planGenerationTriggered: generationTasks.length,
      message: `Successfully scheduled ${savedWorkouts.length} workouts for the next ${Math.ceil(savedWorkouts.length / frequency)} weeks`,
      nextWorkout: savedWorkouts[0] || null,
    };
  }
);