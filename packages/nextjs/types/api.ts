/**
 * 通用 API 响应接口
 * @template T 数据类型
 */
export interface ApiResponse<T = any> {
  /** 状态码，0 表示成功 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
}

/**
 * 分页响应数据接口
 */
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

//Path: packages/nextjs/types/api.ts
/**
 * 认证响应
 */
export interface AuthResponse {
  token: string;
  address: string;
  session_id: string;
  expires_at: number;
}

/**
 * 用户个人信息
 */
export interface UserProfile {
  id: number;
  void_account: string;
  void_address: string;
  tcm_balance: string;
  tc_balance: string;
  total_hashrate: string;
  status: string;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  account: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  account: string;
  password: string;
  refer?: string;
}

// --- 转账模块 ---

export interface TransferRequest {
  to_address: string;
  amount: string;
}

export interface TransferResponse {
  tx_id: string;
  from_address: string;
  to_address: string;
  amount: string;
  burned_amount: string;
  to_amount: string;
  mining_pool_amount: string;
  from_hashrate: string;
  to_hashrate: string;
}

export interface TransferRecord {
  tx_id: string;
  from_address: string;
  to_address: string;
  amount: string;
  created_at: number;
}

// --- 节点模块 ---

export interface NodeTier {
  id: number;
  tier_name: string; // genesis, super, api...
  display_name: string;
  tier_requirement: string; // Price in TCM or USD? V6 doc says "tier_requirement" but description says "持币要求"? Check doc. It says "tier_requirement" and "usd_amount" is gone? v6 doc: tier_requirement
  // doc v6 says: tier_requirement: string, total_slots, available_slots, tc_bonus, tcm_bonus, flow_reward_rate, fee_reward_rate
  total_slots: number;
  available_slots: number;
  tc_bonus: string;
  tcm_bonus: string;
  flow_reward_rate: string;
  fee_reward_rate: string;
}

export interface NodeAvailableResponse {
  tiers: NodeTier[];
}

export interface BuyNodeRequest {
  tier_name: string;
}

export interface BuyNodeResponse {
  node_holding_id: number;
  node_tier_id: number;
  tc_bonus: string;
  tcm_bonus: string;
}

export interface MyNode {
  id: number;
  node_tier_id: number;
  tier_name: string;
  shares_count: number;
  status: string;
  purchased_at: number;
}

export interface MyNodesResponse {
  nodes: MyNode[];
}

export interface ClaimNodeBonusRequest {
  node_holding_id: number;
}

export interface ClaimNodeBonusResponse {
  tc_bonus: string;
  tcm_bonus: string;
  claimed_at: number;
}

export interface NodeRewardsResponse {
  total_rewards: string;
  pending: string;
  claimed: string;
}

// --- 挖矿与算力 ---

export interface UserHashrateResponse {
  address: string;
  current_hashrate: string;
  total_hashrate: string;
  transfer_count: number;
  last_update_time: number;
}

export interface TotalHashrateResponse {
  total_hashrate: string;
}

export interface HashrateShareResponse {
  address: string;
  share: number;
  share_percentage: string;
}

export interface DailyRewardResponse {
  address: string;
  user_hashrate: string;
  total_hashrate: string;
  user_share: number;
  daily_pool: string;
  estimated_reward: string;
}

export interface MiningPendingResponse {
  pending_amount: string;
  record_count: number;
}

export interface MiningClaimResponse {
  claimed_amount: string;
  records_claimed: number;
  new_tcm_balance: string;
}

// --- 提现 ---

export interface InjectionStatusResponse {
  has_injected: boolean;
  required_amount: string;
  injected_amount: string;
  remaining: string;
}

export interface InjectPoolRequest {
  amount: string;
}

export interface InjectPoolResponse {
  injection_id: number;
  amount: string;
  status: string;
}

export interface WithdrawRequest {
  amount: string;
  destination_address: string;
}

export interface WithdrawResponse {
  request_id: number;
  amount: string;
  destination_address: string;
  status: string;
  created_at: number;
}

export interface WithdrawStatusResponse {
  request_id: string; // doc example string "2001", type uint64? use string/number
  status: string;
  amount: string;
  destination_address: string;
  created_at: number;
  processed_at: number | null;
}

export interface WithdrawHistoryRecord {
  request_id: number;
  amount: string;
  status: string;
  created_at: number;
  processed_at: number;
}

export interface WithdrawHistoryResponse {
  total: number;
  page: number;
  limit: number;
  withdrawals: WithdrawHistoryRecord[];
}

// --- 推荐系统 ---

export interface ReferralCodeResponse {
  referral_code: string;
  void_address: string;
  void_account: string;
}

export interface ReferralUser {
  user_id: number;
  void_address: string;
  void_account: string;
  created_at: number;
}

export interface MyReferralsResponse {
  total: number;
  referrals: ReferralUser[];
}

export interface ReferralChainNode {
  user_id: number;
  void_address: string;
  void_account: string;
}

export interface MyChainResponse {
  chain_length: number;
  chain: ReferralChainNode[];
}

export interface BindReferralRequest {
  referral_code?: string;
  referrer_address?: string;
}

export interface BindReferralResponse {
  referrer_id: number;
  referee_id: number;
}
