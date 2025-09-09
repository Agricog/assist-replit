import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import type { User } from "@shared/schema";

export default function DashboardMinimal() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };

  // Basic auth check
  useEffect(() => {
    console.log('🏠 Minimal Dashboard Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Minimal Dashboard: Redirecting to home');
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
          <p className="text-muted-foreground">Loading minimal dashboard...</p>
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
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agricog Assist - Minimal Test</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.username || user?.firstName || 'User'}</span>
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
              className="bg-primary-foreground text-primary px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Dashboard Test</h2>
          <div className="bg-card p-6 rounded-lg border">
            <p className="text-lg">✅ Authentication working</p>
            <p className="text-lg">✅ User: {user?.username || user?.firstName || 'Unknown'}</p>
            <p className="text-lg">✅ Dashboard rendering</p>
            <div className="mt-4">
              <a href="/dashboard" className="text-blue-600 underline">Go to Full Dashboard</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}