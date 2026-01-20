import { apiClient } from "~~/services/api/client";
import {
  ApiResponse,
  AuthResponse,
  BalanceResponse,
  BuyNodeRequest,
  BuyNodeResponse,
  DepositAddressResponse,
  DividendOverviewResponse,
  DividendRecord,
  HashpowerResponse,
  LoginRequest,
  NodeRecord,
  NodeType,
  PaginationResponse,
  RegisterRequest,
  TransferRecord,
  TransferRequest,
  TransferResponse,
  WithdrawRecord,
  WithdrawRequest,
  WithdrawResponse,
} from "~~/types/api";

/**
 * 认证相关 API 接口封装
 */
export const authEndpoints = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post("/login", data);
  },
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post("/register", data);
  },
  // 获取用户资料
  getProfile: async (): Promise<ApiResponse<AuthResponse["user"]>> => {
    return apiClient.get("/user/profile");
  },
};

/**
 * 资产相关 API
 */
export const assetEndpoints = {
  // 获取余额
  getBalance: async (): Promise<ApiResponse<BalanceResponse>> => {
    return apiClient.get("/balance");
  },
  // 链下转账
  transfer: async (data: TransferRequest): Promise<ApiResponse<TransferResponse>> => {
    return apiClient.post("/transfer", data);
  },
  // 转账历史
  getTransferHistory: async (page = 1, pageSize = 10): Promise<ApiResponse<PaginationResponse<TransferRecord>>> => {
    return apiClient.get("/transfer/history", { params: { page, pageSize } });
  },
};

/**
 * 节点与算力 API
 */
export const nodeEndpoints = {
  // 获取节点类型
  getNodeTypes: async (): Promise<ApiResponse<NodeType[]>> => {
    return apiClient.get("/node/types");
  },
  // 购买节点
  buyNode: async (data: BuyNodeRequest): Promise<ApiResponse<BuyNodeResponse>> => {
    return apiClient.post("/node/buy", data);
  },
  // 获取我的节点列表
  getNodeList: async (): Promise<ApiResponse<NodeRecord[]>> => {
    return apiClient.get("/node/list");
  },
  // 获取算力
  getHashpower: async (): Promise<ApiResponse<HashpowerResponse>> => {
    return apiClient.get("/hashpower");
  },
  // 算力历史 (节点购买历史)
  getHashpowerHistory: async (page = 1, pageSize = 10): Promise<ApiResponse<PaginationResponse<NodeRecord>>> => {
    return apiClient.get("/hashpower/history", { params: { page, pageSize } });
  },
};

/**
 * 充值与提现 API
 */
export const paymentEndpoints = {
  // 获取充值地址 (POST 方法)
  getDepositAddress: async (): Promise<ApiResponse<DepositAddressResponse>> => {
    return apiClient.post("/deposit/address");
  },
  // 申请提现
  applyWithdraw: async (data: WithdrawRequest): Promise<ApiResponse<WithdrawResponse>> => {
    return apiClient.post("/withdraw/apply", data);
  },
  // 提现历史
  getWithdrawHistory: async (): Promise<ApiResponse<WithdrawRecord[]>> => {
    return apiClient.get("/withdraw/history");
  },
};

/**
 * 分红模块 API
 */
export const dividendEndpoints = {
  // 查询分红概览
  getDividend: async (): Promise<ApiResponse<DividendOverviewResponse>> => {
    return apiClient.get("/dividend");
  },
  // 分红历史
  getDividendHistory: async (page = 1, pageSize = 10): Promise<ApiResponse<PaginationResponse<DividendRecord>>> => {
    return apiClient.get("/dividend/history", { params: { page, pageSize } });
  },
};
