import { useQuery } from "@tanstack/react-query";
import type { FuelFriend } from "@shared/schema";

export function useDriver(id: string) {
  return useQuery<FuelFriend>({
    queryKey: ["/api/fuel-friends", id],
    queryFn: async () => {
      const response = await fetch(`/api/fuel-friends/${id}`);
      if (!response.ok) throw new Error("Failed to fetch driver");
      const data = await response.json();
      return data.fuelFriend;
    },
    enabled: !!id,
  });
}
