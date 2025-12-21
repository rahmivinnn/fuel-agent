import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Wallet, Transaction } from "@shared/schema";
import { API_BASE_URL } from "@/lib/api";

export function useWallet(driverId: string) {
  return useQuery<Wallet>({
    queryKey: ["/api/wallet", driverId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/wallet/driver/${driverId}`);
      if (!response.ok) throw new Error("Failed to fetch wallet");
      return response.json();
    },
    enabled: !!driverId,
  });
}

export function useTransactions(driverId: string) {
  return useQuery<Transaction[]>({
    queryKey: ["/api/transactions", driverId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/transactions/driver/${driverId}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!driverId,
  });
}

export function useWithdraw() {
  return useMutation({
    mutationFn: async ({
      driverId,
      amount,
      paymentMethod,
    }: {
      driverId: string;
      amount: string;
      paymentMethod: string;
    }) => {
      // In a real app, you'd get the user's email from their profile or auth context
      // For now we'll mock it or get it from storage if available
      const email = localStorage.getItem("driverEmail") || "driver@example.com";

      const result = await apiRequest("POST", "/api/payments/withdraw", {
        amount,
        email,
        method: paymentMethod
      });

      // If withdrawal is successful, update the wallet balance
      if (result.success) {
        // In a real implementation, you would update the wallet balance on the server
        // For now, we'll just invalidate the query to refetch the wallet data
        queryClient.invalidateQueries({ queryKey: ["/api/wallet", driverId] });
        queryClient.invalidateQueries({ queryKey: ["/api/transactions", driverId] });
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet", variables.driverId] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", variables.driverId] });
    },
  });
}