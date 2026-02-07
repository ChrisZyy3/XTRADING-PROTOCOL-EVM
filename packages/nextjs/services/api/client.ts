import axios from "axios";
import { queryClient } from "~~/services/queryClient";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

// 从环境变量读取 API 基础路径，默认 fallback 到 localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://xtrading.xin/api/v1";

const ERROR_CODE_MESSAGES: Record<"zh" | "en", Record<number, string>> = {
  zh: {
    1001: "参数错误",
    1002: "用户不存在",
    1003: "余额不足",
    1004: "权限不足",
    1005: "Token无效或过期",
    1006: "资源已存在",
    2001: "数据库错误",
    2002: "外部服务错误",
    3001: "转账失败",
    3002: "算力不足",
    3003: "节点状态错误",
  },
  en: {
    1001: "Invalid parameters",
    1002: "User not found",
    1003: "Insufficient balance",
    1004: "Permission denied",
    1005: "Token invalid or expired",
    1006: "Resource already exists",
    2001: "Database error",
    2002: "External service error",
    3001: "Transfer failed",
    3002: "Insufficient hashrate",
    3003: "Invalid node status",
  },
};

const FALLBACK_MESSAGES = {
  requestError: { zh: "请求错误", en: "Request Error" },
  loginFailed: { zh: "登录失败", en: "Login failed" },
  sessionExpired: { zh: "登录过期，请重新登录", en: "Session expired, please log in again" },
  networkError: { zh: "网络异常，请稍后重试", en: "Network error, please try again later" },
};

const getLanguage = (): "zh" | "en" => {
  const lang = useGlobalState.getState().language;
  return lang === "en" ? "en" : "zh";
};

const getErrorMessage = (code: number, backendMessage?: string): string => {
  if (backendMessage) return backendMessage;
  const lang = getLanguage();
  return ERROR_CODE_MESSAGES[lang][code] || FALLBACK_MESSAGES.requestError[lang];
};

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

    // 检查业务状态码 (0 视为成功)
    if (res.code !== 0) {
      const message = getErrorMessage(res.code, res.message);

      if (res.code === 1005) {
        useAuthStore.getState().logout();
        queryClient.clear();
      }

      notification.error(message);
      return Promise.reject(new Error(message));
    }
    return res;
  },
  error => {
    const backendMessage = error.response?.data?.message;
    const lang = getLanguage();

    // 处理 HTTP 错误状态
    if (error.response?.status === 401) {
      // 如果是登录接口本身的 401 (密码错误等)，不应该提示会话过期
      const isLoginRequest = error.config?.url?.includes("/login");
      const isNodeAvailableRequest = error.config?.url?.includes("/node/available");

      if (!isLoginRequest && !isNodeAvailableRequest) {
        // 401 Unauthorized (且非登录请求): token 过期或无效，执行登出
        useAuthStore.getState().logout();
        queryClient.clear();
        notification.error(backendMessage || FALLBACK_MESSAGES.sessionExpired[lang]);
      } else if (isLoginRequest) {
        // 登录请求失败，直接显示后端返回的错误 (如: 地址或密码错误)
        notification.error(backendMessage || FALLBACK_MESSAGES.loginFailed[lang]);
      }
    } else {
      // 其他错误优先显示后端返回的 message，否则显示兜底提示
      notification.error(backendMessage || FALLBACK_MESSAGES.networkError[lang]);
    }
    return Promise.reject(error);
  },
);
