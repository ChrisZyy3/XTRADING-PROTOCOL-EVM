import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~~/services/store/authStore";
import { authEndpoints } from "~~/services/web2/endpoints";
import { WalletLoginRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

/**
 * 登录 Hook
 * 使用 useMutation 处理登录请求
 */
/**
 * 钱包登录 Hook
 * 使用 useMutation 处理钱包签名登录请求
 */
export const useWalletLogin = () => {
  const setLogin = useAuthStore(state => state.setLogin);
  const setUser = useAuthStore(state => state.setUser);

  return useMutation({
    /**
     * 执行钱包登录请求
     * @param data WalletLoginRequest
     */
    mutationFn: (data: WalletLoginRequest) => authEndpoints.walletLogin(data),
    /**
     * 成功回调
     * 保存 auth 信息到全局 store，并弹出提示
     */
    onSuccess: async response => {
      // Set token and basic info
      setLogin(response.data.token, response.data.address);

      // Fetch full profile immediately
      try {
        const profileRes = await authEndpoints.getProfile();
        setUser(profileRes.data);
      } catch (e) {
        console.error("Failed to fetch profile after login", e);
      }

      if (response.data.is_new_user) {
        notification.success("Registration successful!");
      } else {
        notification.success("Login successful!");
      }
    },
    onError: (error: any) => {
      console.error("Login failed", error);
      // 错误提示已在 client 拦截器中处理，这里可以做额外逻辑
    },
  });
};

export const useUserProfile = () => {
  const setUser = useAuthStore(state => state.setUser);
  const token = useAuthStore(state => state.token);

  return useMutation({
    mutationFn: () => authEndpoints.getProfile(),
    onSuccess: response => {
      if (token) {
        setUser(response.data);
      }
    },
  });
};

/**
 * 登出 Hook
 * 始终清理本地认证状态与缓存，即使后端请求失败。
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore(state => state.logout);

  return useMutation({
    mutationFn: async () => {
      try {
        await authEndpoints.logout();
      } catch (error) {
        console.error("Logout request failed", error);
      } finally {
        // 确保本地状态与缓存清理
        logout();
        queryClient.clear();
      }
    },
  });
};
