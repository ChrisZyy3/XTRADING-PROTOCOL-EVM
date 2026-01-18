import axios from "axios";
import { useAuthStore } from "~~/services/store/authStore";
import { notification } from "~~/utils/scaffold-eth";

// 从环境变量读取 API 基础路径，默认 fallback 到 localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api/v1";

/**
 * 创建 Axios 实例，配置基础 URL 和请求头
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 请求拦截器
 * 用于在发送请求前自动附加 Authentication Header (Bearer Token)
 */
apiClient.interceptors.request.use(
  config => {
    // 从 Zustand Store 获取 token
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 用于统一处理后端响应格式和全局错误情况
 */
apiClient.interceptors.response.use(
  response => {
    // API 返回格式: { code, message, data, timestamp }
    // 我们直接返回 response.data 给调用方，方便使用
    const res = response.data;

    // 检查业务状态码 (非 200 视为错误)
    if (res.code !== 200) {
      notification.error(res.message || "Request Error");
      return Promise.reject(new Error(res.message || "Error"));
    }
    return res;
  },
  error => {
    const backendMessage = error.response?.data?.message;

    // 处理 HTTP 错误状态
    if (error.response?.status === 401) {
      // 如果是登录接口本身的 401 (密码错误等)，不应该提示会话过期
      const isLoginRequest = error.config?.url?.includes("/login");

      if (!isLoginRequest) {
        // 401 Unauthorized (且非登录请求): token 过期或无效，执行登出
        useAuthStore.getState().logout();
        notification.error(backendMessage || "登录过期，请重新登录");
      } else {
        // 登录请求失败，直接显示后端返回的错误 (如: 地址或密码错误)
        notification.error(backendMessage || "登录失败");
      }
    } else {
      // 其他错误优先显示后端返回的 message，否则显示兜底提示
      notification.error(backendMessage || "网络异常，请稍后重试");
    }
    return Promise.reject(error);
  },
);
