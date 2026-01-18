import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetEndpoints } from "~~/services/web2/endpoints";
import { TransferRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

export const useBalance = () => {
  return useQuery({
    queryKey: ["balance"],
    queryFn: () => assetEndpoints.getBalance(),
    refetchInterval: 10000, // Refresh every 10s
  });
};

export const useTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferRequest) => assetEndpoints.transfer(data),
    onSuccess: () => {
      notification.success("Transfer successful!");
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
    },
    onError: (error: any) => {
      console.error("Transfer failed", error);
    },
  });
};

export const useTransferHistory = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["transferHistory", page, pageSize],
    queryFn: () => assetEndpoints.getTransferHistory(page, pageSize),
  });
};
