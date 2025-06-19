import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import DotPracticeFixed from "@/pages/dot-practice-fixed";
import ConversationalCoach from "@/pages/conversational-coach";
import Settings from "@/pages/settings";
import Subscribe from "@/pages/subscribe-fixed";
import Pricing from "@/pages/pricing";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import BottomNavigation from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState<'login' | 'signup' | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleAuthSuccess = (user: any) => {
      // Force a page refresh to reload with authenticated user
      window.location.reload();
    };

    // Show login form
    if (showAuthForm === 'login') {
      return (
        <Login
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={() => setShowAuthForm('signup')}
        />
      );
    }

    // Show signup form
    if (showAuthForm === 'signup') {
      return (
        <Signup
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setShowAuthForm('login')}
        />
      );
    }

    // Show landing page by default with pricing route available
    return (
      <Switch>
        <Route path="/pricing" component={Pricing} />
        <Route component={() => <Landing onGetStarted={() => setShowAuthForm('login')} onSignUp={() => setShowAuthForm('signup')} />} />
      </Switch>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dot-practice" component={DotPracticeFixed} />
        <Route path="/coach" component={ConversationalCoach} />
        <Route path="/settings" component={Settings} />
        <Route path="/subscribe" component={Subscribe} />
        <Route path="/pricing" component={Pricing} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Start with light mode for professional appearance
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-background min-h-screen">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
