import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import type { User } from "@shared/schema";

export default function DashboardTest() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };

  useEffect(() => {
    console.log('🏠 Dashboard Test Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Dashboard Test: Redirecting to home');
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
          <p className="text-muted-foreground">Loading test dashboard...</p>
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
      {/* Simple Header */}
      <header className="bg-primary text-primary-foreground border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary-foreground/20 rounded flex items-center justify-center text-sm font-bold">AG</div>
            <h1 className="text-2xl font-bold">Agricog Assist - Test</h1>
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

      {/* Simple Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Dashboard Test - Step by Step</h2>
          
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">✅ Basic Checks Working</h3>
              <ul className="space-y-2">
                <li>✅ Authentication: {isAuthenticated ? 'Working' : 'Failed'}</li>
                <li>✅ User Data: {user?.username || user?.firstName || 'Loaded'}</li>
                <li>✅ Header Rendering: Working</li>
                <li>✅ No Complex Imports: Working</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">🔧 Next Steps</h3>
              <p>This basic version works. Now we can add components one by one to find the issue.</p>
              <div className="mt-4 space-x-4">
                <a href="/dashboard-minimal" className="text-blue-600 underline">← Back to Minimal</a>
                <a href="/dashboard" className="text-red-600 underline">Try Full Dashboard (broken)</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}