"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingStepProps, WeekDay, TimePreference, SMSTimingOption } from "../types";

const weekDayOptions: { id: WeekDay; title: string; short: string }[] = [
  { id: "monday", title: "Monday", short: "Mon" },
  { id: "tuesday", title: "Tuesday", short: "Tue" },
  { id: "wednesday", title: "Wednesday", short: "Wed" },
  { id: "thursday", title: "Thursday", short: "Thu" },
  { id: "friday", title: "Friday", short: "Fri" },
  { id: "saturday", title: "Saturday", short: "Sat" },
  { id: "sunday", title: "Sunday", short: "Sun" }
];

const timeOptions: { id: TimePreference; title: string; description: string; icon: string }[] = [
  { id: "early-morning", title: "Early Morning", description: "5:00 AM - 7:00 AM", icon: "🌅" },
  { id: "morning", title: "Morning", description: "7:00 AM - 11:00 AM", icon: "☀️" },
  { id: "afternoon", title: "Afternoon", description: "11:00 AM - 5:00 PM", icon: "🌤️" },
  { id: "evening", title: "Evening", description: "5:00 PM - 9:00 PM", icon: "🌆" },
  { id: "flexible", title: "Flexible", description: "Any time works for me", icon: "🔄" }
];

const smsTimingOptions: { id: SMSTimingOption; title: string; description: string }[] = [
  { id: "night-before", title: "Night Before", description: "Get your workout the evening before (7:00 PM)" },
  { id: "morning-of", title: "Morning Of", description: "Receive your workout in the early morning (6:00 AM)" },
  { id: "30-min-before", title: "30 Minutes Before", description: "Get reminded 30 minutes before your preferred time" },
  { id: "no-reminders", title: "No Reminders", description: "Just receive the daily workout, no timing reminders" }
];

export function ScheduleStep({ data, updateData }: OnboardingStepProps) {
  const selectedDays = data.preferredDays || [];
  const selectedTime = data.timeOfDay;
  const selectedSMSTiming = data.smsReminderTiming;
  const smsConsent = data.smsConsentTCPA || false;

  const toggleDay = (dayId: WeekDay) => {
    const isSelected = selectedDays.includes(dayId);
    let newDays: WeekDay[];
    
    if (isSelected) {
      newDays = selectedDays.filter(id => id !== dayId);
    } else {
      newDays = [...selectedDays, dayId];
    }
    
    updateData({ preferredDays: newDays });
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
              When do you prefer to work out?
            </CardTitle>
            <p className="glass-text-secondary text-base leading-relaxed max-w-2xl mx-auto">
              Help us schedule your workouts at the best times for your lifestyle. 
              We&apos;ll send your personalized workout via SMS at optimal times.
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Preferred Days */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              Which days work best for you?
            </CardTitle>
            <p className="glass-text-secondary text-sm mb-4">Select your preferred workout days</p>
            <div className="grid grid-cols-7 gap-2">
              {weekDayOptions.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                
                return (
                  <motion.div
                    key={day.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      variant="glass-interactive"
                      className={`cursor-pointer transition-all duration-300 text-center ${
                        isSelected 
                          ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                          : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                      }`}
                      onClick={() => toggleDay(day.id)}
                    >
                      <CardContent className="p-3">
                        <div className={`font-semibold text-sm ${
                          isSelected ? "glass-text-purple" : "glass-text-primary"
                        }`}>
                          {day.short}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-sm glass-text-secondary mt-4">
                Selected {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} per week
              </p>
            )}
          </CardHeader>
        </Card>
      </motion.div>

      {/* Time of Day */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              What time of day do you prefer?
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {timeOptions.map((option) => {
                const isSelected = selectedTime === option.id;
                
                return (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      variant="glass-interactive"
                      className={`cursor-pointer transition-all duration-300 h-full ${
                        isSelected 
                          ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                          : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                      }`}
                      onClick={() => updateData({ timeOfDay: option.id })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <h4 className={`font-semibold text-sm mb-1 ${
                          isSelected ? "glass-text-purple" : "glass-text-primary"
                        }`}>
                          {option.title}
                        </h4>
                        <p className="glass-text-secondary text-xs">
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

      {/* SMS Timing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card variant="glass" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              When should we send your workout?
            </CardTitle>
            <div className="space-y-3">
              {smsTimingOptions.map((option) => {
                const isSelected = selectedSMSTiming === option.id;
                
                return (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card
                      variant="glass-interactive"
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? "glass-selection-card selected ring-2 ring-purple-400 bg-purple-50" 
                          : "glass-selection-card hover:ring-2 hover:ring-purple-200"
                      }`}
                      onClick={() => updateData({ smsReminderTiming: option.id })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-0.5 ${
                            isSelected 
                              ? "bg-purple-500 border-purple-500" 
                              : "border-gray-300 glass-card-subtle"
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-semibold mb-1 ${
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

      {/* TCPA Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card variant="glass" className="p-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4 text-blue-700">
              SMS Communication Agreement
            </CardTitle>
            <div className="glass-text-secondary leading-relaxed space-y-4">
              <p>
                <strong>By proceeding, you consent to receive recurring SMS text messages</strong> from FlexFlow at the phone number you provide. Messages will include your daily workout plans, motivational content, and service updates.
              </p>
              <p>
                <strong>Message frequency:</strong> You will receive 1-2 messages per day on your selected workout days. Additional messages may be sent for account updates or special content.
              </p>
              <p>
                <strong>Message and data rates may apply.</strong> Check with your mobile carrier for details. FlexFlow is not responsible for carrier charges.
              </p>
              <p>
                <strong>You can opt out at any time</strong> by texting STOP to any message from FlexFlow. You may also text HELP for support. Standard message and data rates apply to STOP and HELP messages.
              </p>
              <div className="flex items-start space-x-3 mt-6 p-4 glass-card-subtle rounded-lg">
                <Checkbox
                  id="sms-consent"
                  checked={smsConsent}
                  onCheckedChange={(checked) => 
                    updateData({ smsConsentTCPA: !!checked })
                  }
                  className="glass-focus-ring mt-0.5"
                />
                <label 
                  htmlFor="sms-consent" 
                  className="text-sm font-medium glass-text-primary cursor-pointer leading-relaxed"
                >
                  I agree to receive SMS text messages from FlexFlow and understand I can opt out by texting STOP at any time. I acknowledge that message and data rates may apply.
                </label>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Summary */}
      {selectedDays.length > 0 && selectedTime && selectedSMSTiming && smsConsent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-purple" className="p-6">
            <CardHeader>
              <CardTitle variant="glass" className="text-lg font-semibold mb-4">
                Your Workout Schedule
              </CardTitle>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-2">Workout Days</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedDays.map((dayId) => {
                      const day = weekDayOptions.find(d => d.id === dayId);
                      return (
                        <span key={dayId} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {day?.short}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-2">Preferred Time</h5>
                  <p className="glass-text-secondary text-sm">
                    {timeOptions.find(opt => opt.id === selectedTime)?.title}
                  </p>
                </div>
                <div className="glass-card-subtle p-4 rounded-lg">
                  <h5 className="font-medium glass-text-primary mb-2">SMS Delivery</h5>
                  <p className="glass-text-secondary text-sm">
                    {smsTimingOptions.find(opt => opt.id === selectedSMSTiming)?.title}
                  </p>
                </div>
              </div>
              <p className="glass-text-secondary text-sm leading-relaxed">
                Perfect! You&apos;ll receive personalized workouts {selectedDays.length} times per week, 
                optimized for your {timeOptions.find(opt => opt.id === selectedTime)?.title.toLowerCase()} schedule. 
                Your SMS consent is confirmed and you can opt out anytime by texting STOP.
              </p>
            </CardHeader>
          </Card>
        </motion.div>
      )}
    </div>
  );
}