import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { API_BASE_URL } from "@/lib/api";

export function useOrders(status?: string, driverIdOrCustomerId?: string, mode: "driver" | "customer" = "driver") {
  return useQuery({
    queryKey: ["orders", status, driverIdOrCustomerId, mode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (driverIdOrCustomerId) {
        if (mode === "driver") params.append("driverId", driverIdOrCustomerId);
        if (mode === "customer") params.append("customerId", driverIdOrCustomerId);
      }
      const query = params.toString();
      
      console.log('Fetching orders:', `${API_BASE_URL}/api/orders${query ? `?${query}` : ""}`);
      
      const response = await fetch(`${API_BASE_URL}/api/orders${query ? `?${query}` : ""}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('Orders fetch failed:', response.status, response.statusText);
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      console.log('Orders response:', data);
      
      // Backend returns array directly, not wrapped in success object
      return Array.isArray(data) ? data : data.orders || [];
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      const data = await response.json();
      return data.order; // The backend returns { success: true, order: {...}, items: [...] }
    },
    enabled: !!orderId,
  });
}

export function useAcceptOrder() {
  return useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      return apiRequest("POST", `/api/orders/${orderId}/accept`, { driverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useCancelOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest("POST", `/api/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useCompleteOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest("POST", `/api/orders/${orderId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}
