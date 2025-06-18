import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import DotPractice from "@/pages/dot-practice";
import ConversationalCoach from "@/pages/conversational-coach";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import BottomNavigation from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="max-w-md mx-auto bg-card min-h-screen shadow-lg relative border-l border-r border-border">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dot-practice" component={DotPractice} />
        <Route path="/coach" component={ConversationalCoach} />
        <Route path="/settings" component={Settings} />
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
