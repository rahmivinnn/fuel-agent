import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export function useOrders(status?: string, driverIdOrCustomerId?: string, mode: "driver" | "customer" = "driver") {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (driverIdOrCustomerId) {
    if (mode === "driver") params.append("driverId", driverIdOrCustomerId);
    if (mode === "customer") params.append("customerId", driverIdOrCustomerId);
  }
  const query = params.toString();
  return useQuery({
    queryKey: ["/api/orders", status, driverIdOrCustomerId, mode],
    queryFn: async () => {
      const response = await fetch(`/api/orders${query ? `?${query}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      // Backend returns array directly, not wrapped in success object
      return Array.isArray(data) ? data : data.orders || [];
    },
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
