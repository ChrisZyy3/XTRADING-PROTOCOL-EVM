import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentEndpoints } from "~~/services/web2/endpoints";
import { WithdrawRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

export const useDepositAddress = () => {
  return useMutation({
    mutationFn: () => paymentEndpoints.getDepositAddress(),
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawRequest) => paymentEndpoints.applyWithdraw(data),
    onSuccess: () => {
      notification.success("Withdrawal application submitted!");
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
    onError: (error: any) => {
      console.error("Withdraw failed", error);
    },
  });
};

/**
 * 获取提现历史 Hook
 * Get withdraw history hook
 */
export const useWithdrawHistory = () => {
  return useQuery({
    queryKey: ["withdrawHistory"],
    queryFn: () => paymentEndpoints.getWithdrawHistory(),
  });
};
