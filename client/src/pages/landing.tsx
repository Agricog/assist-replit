import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import agricogLogo from "@assets/Agricog_1756233506512.png";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // User is already logged in, they should see the dashboard
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-pattern">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={agricogLogo} 
              alt="Agricog Logo" 
              className="h-10 w-auto object-contain"
              data-testid="img-header-logo"
            />
            <h1 className="text-xl font-bold text-foreground">Agricog Assist</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="mx-auto mb-6 w-24 h-20 flex items-center justify-center">
              <img 
                src={agricogLogo} 
                alt="Agricog Logo" 
                className="h-full w-auto object-contain"
                data-testid="img-logo"
              />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Your Smart Farm
              <span className="text-primary"> Assistant</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Harness the power of AI for smarter farming. Get real-time market insights, weather forecasts, and manage your farm data all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Login Card */}
            <div className="bg-card rounded-xl shadow-xl p-8 border border-border">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Get Started Today</h2>
                <p className="text-muted-foreground">
                  Join thousands of farmers using AI to make better decisions
                </p>
                <button
                  onClick={handleLogin}
                  data-testid="button-login"
                  className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Sign In to Continue
                </button>
                <p className="text-sm text-muted-foreground">
                  New users automatically registered
                </p>
              </div>
            </div>

            {/* Features Highlight */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground mb-6">What You Get:</h3>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Market Intelligence AI</h4>
                  <p className="text-sm text-muted-foreground">Real-time commodity prices, market trends, and trading insights</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Farm Assistant AI</h4>
                  <p className="text-sm text-muted-foreground">Expert farming advice, crop guidance, and problem-solving</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">5-Day Weather Forecasts</h4>
                  <p className="text-sm text-muted-foreground">Detailed hourly weather data to plan your farming activities</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Farm Data Management</h4>
                  <p className="text-sm text-muted-foreground">Track fields, crops, and machinery with full CRUD capabilities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center bg-primary/5 rounded-xl p-8 border border-primary/10">
            <h3 className="text-2xl font-semibold text-foreground mb-2">Ready to Transform Your Farming?</h3>
            <p className="text-muted-foreground mb-6">
              Join the agricultural revolution with AI-powered farming assistance
            </p>
            <button
              onClick={handleLogin}
              className="bg-primary text-primary-foreground py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
              data-testid="button-cta-login"
            >
              Get Started Now →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
