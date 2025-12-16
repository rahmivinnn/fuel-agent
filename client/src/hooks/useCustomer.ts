import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";

export function useCustomer(id: string) {
  return useQuery<{ customer: Customer; vehicles: any[] }>({
    queryKey: ["/api/customers", id],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${id}`);
      if (!response.ok) throw new Error("Failed to fetch customer");
      const data = await response.json();
      return data;
    },
    enabled: !!id,
  });
}
