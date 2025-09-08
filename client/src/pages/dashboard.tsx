import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import WeatherWidget from "@/components/weather-widget";
import MarketChat from "@/components/market-chat";
import FarmAssistant from "@/components/farm-assistant";
import FarmDataModal from "@/components/farm-data-modal";
import FarmDataViewModal from "@/components/farm-data-view-modal";
import LocationModal from "@/components/postcode-modal";
import MachineryServiceWidget from "@/components/machinery-service-widget";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { FarmField, User } from "@shared/schema";
// import agricogLogo from "@assets/Agricog_1756233506512.png"; // TEMPORARILY DISABLED

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth() as { user: User | undefined; isAuthenticated: boolean; isLoading: boolean };
  const { toast } = useToast();
  const [showFarmDataModal, setShowFarmDataModal] = useState(false);
  const [showFarmDataViewModal, setShowFarmDataViewModal] = useState(false);
  const [selectedField, setSelectedField] = useState<FarmField | null>(null);
  const [editingField, setEditingField] = useState<FarmField | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  // Redirect to home if not authenticated  
  useEffect(() => {
    console.log('🏠 Dashboard Auth Check:', { isLoading, isAuthenticated, user: user?.username || 'none' });
    
    // Only redirect if we're definitely sure user is not authenticated
    // Give more time for authentication to load
    if (!isLoading && !isAuthenticated && !user) {
      console.log('❌ Dashboard: Redirecting to home in 8 seconds - auth failed');
      const timer = setTimeout(() => {
        console.log('❌ Dashboard: Redirecting to home now');
        window.location.href = "/";
      }, 8000); // Give 8 seconds for auth to complete
      
      return () => clearTimeout(timer);
    } else if (isAuthenticated && user) {
      console.log('✅ Dashboard: User authenticated successfully:', user.username);
    }
  }, [isAuthenticated, isLoading, user]);

  // Fetch farm fields
  const { data: farmFields = [], refetch: refetchFields } = useQuery<FarmField[]>({
    queryKey: ["/api/farm/fields"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
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
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "User";
  };

  // Calculate farm statistics
  const totalAcres = farmFields.reduce((sum: number, field: FarmField) => sum + parseFloat(field.size || "0"), 0);
  const cropTypes = new Set(farmFields.map((field: FarmField) => field.cropType)).size;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border sidebar-shadow flex-shrink-0">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-10 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">A</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Agricog</h2>
                <p className="text-sm text-muted-foreground">Assistant</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-foreground bg-muted rounded-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 7 5 5 5-5" />
                  </svg>
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    // Scroll the weather widget into view
                    const weatherWidget = document.querySelector('[data-testid="weather-widget"]');
                    if (weatherWidget) {
                      weatherWidget.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (!user?.location) {
                      // If no location is set, open the location modal
                      setShowLocationModal(true);
                    }
                  }}
                  data-testid="button-weather"
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span>Weather</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowFarmDataModal(true)}
                  data-testid="button-farm-data"
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Farm Data</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground font-medium text-sm" data-testid="text-user-initials">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                  {getUserName()}
                </p>
                <button 
                  onClick={() => setShowLocationModal(true)}
                  data-testid="button-update-postcode"
                  className="text-xs text-muted-foreground hover:text-foreground text-left"
                >
                  {user?.location || "Add location"}
                </button>
              </div>
              <button 
                onClick={handleLogout}
                data-testid="button-logout"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome {user?.firstName} to your {user?.farmName} Dashboard
              </h1>
              <p className="text-muted-foreground">
                Here's your agricultural overview for today.
              </p>
            </div>
            
            {/* Quick Weather Summary */}
            <button 
              onClick={() => setShowLocationModal(true)}
              className="flex items-center space-x-4 bg-muted/30 px-4 py-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
              title="Click to change weather location"
              data-testid="button-edit-weather-location"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-foreground font-medium" data-testid="text-current-weather">
                  {user?.location ? user.location : "Add location"}
                </span>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Dual Chat Interface */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
            {/* Market Intelligence Chat */}
            <div className="flex-1 bg-card border border-border rounded-lg p-4">
              <p className="text-center text-muted-foreground">Market Chat - Temporarily Disabled</p>
            </div>

            {/* Farm Assistant Chat */}
            <div className="flex-1 bg-card border border-border rounded-lg p-4">
              <p className="text-center text-muted-foreground">Farm Assistant - Temporarily Disabled</p>
            </div>
          </div>

          {/* Right Column: Weather & Farm Data */}
          <aside className="w-80 bg-muted/20 border-l border-border overflow-y-auto">
            {/* Weather Widget */}
            <div className="p-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-center text-muted-foreground">Weather Widget - Temporarily Disabled</p>
              </div>
            </div>
            
            {/* Machinery Service Widget */}
            <div className="p-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-center text-muted-foreground">Machinery Service - Temporarily Disabled</p>
              </div>
            </div>

            {/* Farm Data Summary */}
            <div className="p-4">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center space-x-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Farm Overview</span>
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Farm Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary" data-testid="text-total-acres">
                        {totalAcres.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Acres</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-accent" data-testid="text-crop-types">
                        {cropTypes}
                      </p>
                      <p className="text-xs text-muted-foreground">Crop Types</p>
                    </div>
                  </div>

                  {/* Current Crops */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground">Current Fields</h4>
                      {farmFields.length > 3 && (
                        <button
                          onClick={() => setShowAllFields(!showAllFields)}
                          className="text-xs text-primary hover:text-primary/80 underline"
                          data-testid="button-toggle-all-fields"
                        >
                          {showAllFields ? 'Show Less' : `View All (${farmFields.length})`}
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {farmFields.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No fields added yet. Click "Add Field Data" to add your first field.
                        </p>
                      ) : (
                        (showAllFields ? farmFields : farmFields.slice(0, 3)).map((field: FarmField) => (
                          <div key={field.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <button
                                onClick={() => {
                                  setSelectedField(field);
                                  setShowFarmDataViewModal(true);
                                }}
                                className="text-sm text-foreground hover:text-primary underline cursor-pointer"
                                data-testid={`button-view-field-${field.id}`}
                              >
                                {field.fieldName}
                              </button>
                            </div>
                            <span className="text-sm text-muted-foreground">{field.size} acres</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShowFarmDataModal(true)}
                      data-testid="button-add-field-data"
                      className="w-full bg-primary text-primary-foreground py-2 px-3 rounded-md text-sm hover:bg-primary/90 transition-colors"
                    >
                      Add Field Data
                    </button>
                    <button 
                      onClick={() => refetchFields()}
                      data-testid="button-refresh-data"
                      className="w-full bg-muted text-muted-foreground py-2 px-3 rounded-md text-sm hover:bg-muted/80 transition-colors"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Farm Data Modal */}
      <FarmDataModal 
        isOpen={showFarmDataModal}
        onClose={() => {
          setShowFarmDataModal(false);
          setEditingField(null);
        }}
        onSave={() => {
          setShowFarmDataModal(false);
          setEditingField(null);
          refetchFields();
        }}
        editingField={editingField}
      />

      {/* Farm Data View Modal */}
      <FarmDataViewModal 
        isOpen={showFarmDataViewModal}
        onClose={() => {
          setShowFarmDataViewModal(false);
          setSelectedField(null);
        }}
        field={selectedField}
        onEdit={(field) => {
          setEditingField(field);
          setShowFarmDataModal(true);
        }}
      />

      {/* Location Modal */}
      <LocationModal 
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={user?.location || undefined}
      />
    </div>
  );
}
