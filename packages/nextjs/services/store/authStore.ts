import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "~~/types/api";

/**
 * 认证状态接口
 */
interface AuthState {
  /** JWT 令牌，用于后续请求认证 */
  token: string | null;
  /** 当前登录用户信息 */
  user: UserProfile | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 设置认证信息 (登录成功后调用) */
  setLogin: (token: string, address: string) => void;
  /** 设置用户资料 */
  setUser: (user: UserProfile) => void;
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
      setLogin: (token, address) =>
        set({
          token,
          isAuthenticated: true,
          // Initialize user with address, other fields empty or null if possible.
          // But UserProfile has strict fields.
          // We can set user to null initially or partial?
          // Let's keep user null until fetched, OR create a partial user object.
          // Since UserProfile requires many fields, safer to keep user null or partial if we change UserProfile type to Partial?
          // For now, let's keep user null and require explicit fetch.
          // Or update UserProfile to have optional fields?
          // Let's assume user fetches profile right after login.
          user: null,
        }),
      setUser: user => set({ user }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // localStorage 中的 key
    },
  ),
);
