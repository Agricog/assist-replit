import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
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
