import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Check, Zap, MessageCircle, ArrowLeft, Star } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              English Coach Premium
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Professional English training for truck drivers
          </p>
        </div>

        {/* Current Usage Demo */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <MessageCircle className="w-5 h-5" />
              Your AI Conversation Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  0 of 10 free conversations used
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  0% used
                </span>
              </div>
              <Progress value={0} className="h-3 bg-blue-100 dark:bg-blue-800" />
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-green-600" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  You have 10 free AI conversations available!
                </p>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                DOT practice with 218 authentic questions is always free
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          
          {/* Free Plan */}
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                Free Plan
                <span className="text-3xl font-bold text-slate-700 dark:text-slate-300">$0</span>
              </CardTitle>
              <CardDescription className="text-base">
                Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">10 AI conversations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Unlimited DOT practice</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>218 authentic officer questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Hands-free auto-play</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Basic voice features</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" size="lg">
                Start Free Account
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-yellow-400 relative bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </span>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                Premium Plan
              </CardTitle>
              <div className="text-center">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">$9.99</span>
                <span className="text-slate-600 dark:text-slate-400 text-lg">/month</span>
              </div>
              <CardDescription className="text-base font-medium text-slate-700 dark:text-slate-300">
                Unlimited access for professional drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Unlimited AI conversations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Everything in Free plan</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Premium ElevenLabs voices</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Advanced practice analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Conversation memory & tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Priority email support</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold" size="lg">
                Upgrade to Premium - $9.99/month
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Value Props */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-bold mb-2">AI Coaching</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Practice real conversations with AI that remembers your progress
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="font-bold mb-2">Premium Voices</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Professional-quality voices for realistic practice sessions
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-bold mb-2">Unlimited Access</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No limits on AI conversations - practice as much as you need
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Money Back Guarantee */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                30-Day Money Back Guarantee
              </h3>
            </div>
            <p className="text-green-700 dark:text-green-300">
              Try Premium risk-free. If you're not satisfied, get a full refund within 30 days.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}