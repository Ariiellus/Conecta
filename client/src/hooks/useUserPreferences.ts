import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserPreferences {
  sendCurrency: string | null;
  receiveCurrency: string | null;
  twoFactorEnabled: boolean | null;
  stripeAccountId: string | null;
}

export function useUserPreferences() {
  const queryClient = useQueryClient();
  
  // Get user preferences
  const preferencesQuery = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const response = await fetch("/api/user/preferences");
      if (!response.ok) {
        throw new Error("Failed to fetch user preferences");
      }
      return response.json() as Promise<UserPreferences>;
    }
  });
  
  // Update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      const response = await apiRequest("PUT", "/api/user/preferences", preferences);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    }
  });
  
  return {
    preferences: preferencesQuery.data || {
      sendCurrency: "USD",
      receiveCurrency: "USD",
      twoFactorEnabled: false,
      stripeAccountId: null
    },
    isLoading: preferencesQuery.isLoading,
    error: preferencesQuery.error,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending
  };
}