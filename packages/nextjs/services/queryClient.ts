import { QueryClient } from "@tanstack/react-query";

// Singleton QueryClient used across the app (hooks + global error handling).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // 禁用失败重试,避免多次错误提示 (Disable retry on failure to avoid multiple error notifications)
      retry: false,
    },
  },
});
