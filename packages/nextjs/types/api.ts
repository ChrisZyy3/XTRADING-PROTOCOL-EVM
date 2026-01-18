/**
 * 通用 API 响应接口
 * @template T 数据类型
 */
export interface ApiResponse<T = any> {
  /** 状态码，200 表示成功 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 认证响应数据接口
 */
export interface AuthResponse {
  /** JWT 令牌 */
  token: string;
  /** 用户信息 */
  user: {
    /** 用户ID */
    id: number;
    /** 钱包地址 */
    address: string;
    /** 用户名 */
    username?: string;
    /** 邮箱 */
    email?: string;
    /** 随机数 */
    nonce?: number;
    /** 状态 */
    status?: number;
    /** 创建时间 */
    created_at?: string;
    /** 更新时间 */
    updated_at?: string;
  };
}

/**
 * 登录请求参数接口
 */
export interface LoginRequest {
  /** 钱包地址 */
  address: string;
  /** 密码 (明文) */
  password?: string;
  /** 签名 (未来支持钱包签名登录) */
  signature?: string;
}

/**
 * 注册请求参数接口
 */
export interface RegisterRequest {
  /** 钱包地址 */
  address: string;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 密码 */
  password?: string;
}
