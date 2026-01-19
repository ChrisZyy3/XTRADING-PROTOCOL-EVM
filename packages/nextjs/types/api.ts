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
    /** 钱包地址 (主键) */
    address: string;
    /** 用户名 */
    username: string;
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
  /** 用户名 */
  username?: string;
  /** 密码 (明文) */
  password?: string;
  /** 签名 (未来支持钱包签名登录) */
  signature?: string;
  /** 钱包地址 */
  address?: string;
}

/**
 * 注册请求参数接口
 */
export interface RegisterRequest {
  /** 用户名 */
  username: string;
  /** 密码 */
  password?: string;
  /** 推荐人地址 (可选) */
  refer?: string;
  /** 钱包地址 */
  address?: string; // 实际上注册时后端会自动从 chain 获取或生成，或者通过参数传？Doc says register body needs username, password, refer. Address is in response.
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
/**
 * 节点类型信息
 */
export interface NodeType {
  type: string; // 'genesis' | 'super' | 'city' | 'community'
  name: string;
  usd_amount: string; // V4: price renamed to usd_amount
  tcm_locked: string; // V4: restored
  hash_power: number; // V4: renamed from hashpower
  ref_reward: string; // V4: new
  swap_dividend: string; // V4: new
  price?: string; // Compat: keep optional if needed or remove if confident
  hashpower?: number; // Compat
}

/**
 * 购买节点请求
 */
export interface BuyNodeRequest {
  node_type: string;
}

/**
 * 购买节点响应
 */
export interface BuyNodeResponse {
  node_id: number;
  node_type: string;
  price: string;
  hashpower: number;
}

/**
 * 算力信息响应
 */
export interface HashpowerResponse {
  total_hashpower: number;
  nodes: {
    node_type: string;
    count: number;
    hashpower: number;
  }[];
}

/**
 * 充值地址响应
 */
export interface DepositAddressResponse {
  address: string;
  // chain removed in V3 docs example
  memo?: string; // V3 示例有 memo
}

/**
 * 提现申请请求
 */
export interface WithdrawRequest {
  to_address: string;
  amount: string;
}

/**
 * 提现申请响应
 */
export interface WithdrawResponse {
  id: number;
  to_address: string;
  amount: string;
  fee: string;
  actual_amount: string;
  status: number;
  created_at: string;
  tx_hash: string;
}

/**
 * 转账响应
 */
export interface TransferResponse {
  transaction_id: number;
  from_address: string;
  to_address: string;
  amount: string;
  burn_amount: string;
  receive_amount: string;
}

/**
 * 分红记录
 */
export interface DividendRecord {
  id: number;
  amount: string;
  status: number; // 0=pending?, 1=released?
  created_at: string;
}

/**
 * 分红页面概览响应
 */
export interface DividendOverviewResponse {
  dividend_count: number;
  dividends: DividendRecord[];
  pending_dividend: string;
}
