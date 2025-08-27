import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If there's an error (like 401), consider loading complete
  const actuallyLoading = isLoading && !error;

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
  };
}
