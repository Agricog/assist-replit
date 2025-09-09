import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import WeatherWidget from "@/components/weather-widget";
import MarketChatDisabled from "@/components/market-chat-disabled";
import FarmAssistant from "@/components/farm-assistant";
import type { FarmField, User } from "@shared/schema";

export default function DashboardStep4() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };

  // Add farm fields query
  const { data: farmFields = [], refetch: refetchFields } = useQuery<FarmField[]>({
    queryKey: ["/api/farm/fields"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    console.log('🏠 Dashboard Step4 Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Dashboard Step4: Redirecting to home');
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading step4 dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary-foreground/20 rounded flex items-center justify-center text-sm font-bold">AG</div>
            <h1 className="text-2xl font-bold">Agricog Assist - Step 4: FarmAssistant Test</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user?.firstName || user?.username || 'User'}
            </span>
            <button 
              onClick={async () => {
                try {
                  await fetch('/api/logout-traditional', {
                    method: 'POST',
                    credentials: 'include',
                  });
                  window.location.href = "/";
                } catch (error) {
                  console.error('Logout error:', error);
                  window.location.href = "/";
                }
              }}
              className="bg-primary-foreground text-primary px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <main className="flex-1 flex">
          <div className="flex-1 flex gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4">Step 4: Testing FarmAssistant</h2>
              
              <div className="bg-card p-4 rounded-lg border mb-4">
                <h3 className="text-lg font-semibold mb-2">🧪 FarmAssistant Test</h3>
                <ul className="space-y-1 text-sm">
                  <li>✅ WeatherWidget: Working</li>
                  <li>✅ MarketChat UI: Working (disabled)</li>
                  <li>🧪 FarmAssistant: Testing now...</li>
                  <li>❓ If this crashes → FarmAssistant is the problem</li>
                </ul>
              </div>
              
              <div className="h-[350px]">
                <MarketChatDisabled />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">FarmAssistant Component</h3>
              <div className="h-[400px]">
                <FarmAssistant />
              </div>
            </div>
          </div>
        </main>
        
        <aside className="w-80 bg-muted/20 border-l border-border overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Weather Test</h3>
            {user?.location ? (
              <WeatherWidget location={user.location} />
            ) : (
              <div className="bg-card p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  No location set. WeatherWidget not rendered.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}