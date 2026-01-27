import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { miningEndpoints } from "~~/services/web2/endpoints";
import { notification } from "~~/utils/scaffold-eth";

export const useUserHashrate = () => {
  return useQuery({
    queryKey: ["userHashrate"],
    queryFn: () => miningEndpoints.getUserHashrate(),
  });
};

export const useTotalHashrate = () => {
  return useQuery({
    queryKey: ["totalHashrate"],
    queryFn: () => miningEndpoints.getTotalHashrate(),
  });
};

export const useHashrateShare = () => {
  return useQuery({
    queryKey: ["hashrateShare"],
    queryFn: () => miningEndpoints.getHashrateShare(),
  });
};

export const useDailyReward = (daily_pool?: string) => {
  return useQuery({
    queryKey: ["dailyReward", daily_pool],
    queryFn: () => miningEndpoints.getDailyReward(daily_pool),
  });
};

export const useMiningPending = () => {
  return useQuery({
    queryKey: ["miningPending"],
    queryFn: () => miningEndpoints.getPendingRewards(),
  });
};

export const useClaimRewards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => miningEndpoints.claimRewards(),
    onSuccess: () => {
      notification.success("Rewards claimed successfully!");
      queryClient.invalidateQueries({ queryKey: ["miningPending"] });
      // Invalidate balance/profile?
    },
    onError: (error: any) => {
      console.error("Claim failed", error);
    },
  });
};
