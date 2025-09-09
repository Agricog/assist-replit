import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import WeatherWidget from "@/components/weather-widget";
import type { FarmField, User } from "@shared/schema";

// Simple MarketChat without API calls
const SimpleMarketChat = () => {
  return (
    <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
      <div className="bg-accent/10 border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Market Intelligence - No API</h3>
            <p className="text-sm text-muted-foreground">Testing without Perplexity calls</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-muted-foreground py-8">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p>MarketChat without API calls - Testing if Perplexity is the issue</p>
          <p className="text-sm mt-2">This should work if Perplexity API calls were causing the crash</p>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="MarketChat disabled for testing..."
            disabled
            className="flex-1 px-3 py-2 border border-input bg-muted rounded-md opacity-50"
          />
          <button
            disabled
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md opacity-50 cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardStep3NoApi() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };

  // Add farm fields query
  const { data: farmFields = [], refetch: refetchFields } = useQuery<FarmField[]>({
    queryKey: ["/api/farm/fields"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    console.log('🏠 Dashboard Step3NoApi Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Dashboard Step3NoApi: Redirecting to home');
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
          <p className="text-muted-foreground">Loading step3 no-api dashboard...</p>
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
            <h1 className="text-2xl font-bold">Agricog Assist - Step 3: No API Test</h1>
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
          <div className="flex-1 p-4">
            <h2 className="text-2xl font-bold mb-4">Step 3: MarketChat without API calls</h2>
            
            <div className="bg-card p-4 rounded-lg border mb-4">
              <h3 className="text-lg font-semibold mb-2">🧪 Testing Theory</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ WeatherWidget: Working</li>
                <li>🧪 MarketChat UI: Testing without API</li>
                <li>❓ If this works → Perplexity API was the issue</li>
              </ul>
            </div>
            
            <div className="h-[400px]">
              <SimpleMarketChat />
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