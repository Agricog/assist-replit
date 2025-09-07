import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  console.log('🔍 useAuth hook called');
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000, // 1 second only - force fresh checks
    refetchInterval: false,
  });

  // If there's an error (like 401), consider loading complete
  const actuallyLoading = isLoading && !error;

  // Debug logging
  console.log('useAuth state:', {
    user: user ? `${user.firstName} ${user.lastName}` : 'null',
    isLoading: actuallyLoading,
    error: error?.message || 'none',
    isAuthenticated: !!user
  });

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
  };
}
