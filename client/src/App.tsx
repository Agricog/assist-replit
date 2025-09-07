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

// Complete signup component
function SignupPage() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          password: data.password
        })
      });
      
      if (response.ok) {
        setSuccess(true);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Account creation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Account Created!</h2>
          <p style={{ color: '#15803d', marginBottom: '16px' }}>Welcome to Agricog Assist. You can now sign in to your dashboard.</p>
          <a href="/login" style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Sign In Now</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#166534', marginBottom: '16px' }}>Create Your Account</h1>
        <p style={{ fontSize: '18px', color: '#15803d', maxWidth: '32rem', margin: '0 auto' }}>
          Welcome to Agricog Assist! Create your secure account to access your personalized agricultural intelligence dashboard.
        </p>
      </div>

      <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌾</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#166534' }}>Join Agricog Assist</h2>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '4px solid #10b981', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#15803d', marginTop: '8px' }}>Creating your account...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>First Name</label>
              <input type="text" name="firstName" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Last Name</label>
              <input type="text" name="lastName" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <input type="email" name="email" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Username</label>
              <input type="text" name="username" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password</label>
              <input type="password" name="password" required minLength={6} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
              <input type="password" name="confirmPassword" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            
            <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
              Create Account
            </button>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#15803d' }}>
            Already have an account? 
            <a href="/login" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none', marginLeft: '4px' }}>Sign in here</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
