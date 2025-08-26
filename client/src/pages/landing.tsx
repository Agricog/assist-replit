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
    <div className="min-h-screen hero-pattern flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-16 flex items-center justify-center">
            <img 
              src={agricogLogo} 
              alt="Agricog Logo" 
              className="h-full w-auto object-contain"
              data-testid="img-logo"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Agricog Assist</h1>
          <p className="text-muted-foreground">Your Agricultural Cognitive Assistant</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Welcome to Agricog Assist</h2>
            <p className="text-muted-foreground text-sm">
              Access your dual AI assistants for market intelligence and farm guidance, plus weather forecasts and farm data management.
            </p>
            <button
              onClick={handleLogin}
              data-testid="button-login"
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-200 font-medium"
            >
              Sign In to Continue
            </button>
            <p className="text-xs text-muted-foreground">
              New users will be automatically registered upon first login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
