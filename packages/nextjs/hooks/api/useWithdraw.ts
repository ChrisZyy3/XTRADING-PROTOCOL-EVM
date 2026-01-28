import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~~/services/store/authStore";
import { withdrawEndpoints } from "~~/services/web2/endpoints";
import { InjectPoolRequest, WithdrawRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

export const useWithdrawInjectionStatus = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["withdrawInjectionStatus"],
    queryFn: () => withdrawEndpoints.getInjectionStatus(),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useWithdrawInject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InjectPoolRequest) => withdrawEndpoints.injectPool(data),
    onSuccess: () => {
      notification.success("Injection successful!");
      queryClient.invalidateQueries({ queryKey: ["withdrawInjectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] }); // Update balance
    },
    onError: (error: any) => {
      console.error("Injection failed", error);
    },
  });
};

export const useWithdrawRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawRequest) => withdrawEndpoints.requestWithdraw(data),
    onSuccess: () => {
      notification.success("Withdrawal requested successfully!");
      queryClient.invalidateQueries({ queryKey: ["withdrawHistory"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] }); // Update balance
    },
    onError: (error: any) => {
      console.error("Withdrawal request failed", error);
    },
  });
};

export const useWithdrawHistory = (page = 1, limit = 20) => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["withdrawHistory", page, limit],
    queryFn: () => withdrawEndpoints.getHistory(page, limit),
    enabled: !!token,
    retry: false,
  });
};
