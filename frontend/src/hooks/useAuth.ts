import { useQuery } from "@tanstack/react-query";
import { apiCallWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      console.log('🔐 useAuth: Starting auth check');
      const token = localStorage.getItem('token');
      console.log('🎫 useAuth: Token exists:', !!token);
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/auth/me`);
      console.log('📡 useAuth: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error("Failed to get user data");
      }
      
      const data = await response.json();
      console.log('📦 useAuth: Response data:', data);
      
      return data.data; // { customer: {...}, vehicles: [...] }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}