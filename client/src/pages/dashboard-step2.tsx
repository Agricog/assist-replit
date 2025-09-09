import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import WeatherWidget from "@/components/weather-widget";
import type { FarmField, User } from "@shared/schema";

export default function DashboardStep2() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };

  // Add farm fields query
  const { data: farmFields = [], refetch: refetchFields } = useQuery<FarmField[]>({
    queryKey: ["/api/farm/fields"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    console.log('🏠 Dashboard Step2 Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Dashboard Step2: Redirecting to home');
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
          <p className="text-muted-foreground">Loading step2 dashboard...</p>
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
            <h1 className="text-2xl font-bold">Agricog Assist - Step 2: Weather Widget</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user?.firstName || user?.username || 'User'}
            </span>
            <button 
              onClick={() => window.location.href = "/api/logout"}
              className="bg-primary-foreground text-primary px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Step 2: Added WeatherWidget</h2>
            
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">✅ Step 2 Checks</h3>
                <ul className="space-y-2">
                  <li>✅ Authentication: {isAuthenticated ? 'Working' : 'Failed'}</li>
                  <li>✅ User Data: {user?.username || user?.firstName || 'Loaded'}</li>
                  <li>✅ Farm Fields Query: {farmFields ? `${farmFields.length} fields` : 'Failed'}</li>
                  <li>✅ WeatherWidget Import: {user?.location ? 'Will show weather' : 'No location set'}</li>
                </ul>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4">🔧 Test Status</h3>
                <p>Added WeatherWidget component. If this crashes, WeatherWidget is the issue.</p>
                <div className="mt-4 space-x-4">
                  <a href="/dashboard-step1" className="text-blue-600 underline">← Back to Step 1</a>
                  <a href="/dashboard" className="text-red-600 underline">Try Full Dashboard (broken)</a>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Weather Widget Sidebar */}
        <aside className="w-80 bg-muted/20 border-l border-border">
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