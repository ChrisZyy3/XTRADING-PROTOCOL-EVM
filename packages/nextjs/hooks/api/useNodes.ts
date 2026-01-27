import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nodeEndpoints } from "~~/services/web2/endpoints";
import { BuyNodeRequest, ClaimNodeBonusRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

export const useAvailableNodes = () => {
  return useQuery({
    queryKey: ["availableNodes"],
    queryFn: () => nodeEndpoints.getAvailableNodes(),
  });
};

export const usePurchaseNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BuyNodeRequest) => nodeEndpoints.purchaseNode(data),
    onSuccess: () => {
      notification.success("Node purchased successfully!");
      queryClient.invalidateQueries({ queryKey: ["availableNodes"] });
      queryClient.invalidateQueries({ queryKey: ["myNodes"] });
      queryClient.invalidateQueries({ queryKey: ["userHashrate"] }); // Hashrate increases
    },
    onError: (error: any) => {
      console.error("Purchase failed", error);
    },
  });
};

export const useMyNodes = () => {
  return useQuery({
    queryKey: ["myNodes"],
    queryFn: () => nodeEndpoints.getMyNodes(),
  });
};

export const useClaimBonus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClaimNodeBonusRequest) => nodeEndpoints.claimBonus(data),
    onSuccess: () => {
      notification.success("Bonus claimed!");
      queryClient.invalidateQueries({ queryKey: ["myNodes"] });
    },
    onError: (error: any) => {
      console.error("Claim failed", error);
    },
  });
};

export const useNodeRewards = () => {
  return useQuery({
    queryKey: ["nodeRewards"],
    queryFn: () => nodeEndpoints.getRewards(),
  });
};
