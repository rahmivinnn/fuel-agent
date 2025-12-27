import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { API_BASE_URL } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { API_BASE_URL } from "@/lib/api";
import { apiCallWithAuth } from "@/lib/auth";

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
      
      const url = `${API_BASE_URL}/api/orders${query ? `?${query}` : ""}`;
      console.log('Fetching orders:', url);
      
      const response = await apiCallWithAuth(url);
      
      if (!response.ok) {
        console.error('Orders fetch failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Orders response:', data);
      
      // Ensure we always return an array
      const orders = Array.isArray(data) ? data : (data.orders || []);
      return orders;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
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
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/orders/${orderId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ driverId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
