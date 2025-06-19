import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Crown, Zap, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Load Stripe - will be activated when keys are provided
let stripePromise: any = null;
try {
  if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
} catch (error) {
  console.log('Stripe not configured');
}

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to Premium! You now have unlimited access.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={!stripe || !elements}>
        Subscribe to Premium
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    // Check current subscription status
    apiRequest("GET", "/api/subscription-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasActiveSubscription) {
          setSubscriptionActive(true);
          setLoading(false);
        } else {
          // Create subscription
          return apiRequest("POST", "/api/create-subscription");
        }
      })
      .then((res) => {
        if (res) {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Subscription error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border">
        <div className="p-6 flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (subscriptionActive) {
    return (
      <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border">
        <div className="p-6">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Crown className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-400">Premium Active</CardTitle>
              <CardDescription className="text-green-600 dark:text-green-300">
                You have unlimited access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <Check className="h-5 w-5 mr-3" />
                  <span>Unlimited AI coaching sessions</span>
                </div>
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <Check className="h-5 w-5 mr-3" />
                  <span>Premium ElevenLabs voices</span>
                </div>
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <Check className="h-5 w-5 mr-3" />
                  <span>Advanced practice analytics</span>
                </div>
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <Check className="h-5 w-5 mr-3" />
                  <span>Priority customer support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border">
        <div className="p-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle>Upgrade to Premium</CardTitle>
              <CardDescription>
                Get unlimited access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-3 text-green-500" />
                  <span>Unlimited AI coaching sessions</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-3 text-green-500" />
                  <span>Premium ElevenLabs voices</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-3 text-green-500" />
                  <span>Advanced practice analytics</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-3 text-green-500" />
                  <span>Priority customer support</span>
                </div>
              </div>
              <div className="text-center text-gray-600 dark:text-gray-400">
                Payment system is being configured. Please check back soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border">
      <div className="p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Crown className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle>Upgrade to Premium</CardTitle>
            <CardDescription>
              $9.99/month - Cancel anytime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-500" />
                <span>Unlimited AI coaching sessions</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-500" />
                <span>Premium ElevenLabs voices</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-500" />
                <span>Advanced practice analytics</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-green-500" />
                <span>Priority customer support</span>
              </div>
            </div>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}