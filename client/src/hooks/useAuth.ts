import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check for stored user session
  const storedUser = localStorage.getItem('user');
  const hasStoredUser = !!storedUser;

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: hasStoredUser, // Only query if we have a stored user
  });

  // Use stored user if available, otherwise use query result
  const currentUser = hasStoredUser ? JSON.parse(storedUser) : user;

  return {
    user: currentUser,
    isLoading: hasStoredUser ? false : isLoading,
    isAuthenticated: !!currentUser,
  };
}