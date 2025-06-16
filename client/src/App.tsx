import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import DotPractice from "@/pages/dot-practice";
import ConversationalCoach from "@/pages/conversational-coach";
import Settings from "@/pages/settings";
import BottomNavigation from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-lg relative">
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
    // Enable dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-surface dark:bg-gray-950 min-h-screen">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
