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
 * 分页响应数据接口
 */
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
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

// --- 业务模块类型定义 ---

/**
 * 余额响应接口
 */
export interface BalanceResponse {
  /** TCM 余额 */
  tcm_balance: string;
  /** USDT 余额 */
  usdt_balance: string;
  /** 锁仓 TCM */
  locked_tcm: string;
}

/**
 * 转账请求参数 (链下)
 */
export interface TransferRequest {
  /** 接收方地址 */
  to_address: string;
  /** 金额 (18位小数的整数形字符串) */
  amount: string;
  /** 备注 */
  memo?: string;
}

/**
 * 转账记录详情
 */
export interface TransferRecord {
  id: number;
  from_address: string;
  to_address: string;
  amount: string;
  actual_amount: string; // 扣除手续费后的实际到账
  fee: string; // 手续费
  memo?: string;
  status: number; // 1: 成功, 0: 失败
  created_at: string;
}

/**
 * 节点类型信息
 */
export interface NodeType {
  type: string; // 'genesis' | 'super' | 'city' | 'community'
  name: string;
  usd_amount: string; // USDT 价格
  tcm_locked: string; // 质押 TCM
  hash_power: number; // 增加的算力 (number type based on JSON)
  ref_reward: string;
  swap_dividend: string;
}

/**
 * 购买节点请求
 */
export interface BuyNodeRequest {
  node_type: string;
}

/**
 * 算力信息响应
 */
export interface HashpowerResponse {
  id: number;
  user_id: number;
  total_hash_power: string;
  effective_hash_power: string;
  node_hash_power: string;
  hold_hash_power: string;
  updated_at: string;
}

/**
 * 充值地址响应
 */
export interface DepositAddressResponse {
  address: string;
  chain: string; // e.g., 'ERC20' or 'TRC20'
}

/**
 * 提现申请请求
 */
export interface WithdrawRequest {
  to_address: string;
  amount: string;
}

/**
 * 分红记录
 */
export interface DividendRecord {
  id: number;
  amount: string;
  token_type: string; // 'TCM' or 'USDT'
  reason: string;
  created_at: string;
}

/**
 * 分红页面概览响应
 */
export interface DividendOverviewResponse {
  dividend_count: number;
  dividends: any[]; // 暂时 unknown，视具体 array 内容而定
  pending_dividend: string;
}
