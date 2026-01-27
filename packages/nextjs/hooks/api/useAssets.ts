import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~~/services/store/authStore";
import { assetEndpoints } from "~~/services/web2/endpoints";
import { TransferRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

export const useTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferRequest) => assetEndpoints.transfer(data),
    onSuccess: response => {
      const { burned_amount, to_amount, mining_pool_amount, from_hashrate } = response.data;
      notification.success(
        `Transfer success! Burn: ${burned_amount}, To: ${to_amount}, Pool: ${mining_pool_amount}, HP+: ${from_hashrate}`,
      );
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
      // Suggest refetching profile somehow?
    },
    onError: (error: any) => {
      console.error("Transfer failed", error);
    },
  });
};

export const useTransferHistory = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["transferHistory", page, limit],
    queryFn: () => assetEndpoints.getTransferHistory(page, limit),
  });
};
