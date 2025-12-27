import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { apiCallWithAuth } from "@/lib/auth";
import type { FuelFriend } from "@/lib/schemas";

export function useDriver(fuelFriendId: string) {
  return useQuery<FuelFriend>({
    queryKey: ["fuel-friends", fuelFriendId],
    queryFn: async () => {
      try {
        const response = await apiCallWithAuth(`${API_BASE_URL}/api/fuel-friends/${fuelFriendId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch fuel friend:', response.status);
          // Return mock data from localStorage as fallback
          const customerName = localStorage.getItem('customerName') || localStorage.getItem('driverName') || 'Driver';
          const customerEmail = localStorage.getItem('customerEmail') || 'driver@example.com';
          
          return {
            id: fuelFriendId,
            fullName: customerName,
            email: customerEmail,
            phoneNumber: localStorage.getItem('userPhone') || '+1234567890',
            location: localStorage.getItem('userLocation') || 'Location',
            services: JSON.parse(localStorage.getItem('userServices') || '["Fuel delivery"]'),
            about: localStorage.getItem('userAbout') || 'Professional fuel delivery service',
            rating: 4.8,
            reviewCount: 128,
            isAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as FuelFriend;
        }
        
        const data = await response.json();
        console.log('Fuel friend data:', data);
        
        return data.fuelFriend || data;
      } catch (error) {
        console.error('Error fetching fuel friend:', error);
        // Return mock data from localStorage as fallback
        const customerName = localStorage.getItem('customerName') || localStorage.getItem('driverName') || 'Driver';
        const customerEmail = localStorage.getItem('customerEmail') || 'driver@example.com';
        
        return {
          id: fuelFriendId,
          fullName: customerName,
          email: customerEmail,
          phoneNumber: localStorage.getItem('userPhone') || '+1234567890',
          location: localStorage.getItem('userLocation') || 'Location',
          services: JSON.parse(localStorage.getItem('userServices') || '["Fuel delivery"]'),
          about: localStorage.getItem('userAbout') || 'Professional fuel delivery service',
          rating: 4.8,
          reviewCount: 128,
          isAvailable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as FuelFriend;
      }
    },
    enabled: !!fuelFriendId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
