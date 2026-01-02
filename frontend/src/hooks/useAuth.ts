import { useQuery } from "@tanstack/react-query";
import { apiCallWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

export function useAuth() {
  const token = localStorage.getItem('token');
  
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      console.log('🔐 useAuth: Starting auth check');
      console.log('🎫 useAuth: Token exists:', !!token);
      
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/auth/me`);
      console.log('📡 useAuth: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error("Failed to get user data");
      }
      
      const data = await response.json();
      console.log('📦 useAuth: Response data:', data);
      
      return data.data; // { fuelFriend: {...}, vehicles: [...] }
    },
    enabled: !!token, // Only run query if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}