import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "~~/services/store/authStore";
import { authEndpoints } from "~~/services/web2/endpoints";
import { LoginRequest, RegisterRequest } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

/**
 * 登录 Hook
 * 使用 useMutation 处理登录请求
 */
export const useLogin = () => {
  const setLogin = useAuthStore(state => state.setLogin);
  const setUser = useAuthStore(state => state.setUser);

  return useMutation({
    /**
     * 执行登录请求
     * @param data LoginRequest
     */
    mutationFn: (data: LoginRequest) => authEndpoints.login(data),
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
      notification.success("Login successful!");
    },
    onError: (error: any) => {
      console.error("Login failed", error);
      // 错误提示已在 client 拦截器中处理，这里可以做额外逻辑
    },
  });
};

/**
 * 注册 Hook
 */
export const useRegister = () => {
  const setLogin = useAuthStore(state => state.setLogin);
  const setUser = useAuthStore(state => state.setUser);

  return useMutation({
    /**
     * 执行注册请求
     * @param data RegisterRequest
     */
    mutationFn: (data: RegisterRequest) => authEndpoints.register(data),
    onSuccess: async response => {
      // 注册成功后直接自动登录
      setLogin(response.data.token, response.data.address);

      // Fetch full profile immediately
      try {
        const profileRes = await authEndpoints.getProfile();
        setUser(profileRes.data);
      } catch (e) {
        console.error("Failed to fetch profile after register", e);
      }
      notification.success("Registration successful!");
    },
    onError: (error: any) => {
      console.error("Registration failed", error);
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
