import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false, // Don't refetch on focus to prevent loops
    staleTime: 10000,           // Reduced to 10 seconds for faster auth updates
    gcTime: 60000,              // Reduced cache time
  });

  // Debug logging
  console.log('🔍 useAuth Debug:', {
    user: user ? `${user.username} (${user.authType})` : 'null',
    isLoading,
    error: error ? error.message : 'none',
    isAuthenticated: !!user
  });

  // If there's an error (like 401), consider loading complete
  const actuallyLoading = isLoading && !error;

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
  };
}
