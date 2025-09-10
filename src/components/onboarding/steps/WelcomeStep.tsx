"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Shield, Heart } from "lucide-react";
import { OnboardingStepProps } from "../types";

export function WelcomeStep({ data, updateData, isValid }: OnboardingStepProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card variant="glass-elevated" className="p-8 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 glass-card-subtle rounded-full w-fit">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle variant="glass" className="text-2xl md:text-3xl font-bold mb-4">
              Welcome to FlexFlow AI
            </CardTitle>
            <p className="glass-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
              We&apos;re excited to help you on your fitness journey! Before we start, please review 
              these important notices about health, privacy, and how our service works.
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Health Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card variant="glass" className="p-6 border-l-4 border-l-yellow-500">
          <CardHeader>
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <CardTitle variant="glass" className="text-xl font-bold mb-3 text-yellow-700">
                  Important Health Notice
                </CardTitle>
                <div className="glass-text-secondary leading-relaxed space-y-4">
                  <p>
                    <strong>FlexFlow provides general fitness coaching and educational content only.</strong> We are not a medical device, healthcare service, or licensed nutrition practice. All workout suggestions are for informational purposes and should not replace professional medical advice.
                  </p>
                  <p>
                    <strong>Before starting any exercise program:</strong> Consult your physician, especially if you have health conditions, injuries, take medications, or have concerns about physical activity. Listen to your body and stop exercising if you experience pain, dizziness, or discomfort.
                  </p>
                  <p>
                    <strong>Individual results vary significantly.</strong> Our AI trainers provide general guidance that may not be suitable for everyone. You are responsible for your own safety and health decisions.
                  </p>
                  <div className="flex items-center space-x-2 mt-6 p-4 glass-card-subtle rounded-lg">
                    <Checkbox
                      id="health-disclaimer"
                      checked={data.healthDisclaimer || false}
                      onCheckedChange={(checked) => 
                        updateData({ healthDisclaimer: !!checked })
                      }
                      className="glass-focus-ring"
                    />
                    <label 
                      htmlFor="health-disclaimer" 
                      className="text-sm font-medium glass-text-primary cursor-pointer leading-relaxed"
                    >
                      I understand this is not medical advice and I will consult my healthcare provider before starting any exercise program.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card variant="glass" className="p-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <CardTitle variant="glass" className="text-xl font-bold mb-3 text-blue-700">
                  Data Privacy & SMS Communication
                </CardTitle>
                <div className="glass-text-secondary leading-relaxed space-y-4">
                  <p>
                    <strong>Your privacy matters.</strong> We collect only the information needed to provide personalized fitness coaching. Your data is encrypted, securely stored, and never sold to third parties.
                  </p>
                  <p>
                    <strong>SMS Communication:</strong> By proceeding, you consent to receive text messages from FlexFlow containing your personalized workouts and reminders. Message and data rates may apply. You can opt out by texting STOP at any time.
                  </p>
                  <p>
                    <strong>Data Usage:</strong> We use your fitness preferences and responses to improve our AI recommendations. You can request data deletion at any time by contacting support.
                  </p>
                  <div className="flex items-center space-x-2 mt-6 p-4 glass-card-subtle rounded-lg">
                    <Checkbox
                      id="privacy-consent"
                      checked={data.dataPrivacyConsent || false}
                      onCheckedChange={(checked) => 
                        updateData({ dataPrivacyConsent: !!checked })
                      }
                      className="glass-focus-ring"
                    />
                    <label 
                      htmlFor="privacy-consent" 
                      className="text-sm font-medium glass-text-primary cursor-pointer leading-relaxed"
                    >
                      I consent to receiving SMS messages and understand FlexFlow&apos;s privacy practices.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Service Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card variant="glass-subtle" className="p-6">
          <CardHeader>
            <CardTitle variant="glass" className="text-lg font-semibold mb-4">
              What to Expect
            </CardTitle>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold glass-text-primary">Daily Workouts</h4>
                <p className="glass-text-secondary text-sm leading-relaxed">
                  Receive personalized workout suggestions every morning via SMS, tailored to your goals, equipment, and schedule.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold glass-text-primary">AI Coaching</h4>
                <p className="glass-text-secondary text-sm leading-relaxed">
                  Your AI trainer adapts based on your feedback, progress, and preferences to keep you motivated and challenged.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold glass-text-primary">Flexible & Simple</h4>
                <p className="glass-text-secondary text-sm leading-relaxed">
                  No app downloads required. Just text messages that fit into your busy lifestyle and help you stay consistent.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold glass-text-primary">Cancel Anytime</h4>
                <p className="glass-text-secondary text-sm leading-relaxed">
                  $25/month with no long-term commitment. Text STOP to pause or cancel your subscription at any time.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Ready to Continue */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass-purple" className="p-6 text-center">
            <p className="glass-text-primary font-medium text-lg">
              🎉 Great! You&apos;re all set to customize your fitness experience.
            </p>
            <p className="glass-text-secondary mt-2">
              Next, we&apos;ll learn about your fitness goals and preferences.
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}