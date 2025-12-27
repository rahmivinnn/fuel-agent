import { useQuery } from "@tanstack/react-query";
import { apiCallWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/auth/me`);
      if (!response.ok) {
        throw new Error("Failed to get user data");
      }
      const data = await response.json();
      return data.data; // { customer: {...}, vehicles: [...] }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}