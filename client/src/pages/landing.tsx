import { Button } from "@/components/ui/button";
import { Truck, MessageCircle, GraduationCap, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <Truck className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            English Coach for Professional Drivers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Master English communication skills for DOT inspections and professional driving scenarios with AI-powered practice sessions.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started - Log In
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-center mb-4">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              DOT Practice Tests
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Practice real DOT inspection scenarios with voice interaction and immediate feedback.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              AI Conversation Coach
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Practice English conversations with AI that remembers your progress and adapts to your needs.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-center mb-4">
              <GraduationCap className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Professional Voices
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Learn with authentic male officer and driver voices for realistic practice scenarios.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Why Choose Our English Coach?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Hands-Free Learning
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Practice while driving with voice-activated lessons designed for mobile use.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Real DOT Scenarios
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Learn with authentic officer-driver conversations from actual traffic stops.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Multilingual Support
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Get explanations in your native language while learning English for DOT scenarios.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Progress Tracking
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your improvement with detailed practice session analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}