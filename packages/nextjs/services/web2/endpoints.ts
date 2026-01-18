import { apiClient } from "~~/services/api/client";
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "~~/types/api";

/**
 * 认证相关 API 接口封装
 */
export const authEndpoints = {
  /**
   * 用户登录
   * @param data 登录参数 (地址, 密码)
   * @returns Promise<ApiResponse<AuthResponse>>
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post("/login", data);
  },

  /**
   * 用户注册
   * @param data 注册参数 (地址, 用户名, 邮箱, 密码)
   * @returns Promise<ApiResponse<AuthResponse>>
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post("/register", data);
  },
};
