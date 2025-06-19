import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Check, Zap, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Premium Subscription</h1>
          </div>
        </div>

        {/* Usage Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              AI Conversation Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  0 of 10 conversations used
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  0%
                </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                Get 10 free AI conversations when you sign up!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Free Plan
                <span className="text-lg font-bold">$0</span>
              </CardTitle>
              <CardDescription>Perfect for trying out the app</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>10 AI conversations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited DOT practice</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>218 authentic officer questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Hands-free auto-play</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Basic voice features</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-yellow-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Premium Plan
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">$9.99</span>
                  <span className="text-slate-600 dark:text-slate-400">/month</span>
                </div>
              </CardTitle>
              <CardDescription>Unlimited access for professional drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Unlimited AI conversations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Everything in Free plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Premium ElevenLabs voices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Advanced practice analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Conversation memory & tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full">
                Upgrade to Premium - $9.99/month
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-center mb-8">What's Included</h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
            <div className="grid gap-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-medium">DOT Practice (218 Questions)</span>
                <div className="flex gap-8">
                  <Check className="w-5 h-5 text-green-500" />
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-medium">Hands-free Voice Control</span>
                <div className="flex gap-8">
                  <Check className="w-5 h-5 text-green-500" />
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-medium">AI Conversations</span>
                <div className="flex gap-8">
                  <span className="text-sm text-slate-600">10 free</span>
                  <span className="text-sm font-medium text-green-600">Unlimited</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-medium">Premium Voices</span>
                <div className="flex gap-8">
                  <span className="text-sm text-slate-400">-</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="font-medium">Advanced Analytics</span>
                <div className="flex gap-8">
                  <span className="text-sm text-slate-400">-</span>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}