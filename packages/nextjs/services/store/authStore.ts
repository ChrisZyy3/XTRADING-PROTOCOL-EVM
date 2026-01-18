import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthResponse } from "~~/types/api";

/**
 * 认证状态接口
 */
interface AuthState {
  /** JWT 令牌，用于后续请求认证 */
  token: string | null;
  /** 当前登录用户信息 */
  user: AuthResponse["user"] | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 设置认证信息 (登录成功后调用) */
  setAuth: (data: AuthResponse) => void;
  /** 登出 (清除 Auth 信息) */
  logout: () => void;
}

/**
 * 使用 Zustand 管理的全局认证状态
 * 数据持久化存储在 localStorage 中
 */
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: data => set({ token: data.token, user: data.user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // localStorage 中的 key
    },
  ),
);
