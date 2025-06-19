import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Crown, Zap, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SubscribeFixed() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSubscribed(false);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setSubscribed(false);
      setLoading(false);
      return;
    }

    fetch("/api/auth-check/check-subscription", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubscribed(data.subscribed);
        setSubscriptionData(data);
        setLoading(false);
      })
      .catch(() => {
        setSubscribed(false);
        setLoading(false);
      });
  }, [isAuthenticated]);

  const handleUpgrade = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upgrade",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Subscription Created",
          description: "Your premium subscription is now active!",
        });
        setSubscribed(true);
        setSubscriptionData({ ...subscriptionData, subscribed: true });
      } else {
        toast({
          title: "Subscription Failed",
          description: data.message || "Failed to create subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold mb-2">Please Log In</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You need to be logged in to manage your subscription.
            </p>
            <Link to="/">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading subscription status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subscribed) {
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

          <Card className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-8">
              <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h1 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                ✅ You are subscribed to Premium!
              </h1>
              <p className="text-green-700 dark:text-green-300 text-lg">
                Enjoy unlimited AI conversations and premium features.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Usage Status */}
        {subscriptionData && (
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
                    {subscriptionData.conversationsUsed || 0} of {subscriptionData.conversationLimit || 10} conversations used
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {Math.round(((subscriptionData.conversationsUsed || 0) / (subscriptionData.conversationLimit || 10)) * 100)}%
                  </span>
                </div>
                <Progress value={((subscriptionData.conversationsUsed || 0) / (subscriptionData.conversationLimit || 10)) * 100} className="h-2" />
              </div>
              {subscriptionData.needsUpgrade && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    You've reached your free conversation limit. Upgrade to continue!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-yellow-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Recommended
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
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={handleUpgrade}
              >
                Subscribe for $9.99/month
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}