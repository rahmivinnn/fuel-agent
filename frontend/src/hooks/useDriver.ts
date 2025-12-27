import { useQuery } from "@tanstack/react-query";
import type { FuelFriend } from "@/lib/schemas";

export function useDriver(id: string) {
  return useQuery<FuelFriend>({
    queryKey: ["fuel-friends", id],
    queryFn: async () => {
      // Return mock data from localStorage instead of API call
      const customerName = localStorage.getItem('customerName') || localStorage.getItem('driverName') || 'Driver';
      const customerEmail = localStorage.getItem('customerEmail') || 'driver@example.com';
      
      return {
        id,
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
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
