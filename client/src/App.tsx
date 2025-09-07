import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// Removed useAuth - using SmartSuite form instead of Replit auth
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

// Simple inline signup component for testing
function SignupPage() {
  // Redirect to the static signup HTML file
  React.useEffect(() => {
    window.location.href = '/signup.html';
  }, []);
  
  return (
    <div style={{ padding: '20px' }}>
      <p>Redirecting to signup...</p>
    </div>
  );
}

function Router() {
  // Bypass authentication - always show Landing page with SmartSuite form
  return (
    <Switch>
      <Route path="/signup" component={SignupPage} />
      <Route path="/" component={Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
