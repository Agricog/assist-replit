import { useAuth } from "@/hooks/useAuth";

export default function DashboardSimple() {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log("🧪 Simple Dashboard Test:", { user, isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h1>
          <p>User: {user ? 'exists' : 'null'}</p>
          <p>Loading: {isLoading ? 'true' : 'false'}</p>
          <button 
            onClick={() => window.location.href = "/login"} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-6">
          ✅ Dashboard Working!
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <div className="space-y-2">
            <p><strong>Username:</strong> {user?.username || 'Not available'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>First Name:</strong> {user?.firstName || 'Not available'}</p>
            <p><strong>Auth Type:</strong> {user?.authType || 'Not available'}</p>
            <p><strong>Location:</strong> {user?.location || 'Not set'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = "/dashboard"} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Full Dashboard
            </button>
            <button 
              onClick={() => window.location.href = "/api/logout"} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}