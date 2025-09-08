"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Smartphone, Users, Zap, Clock, Target, CheckCircle2, Star, Sparkles } from "lucide-react";

// AI Trainer personalities data - 3x3 Grid Layout
const trainers = [
  // ROW 1: MAX → ZARA → BLAZE
  {
    name: "MAX",
    avatar: "💪",
    personality: "Classic Motivator",
    description: "Classic motivator who believes in pushing limits and achieving breakthrough results",
    style: "💪 Rise and CRUSH it, champion! Time to level up with beast mode strength training like a warrior!",
    color: "bg-indigo-500",
    isGradient: false,
    image: "/coaches/MAX.webp",
    isPlaceholder: false
  },
  {
    name: "ZARA",
    avatar: "⚡",
    personality: "Energy Booster", 
    description: "High-energy coach who makes fitness fun and keeps your motivation soaring",
    style: "⚡ Hey superstar! You're amazing! Let's go crush it with high-energy workouts - your energy is contagious!",
    color: "bg-emerald-500",
    isGradient: false,
    image: "/coaches/ZARA.webp",
    isPlaceholder: false
  },
  {
    name: "BLAZE",
    avatar: "💯",
    personality: "The Athletic Performer",
    description: "Performance-focused fitness coach for athletic training and competitive workouts",
    style: "💯 Champion mindset activated! Today we achieve athletic excellence and compete at peak performance levels!",
    color: "bg-red-500",
    image: "/coaches/BLAZE.webp",
    isPlaceholder: false
  },
  // ROW 2: SAGE → KAI → NOVA
  {
    name: "SAGE", 
    avatar: "🧘",
    personality: "Mindful Guide",
    description: "Mindful fitness assistant focused on balanced movement and sustainable wellness",
    style: "🧘 Good morning! Let's flow into balance today. Honor your body with mindful movement, breathe deeply, and embrace awareness.",
    color: "bg-fuchsia-400", 
    isGradient: false,
    image: "/coaches/SAGE.webp",
    isPlaceholder: false
  },
  {
    name: "KAI",
    avatar: "📊",
    personality: "Data-Driven Optimizer",
    description: "Analytical fitness coach using data tracking methods to enhance your workouts",
    style: "📊 Data shows optimal efficiency today! Let's optimize your metrics with precise analysis and targeted performance improvements.",
    color: "bg-sky-400",
    isGradient: false,
    image: "/coaches/KAI.webp",
    isPlaceholder: false
  },
  {
    name: "NOVA",
    avatar: "🚀",
    personality: "Transformation Catalyst",
    description: "Breakthrough specialist who helps you transform and reach the next level",
    style: "🚀 Ready for breakthrough transformation? Time to catalyst your evolution and unlock your next level potential!",
    color: "bg-cyan-500",
    isGradient: false,
    image: "/coaches/NOVA.webp",
    isPlaceholder: false
  },
  // ROW 3: ACE → RILEY → MARCO
  {
    name: "ACE",
    avatar: "🤗",
    personality: "Gentle Supporter",
    description: "Patient, understanding coach who believes in gradual progress and celebrating every step",
    style: "🤗 Good morning, friend! You've got this - let's make gentle progress with kind movement that honors your journey.",
    color: "bg-pink-500",
    isGradient: false,
    image: "/coaches/ACE.webp",
    isPlaceholder: false
  },
  {
    name: "RILEY",
    avatar: "🌟",
    personality: "Balanced Lifestyle Coach",
    description: "Practical coach who understands real life and helps integrate fitness sustainably",
    style: "🌟 Let's find realistic balance today! Sustainable progress that's manageable and fits your life perfectly.",
    color: "bg-teal-500",
    image: "/coaches/RILEY.webp",
    isPlaceholder: false
  },
  {
    name: "MARCO",
    avatar: "👨‍🍳",
    personality: "The Chef",
    description: "Passionate chef making healthy eating delicious with Mediterranean-inspired meal prep and simple ingredients",
    style: "👨‍🍳 Let's create something delicious! Fresh ingredients, amazing flavors - healthy eating that actually tastes incredible!",
    color: "bg-green-500",
    image: "/coaches/MARCO.webp",
    isPlaceholder: false
  }
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    setIsSubmitted(true);
    // Reset after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="secondary" className="mb-4 text-sm font-medium text-gray-900 bg-gray-100">
            No App Required • Just Text Messages
          </Badge>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
            Your AI Personal Trainer
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Texts You Workouts
            </span>
            <br />
            Every Morning
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get customized workout suggestions delivered via SMS from AI fitness assistants with unique personalities. 
            No downloads, no apps, no hassle—fitness designed to fit your busy lifestyle and help you stay consistent.
          </p>

          {/* Email Signup Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                disabled={isSubmitted}
              />
              <Button 
                type="submit" 
                className="whitespace-nowrap"
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Added!</>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              By subscribing, you consent to receive SMS messages and emails from FlexFlow. 
              Message and data rates may apply. Text STOP to opt out at any time.
            </p>
          </form>

          {/* Demo Button */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">or</p>
            <Link href="/generate">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/50 hover:bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:text-purple-900 font-semibold px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try AI Workout Generator
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            <strong>$25/month billed monthly</strong> • Cancel anytime • No long-term commitment required
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Coming Soon</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Join the waitlist</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>SMS-First</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Important Health Notice */}
      <section className="py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-yellow-900 mb-2">Important Health Notice:</p>
            <p className="text-yellow-800">
              FlexFlow provides general fitness coaching and educational content only. We are not a medical device, healthcare service, or licensed nutrition practice. All workout suggestions are for informational purposes and should not replace professional medical advice. Consult your physician before starting any exercise program, especially if you have health conditions, injuries, or take medications. Individual results vary significantly.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Why SMS? */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why SMS Instead of Another App?
            </h2>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed">
              Because you don't need another app cluttering your phone. Simple text messages work better.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Smartphone className="w-8 h-8 text-blue-600" />,
                title: "No App Fatigue",
                description: "Works with your existing messages app. No downloads, no updates, no notifications to manage."
              },
              {
                icon: <Zap className="w-8 h-8 text-green-600" />,
                title: "Instant Access",
                description: "Your workout arrives as a text. No loading screens, no login required. Just open and go."
              },
              {
                icon: <Clock className="w-8 h-8 text-purple-600" />,
                title: "Perfect Timing",
                description: "Delivered every morning at your preferred time. Fits seamlessly into your routine."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full border-0 shadow-lg">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-gray-800">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Trainers Showcase - Enhanced with Images */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Meet Your AI Trainers
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Choose the personality that motivates you most. Each trainer has a unique coaching style 
              and adapts to your fitness level and preferences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {trainers.map((trainer, index) => (
              <motion.div
                key={trainer.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="h-full transition-all duration-300 overflow-hidden border-0 shadow-lg hover:shadow-xl bg-white">
                  <CardHeader className="pb-4 lg:pb-6">
                    {/* Enhanced Header with Larger Image */}
                    <div className="flex items-start gap-5 mb-6">
                      {/* Larger Circular Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-white shadow-lg ring-2 ring-white/50">
                          <Image
                            src={trainer.image}
                            alt={`${trainer.name} - ${trainer.personality}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            priority={index < 4}
                          />
                        </div>
                      </div>
                      
                      {/* Name and Badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-bold border-0 px-3 py-1.5 shadow-sm text-white ${trainer.color}`}
                          >
                            {trainer.name}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg sm:text-xl font-bold leading-tight mb-1 text-gray-900">
                          {trainer.personality}
                        </CardTitle>
                      </div>
                    </div>
                    
                    {/* Description with Better Typography */}
                    <CardDescription className="text-sm leading-relaxed mb-4 text-gray-600">
                      {trainer.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Sample Message with Enhanced Styling */}
                    <div className="rounded-xl p-5 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-l-gray-300">
                      <p className="text-sm leading-relaxed font-medium italic text-gray-700">
                        "{trainer.style}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              How FlexFlow Works
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Simple, personalized, thoughtfully crafted—designed for your busy life
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {[
                {
                  step: "1",
                  title: "Quick Setup",
                  description: "Tell us about your fitness goals, schedule, and preferences. Choose your AI trainer personality."
                },
                {
                  step: "2", 
                  title: "Morning Messages",
                  description: "Wake up to customized workout suggestions from your AI fitness assistant, adapted to your preferences and responses."
                },
                {
                  step: "3",
                  title: "Adaptive Coaching",
                  description: "Your trainer learns from your responses and adapts future workouts to keep you motivated and progressing."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 max-w-prose leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Benefits */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Built for Busy Professionals
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              {[
                { icon: <Target className="w-6 h-6" />, text: "Personalized to your goals" },
                { icon: <Clock className="w-6 h-6" />, text: "Fits any schedule" },
                { icon: <MessageCircle className="w-6 h-6" />, text: "Conversational coaching" },
                { icon: <Zap className="w-6 h-6" />, text: "Progressive adaptation" }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-white rounded-full shadow-md text-blue-600">
                    {benefit.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{benefit.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                "I've tried every fitness app out there. FlexFlow is different—it feels like having a real trainer who gets my crazy schedule. No app to open, just wake up to my workout."
              </p>
              <p className="text-sm text-gray-700">
                — Sarah M., Early Beta User
              </p>
              <p className="text-xs text-gray-600 border-t border-gray-100 pt-3 mt-3">
                Individual results may vary. Testimonials represent individual experiences and are not typical results.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about FlexFlow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800">
                  How does FlexFlow work exactly?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  After a quick setup where you share your fitness goals and preferences, FlexFlow's AI trainer sends you a personalized workout via SMS every morning. The workouts adapt based on your feedback and progress, creating a truly personalized fitness experience without any app required.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800">
                  Can I choose which trainer personality I work with?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  Absolutely! You can select from nine coaching personalities including meal planning assistance - MAX (Classic Motivator), SAGE (Mindful Guide), KAI (Data-Driven Optimizer), ZARA (Energy Booster), ACE (Gentle Supporter), NOVA (Transformation Catalyst), BLAZE (Athletic Performance Expert), RILEY (Balanced Lifestyle Coach), and MARCO (Healthy Meal Master) - based on what motivates you most. You can also switch trainers anytime to keep your fitness journey fresh and engaging.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800">
                  What if I miss a workout or need to modify it?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  Simply reply to the text message! Your AI trainer can suggest modifications, reschedule workouts, or adjust future sessions based on your circumstances. The system learns from your responses to better accommodate your schedule and preferences.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800">
                  Do I need any equipment for the workouts?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  FlexFlow designs workouts based on what you have available. During setup, you'll indicate your equipment and space preferences. Whether you have a full gym, basic equipment, or just bodyweight options, your trainer provides workouts thoughtfully designed for your available equipment and space.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800">
                  How much does FlexFlow cost?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  FlexFlow costs $25/month billed monthly • Cancel anytime • No long-term commitment required. We believe fitness coaching should be accessible and affordable, which is why we've created a solution that's a fraction of the cost of traditional personal training.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800">
                  Is FlexFlow suitable for beginners?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  Absolutely! FlexFlow is designed for all fitness levels. During setup, you'll indicate your experience level, and your AI trainer will create appropriate workouts that gradually progress as you get stronger. Whether you're just starting out or getting back into fitness, FlexFlow adapts to meet you where you are. Our ACE (Gentle Supporter) trainer is particularly perfect for beginners, offering patient, understanding guidance that celebrates every step of your journey.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join the waitlist and be among the first to experience personalized AI fitness coaching through simple text messages.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-blue-100"
                  disabled={isSubmitted}
                />
                <Button 
                  type="submit"
                  variant="secondary"
                  className="whitespace-nowrap bg-white text-blue-600 hover:bg-blue-50"
                  disabled={isSubmitted}
                >
                  {isSubmitted ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Added!</>
                  ) : (
                    "Get Early Access"
                  )}
                </Button>
              </div>
              <p className="text-xs text-blue-100 mt-2">
                By subscribing, you consent to receive SMS messages and emails from FlexFlow. 
                Message and data rates may apply. Text STOP to opt out at any time.
              </p>
            </form>

            <p className="text-sm text-blue-100">
              <strong>$25/month billed monthly</strong> when we launch • Cancel anytime • No long-term commitment required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">FlexFlow</h3>
            <p className="text-sm mb-4">
              Your AI personal trainer texts you workouts every morning
            </p>
            <Separator className="my-4 bg-gray-700" />
            <p className="text-xs text-gray-500">
              © 2025 FlexFlow. Individual results may vary significantly. Consult your physician before beginning any exercise program.
              <br />
              FlexFlow provides general fitness education and motivational support only. This service is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease or medical condition. FlexFlow trainers are not licensed healthcare professionals, registered dietitians, or medical practitioners. Always consult qualified healthcare providers before beginning exercise programs or making dietary changes.
              <br />
              Testimonials represent individual experiences and are not typical results. No specific results are guaranteed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
