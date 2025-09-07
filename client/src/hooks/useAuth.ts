import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false, // Don't refetch on focus to prevent loops
    staleTime: 60000,           // Cache for 60 seconds for more stability  
    gcTime: 300000,             // Keep in memory for 5 minutes
  });

  // If there's an error (like 401), consider loading complete
  const actuallyLoading = isLoading && !error;

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
  };
}
