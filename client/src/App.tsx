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
import SignupPage from "@/pages/signup";
import AdminPage from "@/pages/admin";
import ForgotPasswordPage from "@/pages/forgot-password";
import PaymentPage from "@/pages/payment";
import LoginPage from "@/pages/login";


function Router() {
  // Landing page with SmartSuite form → Email → Payment → Signup → Dashboard
  return (
    <Switch>
      <Route path="/payment" component={PaymentPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/complex-dashboard" component={Dashboard} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/admin" component={AdminPage} />
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
