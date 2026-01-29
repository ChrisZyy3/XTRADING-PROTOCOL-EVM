import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~~/services/store/authStore";
import { assetEndpoints } from "~~/services/web2/endpoints";
import { TransferRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

export const useTransfer = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore(state => state.setUser);

  return useMutation({
    mutationFn: (data: TransferRequest) => assetEndpoints.transfer(data),
    onSuccess: async response => {
      const { burned_amount, to_amount, mining_pool_amount, from_hashrate } = response.data;

      const { useGlobalState } = await import("~~/services/store/store");
      const t = useGlobalState.getState().t;

      const message = t.transfer.successMsg
        .replace("{burn}", String(burned_amount))
        .replace("{toAmount}", String(to_amount))
        .replace("{pool}", String(mining_pool_amount))
        .replace("{hp}", String(from_hashrate));

      notification.success(message, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });

      // Refresh user profile to update balances
      try {
        // We can't use useUserProfile hook inside callback easily without rules of hooks issues if we wanted that hook's mutation ref.
        // Instead, just call the endpoint directly and update store.
        const { authEndpoints } = await import("~~/services/web2/endpoints");
        const profileRes = await authEndpoints.getProfile();
        setUser(profileRes.data);
      } catch (e) {
        console.error("Failed to refresh profile after transfer", e);
      }
    },
    onError: (error: any) => {
      console.error("Transfer failed", error);
    },
  });
};

export const useTransferHistory = (page = 1, limit = 20) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["transferHistory", page, limit],
    queryFn: () => assetEndpoints.getTransferHistory(page, limit),
    enabled: isAuthenticated,
    retry: false,
  });
};
