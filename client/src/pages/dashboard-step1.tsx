import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FarmField, User } from "@shared/schema";

export default function DashboardStep1() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };

  // Add farm fields query (this might be the issue)
  const { data: farmFields = [], refetch: refetchFields } = useQuery<FarmField[]>({
    queryKey: ["/api/farm/fields"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    console.log('🏠 Dashboard Step1 Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Dashboard Step1: Redirecting to home');
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
          <p className="text-muted-foreground">Loading step1 dashboard...</p>
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
            <h1 className="text-2xl font-bold">Agricog Assist - Step 1: Farm Query</h1>
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

      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Step 1: Added Farm Fields Query</h2>
          
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">✅ Step 1 Checks</h3>
              <ul className="space-y-2">
                <li>✅ Authentication: {isAuthenticated ? 'Working' : 'Failed'}</li>
                <li>✅ User Data: {user?.username || user?.firstName || 'Loaded'}</li>
                <li>✅ Farm Fields Query: {farmFields ? `${farmFields.length} fields` : 'Failed'}</li>
                <li>✅ useQuery Hook: Working</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">🔧 Test Status</h3>
              <p>Added farm fields query. If this works, the useQuery is not the issue.</p>
              <div className="mt-4 space-x-4">
                <a href="/dashboard-test" className="text-blue-600 underline">← Back to Test</a>
                <a href="/dashboard" className="text-red-600 underline">Try Full Dashboard (broken)</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}