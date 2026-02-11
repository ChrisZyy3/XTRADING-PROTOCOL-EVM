"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits, isAddress } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useWithdrawHistory } from "~~/hooks/api/useWithdraw";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { withdrawEndpoints } from "~~/services/web2/endpoints";
import { WithdrawSignedResponse } from "~~/types/api";
import { notification } from "~~/utils/scaffold-eth";

const WITHDRAW_SIGNED_ABI = [
  {
    type: "function",
    name: "withdrawSigned",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "orderId", type: "string" },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getVaultBalance",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const formatTimestamp = (value: number | string | null | undefined, locale: string) => {
  if (value === null || value === undefined) return "-";
  const ts = Number(value);
  if (!Number.isFinite(ts) || ts <= 0) return "-";
  const millis = ts > 1_000_000_000_000 ? ts : ts * 1000;
  return new Date(millis).toLocaleString(locale);
};

const formatDecimalAmount = (value: string | undefined, locale: string) => {
  if (!value) return "0";
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return num.toLocaleString(locale, { maximumFractionDigits: 6 });
};

const formatWeiAmount = (value: string | undefined, locale: string) => {
  if (!value) return "0";
  try {
    const parsed = Number(formatUnits(BigInt(value), 18));
    if (!Number.isFinite(parsed)) return "0";
    return parsed.toLocaleString(locale, { maximumFractionDigits: 6 });
  } catch {
    return "0";
  }
};

const parseDecimalInput = (value: string) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

export default function WithdrawPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { t, language } = useGlobalState();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const { data: deployedContractData } = useDeployedContractInfo("TCMTokenWithVault");
  const contractAddress = deployedContractData?.address;

  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: (contractAddress || ZERO_ADDRESS) as `0x${string}`,
    abi: WITHDRAW_SIGNED_ABI,
    functionName: "getVaultBalance",
    args: [(address || ZERO_ADDRESS) as `0x${string}`],
    query: {
      enabled: Boolean(contractAddress && address),
    },
  });

  const { data: walletTokenBalance, refetch: refetchWalletTokenBalance } = useReadContract({
    address: (contractAddress || ZERO_ADDRESS) as `0x${string}`,
    abi: WITHDRAW_SIGNED_ABI,
    functionName: "balanceOf",
    args: [(address || ZERO_ADDRESS) as `0x${string}`],
    query: {
      enabled: Boolean(contractAddress && address),
    },
  });

  const { data: withdrawFeeBps } = useReadContract({
    address: (contractAddress || ZERO_ADDRESS) as `0x${string}`,
    abi: WITHDRAW_SIGNED_ABI,
    functionName: "withdrawFeeBps",
    query: {
      enabled: Boolean(contractAddress),
    },
  });

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryRefreshing,
    refetch: refetchHistory,
  } = useWithdrawHistory(1, 20);

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestOrder, setLatestOrder] = useState<WithdrawSignedResponse | null>(null);
  const [latestTxHash, setLatestTxHash] = useState<string>("");

  const locale = language === "zh" ? "zh-CN" : "en-US";
  const ui = useMemo(
    () =>
      language === "zh"
        ? {
            subtitle: "先获取后端签名，再调用链上 withdrawSigned 完成提现。",
            connectWallet: "请先连接钱包后再发起链上提现。",
            amountPlaceholder: "输入提现数量（TCM）",
            expectedFee: "预计手续费",
            expectedNet: "预计到账",
            contractVault: "合约 Vault 余额",
            currentAddress: "当前钱包",
            submit: "发起签名提现",
            submitting: "处理中...",
            latest: "最近一次签名订单",
            orderId: "订单 ID",
            deadline: "过期时间",
            txHash: "交易哈希",
            refresh: "刷新",
            status: "状态",
            date: "时间",
            id: "ID",
            emptyHistory: "暂无提现记录",
            connectWalletError: "请先连接钱包",
            authError: "请先登录",
            invalidAmount: "请输入正确的提现金额",
            rpcUnavailable: "RPC 客户端未就绪，请稍后重试",
            contractAddressMissing: "未找到可用的合约地址",
            badSignatureData: "签名数据格式错误",
            success: "提现交易已确认",
            failed: "提现失败，请检查参数后重试",
            unknown: "未知",
            failedStatus: "失败",
          }
        : {
            subtitle: "Request backend signature first, then call on-chain withdrawSigned.",
            connectWallet: "Please connect your wallet before submitting on-chain withdrawal.",
            amountPlaceholder: "Enter withdrawal amount (TCM)",
            expectedFee: "Estimated Fee",
            expectedNet: "Estimated Received",
            contractVault: "Contract Vault Balance",
            currentAddress: "Wallet Address",
            submit: "Submit Signed Withdraw",
            submitting: "Processing...",
            latest: "Latest Signed Request",
            orderId: "Order ID",
            deadline: "Deadline",
            txHash: "Transaction Hash",
            refresh: "Refresh",
            status: "Status",
            date: "Date",
            id: "ID",
            emptyHistory: "No withdrawal history",
            connectWalletError: "Please connect wallet first",
            authError: "Please login first",
            invalidAmount: "Please enter a valid amount",
            rpcUnavailable: "RPC client not ready, please retry later",
            contractAddressMissing: "No available contract address",
            badSignatureData: "Invalid signature payload",
            success: "Withdrawal transaction confirmed",
            failed: "Withdrawal failed, please try again",
            unknown: "Unknown",
            failedStatus: "Failed",
          },
    [language],
  );

  const withdrawFeePercent = Number(withdrawFeeBps ?? 2000n) / 100;
  const parsedAmount = parseDecimalInput(amount);
  const previewFee = parsedAmount ? (parsedAmount * withdrawFeePercent) / 100 : 0;
  const previewNet = parsedAmount ? parsedAmount - previewFee : 0;

  const historyRecords = historyData?.data?.withdrawals || [];
  const statusMap = t.withdraw.status as Record<string, string>;

  const refreshAll = async () => {
    await Promise.all([
      refetchHistory(),
      queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      refetchVaultBalance(),
      refetchWalletTokenBalance(),
    ]);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      notification.error(ui.authError);
      return;
    }

    if (!address || !isAddress(address)) {
      notification.error(ui.connectWalletError);
      return;
    }

    if (!parseDecimalInput(amount)) {
      notification.error(ui.invalidAmount);
      return;
    }

    if (!publicClient) {
      notification.error(ui.rpcUnavailable);
      return;
    }

    setIsSubmitting(true);
    try {
      const signResponse = await withdrawEndpoints.requestSignedWithdraw({ amount: amount.trim() });
      const signData = signResponse.data;

      if (!signData?.order_id || !signData?.amount || !signData?.signature || !signData?.deadline) {
        throw new Error(ui.badSignatureData);
      }

      const targetContractAddress = isAddress(signData.contract_address)
        ? (signData.contract_address as `0x${string}`)
        : (contractAddress as `0x${string}` | undefined);

      if (!targetContractAddress) {
        throw new Error(ui.contractAddressMissing);
      }

      const txHash = await writeContractAsync({
        address: targetContractAddress,
        abi: WITHDRAW_SIGNED_ABI,
        functionName: "withdrawSigned",
        args: [
          address,
          BigInt(signData.amount),
          signData.order_id,
          BigInt(String(signData.deadline)),
          signData.signature as `0x${string}`,
        ],
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });

      setLatestOrder(signData);
      setLatestTxHash(txHash);
      setAmount("");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["withdrawHistory"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
        refetchVaultBalance(),
      ]);

      notification.success(ui.success);
    } catch (error: any) {
      notification.error(error?.message || ui.failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-6 animate-fade-in-up">
      <h1 className="text-3xl md:text-5xl font-bold mb-3 text-center text-[#39FF14] uppercase font-display text-glow">
        {t.withdraw.nav}
      </h1>
      <p className="text-center text-gray-400 mb-10">{ui.subtitle}</p>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-6 mt-20">
          <div className="text-center text-xl text-gray-400 font-display">{t.withdraw.loginPrompt}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="card card-premium p-7 lg:col-span-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-[#39FF14] font-display">{t.withdraw.form.title}</h2>
              <button
                onClick={refreshAll}
                className="btn btn-ghost btn-xs text-gray-400 hover:text-white"
                title={ui.refresh}
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-gray-500 mb-1">{ui.currentAddress}</div>
                <div className="text-xs text-white font-mono break-all">{address || ui.connectWallet}</div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-gray-500 mb-1">{t.withdraw.form.balance}</div>
                <div className="text-lg text-white font-mono">
                  {walletTokenBalance !== undefined
                    ? formatDecimalAmount(formatUnits(walletTokenBalance, 18), locale)
                    : formatDecimalAmount(user?.tcm_balance, locale)}{" "}
                  TCM
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-white/10">
                <div className="text-xs text-gray-500 mb-1">{ui.contractVault}</div>
                <div className="text-lg text-cyan-300 font-mono">
                  {vaultBalance !== undefined ? formatDecimalAmount(formatUnits(vaultBalance, 18), locale) : "..."} TCM
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">{t.withdraw.form.amount}</span>
                  <button
                    className="label-text-alt text-[#39FF14] cursor-pointer"
                    type="button"
                    onClick={() => setAmount(vaultBalance !== undefined ? formatUnits(vaultBalance, 18) : "")}
                  >
                    Max
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full bg-black/50 border-[#203731] text-white focus:border-[#39FF14] pr-16 font-mono"
                    value={amount}
                    onChange={event => setAmount(event.target.value)}
                    placeholder={ui.amountPlaceholder}
                    disabled={!address || isSubmitting || isWriting}
                  />
                  <span className="absolute right-3 top-3 text-xs text-gray-400">TCM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="text-gray-500 mb-1">{ui.expectedFee}</div>
                  <div className="font-mono text-yellow-400">
                    {previewFee.toLocaleString(locale, { maximumFractionDigits: 6 })} TCM
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="text-gray-500 mb-1">{ui.expectedNet}</div>
                  <div className="font-mono text-green-400">
                    {previewNet.toLocaleString(locale, { maximumFractionDigits: 6 })} TCM
                  </div>
                </div>
              </div>

              <button
                className="btn w-full font-bold border-none text-black bg-[#39FF14] hover:bg-[#32e612]"
                onClick={handleSubmit}
                disabled={!address || isSubmitting || isWriting}
              >
                {isSubmitting || isWriting ? <span className="loading loading-spinner loading-xs"></span> : ui.submit}
                {isSubmitting || isWriting ? ` ${ui.submitting}` : ""}
              </button>
            </div>
          </div>

          <div className="card card-premium p-7 lg:col-span-2">
            <h2 className="text-2xl font-bold text-white font-display mb-5">{ui.latest}</h2>
            {latestOrder ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-gray-500 mb-1">{ui.orderId}</div>
                  <div className="text-sm text-white font-mono break-all">{latestOrder.order_id}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-gray-500 mb-1">{ui.deadline}</div>
                  <div className="text-sm text-white font-mono">{formatTimestamp(latestOrder.deadline, locale)}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-gray-500 mb-1">{ui.expectedFee}</div>
                  <div className="text-sm text-yellow-400 font-mono">
                    {formatWeiAmount(latestOrder.fee_amount, locale)} TCM
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-gray-500 mb-1">{ui.expectedNet}</div>
                  <div className="text-sm text-green-400 font-mono">
                    {formatWeiAmount(latestOrder.net_amount, locale)} TCM
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 md:col-span-2">
                  <div className="text-xs text-gray-500 mb-1">{ui.txHash}</div>
                  <div className="text-sm text-cyan-300 font-mono break-all">{latestTxHash || "-"}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">{ui.unknown}</div>
            )}
          </div>

          <div className="card card-premium p-7 lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white font-display">{t.withdraw.history.title}</h2>
              <button onClick={() => refetchHistory()} className="btn btn-ghost btn-xs text-gray-400 hover:text-white">
                {isHistoryRefreshing ? <span className="loading loading-spinner loading-xs"></span> : ui.refresh}
              </button>
            </div>

            {isHistoryLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="text-gray-400 border-b border-[#203731]">
                      <th className="bg-transparent">{ui.id}</th>
                      <th className="bg-transparent">{ui.date}</th>
                      <th className="bg-transparent">{t.withdraw.history.amount}</th>
                      <th className="bg-transparent">{ui.status}</th>
                      <th className="bg-transparent">{ui.txHash}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-500 py-8 bg-transparent">
                          {ui.emptyHistory}
                        </td>
                      </tr>
                    ) : (
                      historyRecords.map(record => {
                        const id = record.id ?? record.request_id ?? "-";
                        const statusText =
                          statusMap[record.status] || (record.status === "failed" ? ui.failedStatus : record.status);
                        return (
                          <tr key={`${id}-${record.created_at}`} className="hover:bg-white/5 border-b border-[#203731]">
                            <td className="bg-transparent text-white font-mono">#{id}</td>
                            <td className="bg-transparent text-gray-300 text-sm">
                              {formatTimestamp(record.created_at, locale)}
                            </td>
                            <td className="bg-transparent text-[#39FF14] font-mono">
                              {formatDecimalAmount(record.amount, locale)} TCM
                            </td>
                            <td className="bg-transparent text-white">{statusText}</td>
                            <td className="bg-transparent text-cyan-300 font-mono text-xs max-w-[220px] truncate">
                              {record.tx_hash || "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
