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
      
      // Try fuel friend endpoint first
      try {
        const fuelFriendId = localStorage.getItem('tempFuelFriendId') || 
                            localStorage.getItem('userId') ||
                            localStorage.getItem('fuelFriendId');
        
        if (fuelFriendId) {
          console.log('🚚 Trying fuel friend endpoint with ID:', fuelFriendId);
          const response = await apiCallWithAuth(`${API_BASE_URL}/api/fuel-friends/${fuelFriendId}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('📦 Fuel friend data:', data);
            return { fuelFriend: data.data?.fuelFriend || data.data };
          }
        }
      } catch (error) {
        console.log('⚠️ Fuel friend endpoint failed, trying customer endpoint');
      }
      
      // Fallback to customer endpoint
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/auth/me`);
      console.log('📡 Customer response status:', response.status);
      
      if (!response.ok) {
        throw new Error("Failed to get user data");
      }
      
      const data = await response.json();
      console.log('📦 Customer data:', data);
      
      return data.data; // { customer: {...}, vehicles: [...] }
    },
    enabled: !!token, // Only run query if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}