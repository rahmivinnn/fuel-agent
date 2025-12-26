import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { apiCallWithAuth } from "@/lib/auth";

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/customers/${customerId}`);
      return response.json();
    },
    enabled: !!customerId,
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, data }: { customerId: string; data: any }) => {
      const response = await apiCallWithAuth(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
    },
  });
}