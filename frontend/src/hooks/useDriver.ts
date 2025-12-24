import { useQuery } from "@tanstack/react-query";
import type { FuelFriend } from "@/lib/schemas";
import { API_BASE_URL } from "@/lib/api";

export function useDriver(id: string) {
  return useQuery<FuelFriend>({
    queryKey: ["fuel-friends", id],
    queryFn: async () => {
      console.log('Fetching driver:', `${API_BASE_URL}/api/fuel-friends/${id}`);
      
      const response = await fetch(`${API_BASE_URL}/api/fuel-friends/${id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('Driver fetch failed:', response.status, response.statusText);
        throw new Error("Failed to fetch driver");
      }
      const data = await response.json();
      console.log('Driver response:', data);
      
      return data.fuelFriend;
    },
    enabled: !!id,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });
}
