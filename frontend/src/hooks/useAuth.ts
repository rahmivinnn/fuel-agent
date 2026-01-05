import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCallWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { useEffect } from "react";

export function useAuth() {
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();
  
  // Invalidate cache when token changes
  useEffect(() => {
    if (token) {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  }, [token, queryClient]);
  
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/auth/me`);
      
      if (!response.ok) {
        throw new Error("Failed to get user data");
      }
      
      const data = await response.json();
      return data.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}
  const queryClient = useQueryClient();
  
  // Invalidate cache when token changes
  useEffect(() => {
    if (token) {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  }, [token, queryClient]);
  
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
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
}