import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If there's an error (like 401), consider loading complete
  const actuallyLoading = isLoading && !error;

  // Simple debug logging
  if (user) {
    console.log('✅ User authenticated:', `${user.firstName} ${user.lastName}`);
  } else if (!actuallyLoading) {
    console.log('❌ No user found - not authenticated');
  }

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
  };
}
