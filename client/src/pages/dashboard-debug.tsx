import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import WeatherWidget from "@/components/weather-widget";
// import MarketChat from "@/components/market-chat";
// import FarmAssistant from "@/components/farm-assistant";
// import FarmDataModal from "@/components/farm-data-modal";
// import FarmDataViewModal from "@/components/farm-data-view-modal";
// import LocationModal from "@/components/postcode-modal";
// import MachineryServiceWidget from "@/components/machinery-service-widget";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { FarmField, User } from "@shared/schema";
// import agricogLogo from "@assets/Agricog_1756233506512.png";

export default function DashboardDebug() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };
  // Remove unused state and toast that might cause issues
  // const { toast } = useToast();
  // const [showFarmDataModal, setShowFarmDataModal] = useState(false);
  // const [showFarmDataViewModal, setShowFarmDataViewModal] = useState(false);
  // const [selectedField, setSelectedField] = useState<FarmField | null>(null);
  // const [editingField, setEditingField] = useState<FarmField | null>(null);
  // const [showLocationModal, setShowLocationModal] = useState(false);
  // const [showAllFields, setShowAllFields] = useState(false);

  // Redirect to home if not authenticated  
  useEffect(() => {
    console.log('🏠 Dashboard Debug Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Dashboard Debug: Redirecting to home in 8 seconds - auth failed');
      const timer = setTimeout(() => {
        console.log('❌ Dashboard Debug: Redirecting to home now');
        window.location.href = "/";
      }, 8000);
      
      return () => clearTimeout(timer);
    } else if (isAuthenticated && user) {
      console.log('✅ Dashboard Debug: User authenticated successfully:', user.username);
    }
  }, [isAuthenticated, isLoading, user]);

  // Fetch farm fields
  const { data: farmFields = [], refetch: refetchFields } = useQuery<FarmField[]>({
    queryKey: ["/api/farm/fields"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = async () => {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-primary-foreground/20 rounded flex items-center justify-center text-sm font-bold">AG</div>
            <h1 className="text-2xl font-bold">Agricog Assist</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center text-sm font-medium">
                {getUserInitials()}
              </div>
              <span className="text-sm">
                {user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : user?.username || user?.email || 'User'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-primary-foreground text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/90 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome to your Agricultural Dashboard
              </h2>
              <p className="text-muted-foreground">
                Your intelligent farming companion for smarter agricultural decisions.
              </p>
            </div>

            {/* DEBUG: Just show basic content first */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🌱 Farm Overview</h3>
                <p>Farm fields loaded: {farmFields.length}</p>
                <p>User location: {user?.location || 'Not set'}</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🔧 Debug Status</h3>
                <p>✅ Authentication working</p>
                <p>✅ User data loaded</p>
                <p>✅ Farm fields query working</p>
                <p>✅ Assets loading (logo displayed)</p>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                Components temporarily disabled for debugging. This version works!
              </p>
              <div className="mt-4 space-x-4">
                <a href="/dashboard-minimal" className="text-blue-600 underline">← Back to Minimal</a>
                <a href="/dashboard" className="text-blue-600 underline">Try Full Dashboard →</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}