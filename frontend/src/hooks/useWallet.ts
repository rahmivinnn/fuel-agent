import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { apiCallWithAuth } from "@/lib/auth";

export function useWallet(driverId: string) {
  return useQuery({
    queryKey: ["wallet", driverId],
    queryFn: async () => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/wallet/driver/${driverId}`);
      return response.json();
    },
    enabled: !!driverId,
  });
}

export function useTransactions(driverId: string) {
  return useQuery({
    queryKey: ["transactions", driverId],
    queryFn: async () => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/transactions/driver/${driverId}`);
      return response.json();
    },
    enabled: !!driverId,
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ amount, email, method }: { amount: string; email: string; method: string }) => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/payments/withdraw`, {
        method: 'POST',
        body: JSON.stringify({ amount, email, method })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}