import { useAuth } from "@/hooks/useAuth";

export default function DashboardMinimal() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="p-8">
      <h1>Ultra Minimal Dashboard Test</h1>
      <p>User: {user?.email || 'No email'}</p>
      <p>This is the most basic possible dashboard.</p>
      
      <button 
        onClick={() => window.location.href = "/test-dashboard"}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Back to Test Dashboard
      </button>
    </div>
  );
}