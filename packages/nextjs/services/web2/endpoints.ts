import { apiClient } from "~~/services/api/client";
import {
  ApiResponse,
  AuthResponse,
  BindReferralRequest,
  BindReferralResponse,
  BuyNodeRequest,
  BuyNodeResponse,
  ClaimNodeBonusRequest,
  ClaimNodeBonusResponse,
  DailyRewardResponse,
  HashrateShareResponse,
  InjectPoolRequest,
  InjectPoolResponse,
  InjectionStatusResponse,
  MiningClaimResponse,
  MiningPendingResponse,
  MyChainResponse,
  MyNodesResponse,
  MyReferralsResponse,
  NodeAvailableResponse,
  NodeRewardsResponse,
  PaginationResponse,
  ReferralCodeResponse,
  TotalHashrateResponse,
  TransferRecord,
  TransferRequest,
  TransferResponse,
  UserHashrateResponse,
  UserProfile,
  WalletLoginRequest,
  WithdrawHistoryResponse,
  WithdrawRequest,
  WithdrawResponse,
  WithdrawStatusResponse,
} from "~~/types/api";

/**
 * 认证相关 API 接口封装
 */
export const authEndpoints = {
  // 钱包签名登录
  walletLogin: async (data: WalletLoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post("/auth/wallet-login", data);
  },
  logout: async (): Promise<ApiResponse<void>> => {
    return apiClient.post("/auth/logout");
  },
  // 获取用户资料
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    return apiClient.get("/user/profile");
  },
  updateSession: async (): Promise<ApiResponse<{ session_id: string; expires_at: number }>> => {
    return apiClient.post("/user/session");
  },
};

/**
 * 资产与转账 API
 */
export const assetEndpoints = {
  // 链下转账
  transfer: async (data: TransferRequest): Promise<ApiResponse<TransferResponse>> => {
    return apiClient.post("/transfer", data);
  },
  // 转账历史
  getTransferHistory: async (page = 1, limit = 20): Promise<ApiResponse<PaginationResponse<TransferRecord>>> => {
    return apiClient.get("/transfer/history", { params: { page, limit } });
  },
};

/**
 * 节点 API (V6 Presale)
 */
export const nodeEndpoints = {
  // 获取可购买节点列表
  getAvailableNodes: async (): Promise<ApiResponse<NodeAvailableResponse>> => {
    return apiClient.get("/node/available");
  },
  // 购买节点
  purchaseNode: async (data: BuyNodeRequest): Promise<ApiResponse<BuyNodeResponse>> => {
    return apiClient.post("/node/purchase", data);
  },
  // 获取我的节点
  getMyNodes: async (): Promise<ApiResponse<MyNodesResponse>> => {
    return apiClient.get("/node/my-nodes");
  },
  // 领取节点私募奖励
  claimBonus: async (data: ClaimNodeBonusRequest): Promise<ApiResponse<ClaimNodeBonusResponse>> => {
    return apiClient.post("/node/claim-bonus", data);
  },
  // 获取节点收益
  getRewards: async (): Promise<ApiResponse<NodeRewardsResponse>> => {
    return apiClient.get("/node/rewards");
  },
};

/**
 * 挖矿与算力 API
 */
export const miningEndpoints = {
  // 用户算力
  getUserHashrate: async (): Promise<ApiResponse<UserHashrateResponse>> => {
    return apiClient.get("/hashrate/user");
  },
  // 总算力
  getTotalHashrate: async (): Promise<ApiResponse<TotalHashrateResponse>> => {
    return apiClient.get("/hashrate/total");
  },
  // 算力占比
  getHashrateShare: async (): Promise<ApiResponse<HashrateShareResponse>> => {
    return apiClient.get("/hashrate/share");
  },
  // 每日收益估算
  getDailyReward: async (daily_pool?: string): Promise<ApiResponse<DailyRewardResponse>> => {
    return apiClient.get("/mining/daily-reward", { params: { daily_pool } });
  },
  // 待领取奖励
  getPendingRewards: async (): Promise<ApiResponse<MiningPendingResponse>> => {
    return apiClient.get("/mining/pending");
  },
  // 领取奖励
  claimRewards: async (): Promise<ApiResponse<MiningClaimResponse>> => {
    return apiClient.post("/mining/claim");
  },
};

/**
 * 提现 API (V6 Injection)
 */
export const withdrawEndpoints = {
  // 检查注入状态
  getInjectionStatus: async (): Promise<ApiResponse<InjectionStatusResponse>> => {
    return apiClient.get("/withdraw/injection-status");
  },
  // 注入底池
  injectPool: async (data: InjectPoolRequest): Promise<ApiResponse<InjectPoolResponse>> => {
    return apiClient.post("/withdraw/inject", data);
  },
  // 发起提币请求
  requestWithdraw: async (data: WithdrawRequest): Promise<ApiResponse<WithdrawResponse>> => {
    return apiClient.post("/withdraw/request", data);
  },
  // 获取提币状态
  getWithdrawStatus: async (request_id: string): Promise<ApiResponse<WithdrawStatusResponse>> => {
    return apiClient.get(`/withdraw/status/${request_id}`);
  },
  // 提币历史
  getHistory: async (page = 1, limit = 20): Promise<ApiResponse<WithdrawHistoryResponse>> => {
    return apiClient.get("/withdraw/history", { params: { page, limit } });
  },
};

/**
 * 推荐系统 API (V7 Referral)
 */
export const referralEndpoints = {
  // 获取我的推荐码
  getMyCode: async (): Promise<ApiResponse<ReferralCodeResponse>> => {
    return apiClient.get("/referral/my-code");
  },
  // 获取我的直接推荐
  getMyReferrals: async (): Promise<ApiResponse<MyReferralsResponse>> => {
    return apiClient.get("/referral/my-referrals");
  },
  // 获取我的推荐链
  getMyChain: async (): Promise<ApiResponse<MyChainResponse>> => {
    return apiClient.get("/referral/my-chain");
  },
  // 绑定推荐关系
  bindReferral: async (data: BindReferralRequest): Promise<ApiResponse<BindReferralResponse>> => {
    return apiClient.post("/referral/bind", data);
  },
};
