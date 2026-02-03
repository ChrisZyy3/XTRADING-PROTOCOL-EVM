import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~~/services/store/authStore";
import { referralEndpoints } from "~~/services/web2/endpoints";
import { BindReferralRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

/**
 * 获取我的推荐码
 */
export const useMyReferralCode = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["myReferralCode"],
    queryFn: () => referralEndpoints.getMyCode(),
    select: data => data.data,
    enabled: isAuthenticated,
  });
};

/**
 * 获取我的直接推荐列表
 */
export const useMyReferrals = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["myReferrals"],
    queryFn: () => referralEndpoints.getMyReferrals(),
    select: data => data.data,
    enabled: isAuthenticated,
  });
};

/**
 * 获取我的推荐链
 */
export const useMyReferralChain = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["myReferralChain"],
    queryFn: () => referralEndpoints.getMyChain(),
    select: data => data.data,
    enabled: isAuthenticated,
  });
};

/**
 * 绑定推荐关系
 */
export const useBindReferral = () => {
  return useMutation({
    mutationFn: (data: BindReferralRequest) => referralEndpoints.bindReferral(data),
    onSuccess: () => {
      notification.success("Referral bound successfully!");
    },
    onError: (error: any) => {
      console.error("Bind referral failed", error);
      // Error is handled in global interceptor
    },
  });
};
