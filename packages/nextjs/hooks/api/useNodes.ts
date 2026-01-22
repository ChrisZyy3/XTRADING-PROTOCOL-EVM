import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nodeEndpoints } from "~~/services/web2/endpoints";
import { BuyNodeRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

export const useNodeTypes = () => {
  return useQuery({
    queryKey: ["nodeTypes"],
    queryFn: () => nodeEndpoints.getNodeTypes(),
  });
};

export const useNodeStock = () => {
  return useQuery({
    queryKey: ["node-stock"],
    queryFn: () => nodeEndpoints.getNodeStock(),
  });
};

export const useBuyNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BuyNodeRequest) => nodeEndpoints.buyNode(data),
    onSuccess: () => {
      notification.success("Node purchased successfully!");
      queryClient.invalidateQueries({ queryKey: ["hashpower"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] }); // Buying costs money
    },
    onError: (error: any) => {
      console.error("Buy node failed", error);
    },
  });
};

export const useHashpower = () => {
  return useQuery({
    queryKey: ["hashpower"],
    queryFn: () => nodeEndpoints.getHashpower(),
  });
};
