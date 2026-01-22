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
export interface BalanceInfo {
  id: number;
  address: string;
  tcm_balance: string;
  usdt_balance: string;
  locked_tcm: string;
  pool_injected_tcm?: string;
  updated_at: string;
}

export type BalanceResponse = Partial<BalanceInfo> & {
  balance?: BalanceInfo;
  on_chain_tcm_balance?: string;
};

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
  /** 交易ID */
  id: number;
  /** 发送方地址 */
  from_address: string;
  /** 接收方地址 */
  to_address: string;
  /** 转账金额 (wei单位) */
  amount: string;
  /** 销毁金额 (20%) */
  burn_amount: string;
  /** 实际到账金额 (80%) */
  receive_amount: string;
  /** 交易类型: transfer=转账, deposit=充值, withdraw=提现 */
  tx_type: string;
  /** 状态: 0=pending, 1=completed, 2=failed */
  status: number;
  /** 转账备注 */
  memo?: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
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
export interface NodeStockByType {
  type: string;
  total: number;
  sold: number;
  remaining: number;
}

export interface NodeStockResponse {
  total: number;
  sold: number;
  remaining: number;
  by_type: NodeStockByType[];
}

export interface BuyNodeRequest {
  node_type: string;
}

/**
 * 购买节点响应 / 节点记录
 */
export interface BuyNodeResponse {
  /** 节点ID */
  id: number;
  /** 拥有者地址 */
  address: string;
  /** 节点类型: genesis, super, city, community */
  node_type: string;
  /** 支付的美元金额 */
  usd_amount: string;
  /** 锁仓的TCM数量 */
  tcm_locked: string;
  /** 算力值 */
  hash_power: string;
  /** 下线节点数量 */
  ref_count: number;
  /** 状态: 1=激活, 0=过期 */
  status: number;
  /** 过期时间 (2年有效期) */
  expires_at: string;
  /** 创建时间 */
  created_at: string;
}

/**
 * 算力信息响应
 */
export interface HashpowerResponse {
  /** 记录ID */
  id: number;
  /** 区块链地址 */
  address: string;
  /** 总算力 */
  total_hash_power: string;
  /** 有效算力 */
  effective_hash_power: string;
  /** 节点算力 */
  node_hash_power: string;
  /** 持币算力 */
  hold_hash_power: string;
  /** 更新时间 */
  updated_at: string;
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
  /** 提现记录ID */
  withdraw_id: number;
  /** 链上交易哈希 */
  tx_hash: string;
  /** 提现金额 (wei单位) */
  amount: string;
  /** 手续费 (10%) */
  fee: string;
  /** 实际到账金额 */
  actual_amount: string;
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
  /** 分红记录ID */
  id: number;
  /** 用户地址 */
  address: string;
  /** 分红金额 (wei单位) */
  amount: string;
  /** 分红类型: hash_power=算力分红, hold=持币分红, swap=Swap分红, ref=推荐奖励 */
  dividend_type: string;
  /** 状态: 0=未领取, 1=已领取 */
  status: number;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

/**
 * 分红页面概览响应
 */
export interface DividendOverviewResponse {
  dividend_count: number;
  dividends: DividendRecord[];
  pending_dividend: string;
}

/**
 * 节点记录 (用于节点列表和算力历史)
 * 与 BuyNodeResponse 结构相同
 */
export type NodeRecord = BuyNodeResponse;

/**
 * 提现历史记录
 */
export interface WithdrawRecord {
  /** 提现记录ID */
  id: number;
  /** 提现用户地址 */
  address: string;
  /** 接收地址 */
  to_address: string;
  /** 提现金额 (wei单位) */
  amount: string;
  /** 手续费 (10%) */
  fee: string;
  /** 实际到账金额 */
  actual_amount: string;
  /** 链上交易哈希 */
  tx_hash: string;
  /** 状态: 0=pending, 1=processing, 2=completed, 3=failed */
  status: number;
  /** 处理时间 */
  processed_at: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}
