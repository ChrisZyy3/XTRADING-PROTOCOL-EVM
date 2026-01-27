import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { withdrawEndpoints } from "~~/services/web2/endpoints";
import { InjectPoolRequest, WithdrawRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

// Removed useDepositAddress as it is obsolete.

/**
 * Check Injection Status
 */
export const useInjectionStatus = () => {
  return useQuery({
    queryKey: ["injectionStatus"],
    queryFn: () => withdrawEndpoints.getInjectionStatus(),
  });
};

/**
 * Inject Pool
 */
export const useInjectPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InjectPoolRequest) => withdrawEndpoints.injectPool(data),
    onSuccess: () => {
      notification.success("Injection successful!");
      queryClient.invalidateQueries({ queryKey: ["injectionStatus"] });
      // Balance changed
    },
    onError: (error: any) => {
      console.error("Injection failed", error);
    },
  });
};

/**
 * Request Withdraw (Step 2)
 */
export const useRequestWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawRequest) => withdrawEndpoints.requestWithdraw(data),
    onSuccess: () => {
      notification.success("Withdrawal request submitted!");
      queryClient.invalidateQueries({ queryKey: ["withdrawHistory"] });
    },
    onError: (error: any) => {
      console.error("Withdraw failed", error);
    },
  });
};

/**
 * Get withdraw history hook
 */
export const useWithdrawHistory = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["withdrawHistory", page, limit],
    queryFn: () => withdrawEndpoints.getHistory(page, limit),
  });
};
