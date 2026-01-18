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
  const setAuth = useAuthStore(state => state.setAuth);

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
    onSuccess: response => {
      setAuth(response.data);
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
  const setAuth = useAuthStore(state => state.setAuth);

  return useMutation({
    /**
     * 执行注册请求
     * @param data RegisterRequest
     */
    mutationFn: (data: RegisterRequest) => authEndpoints.register(data),
    onSuccess: response => {
      // 注册成功后直接自动登录
      setAuth(response.data);
      notification.success("Registration successful!");
    },
    onError: (error: any) => {
      console.error("Registration failed", error);
    },
  });
};
