"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDepositAddress, useWithdraw, useWithdrawHistory } from "~~/hooks/api/usePayment";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export default function DepositPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useGlobalState();
  const queryClient = useQueryClient();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["withdrawHistory"] });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, queryClient]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#39FF14]">{t.deposit.title}</h1>

      {!isAuthenticated ? (
        <div className="text-center text-xl text-gray-500">{t.deposit.loginPrompt}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DepositSection />
          <WithdrawSection />
          <div className="lg:col-span-2">
            <WithdrawHistorySection />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 充值区域组件 - Deposit Section
 * 显示充值地址和复制功能
 */
const DepositSection = () => {
  const { t } = useGlobalState();
  const { mutate: getAddress, data: addressData, isPending } = useDepositAddress();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (addressData?.data?.address) {
      navigator.clipboard.writeText(addressData.data.address);
      setCopied(true);
      notification.success(t.deposit.depositSection.copied);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#39FF14]">{t.deposit.depositSection.title}</h2>

      {!addressData ? (
        <button
          className="btn w-full bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none font-bold"
          onClick={() => getAddress()}
          disabled={isPending}
        >
          {isPending ? "..." : t.deposit.depositSection.getAddress}
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text text-white/80">{t.deposit.depositSection.yourAddress}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressData.data.address}
                readOnly
                className="input input-bordered flex-1 bg-black/50 border-white/10 text-white font-mono text-sm"
              />
              <button
                className="btn btn-square bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none"
                onClick={handleCopyAddress}
              >
                {copied ? "✓" : "📋"}
              </button>
            </div>
          </div>

          {addressData.data.memo && (
            <div className="alert alert-warning bg-yellow-500/10 border-yellow-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <div className="font-bold">{t.deposit.depositSection.memo}</div>
                <div className="text-sm">{addressData.data.memo}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 提现区域组件 - Withdraw Section
 * 提现表单,包含地址、金额输入和手续费计算
 */
const WithdrawSection = () => {
  const { t } = useGlobalState();
  const { mutate: withdraw, isPending } = useWithdraw();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  // 计算手续费和实际到账金额 (Calculate fee and actual amount)
  const calculateFee = (amt: string) => {
    try {
      const amountBigInt = BigInt(amt || "0");
      const fee = (amountBigInt * BigInt(10)) / BigInt(100); // 10%
      const actual = amountBigInt - fee;
      return {
        fee: fee.toString(),
        actual: actual.toString(),
      };
    } catch {
      return { fee: "0", actual: "0" };
    }
  };

  const { fee, actual } = calculateFee(amount);

  const handleSubmit = () => {
    if (!toAddress) {
      notification.error(t.deposit.withdrawSection.pleaseEnterAddress);
      return;
    }
    if (!amount || amount === "0") {
      notification.error(t.deposit.withdrawSection.pleaseEnterAmount);
      return;
    }

    withdraw(
      { to_address: toAddress, amount },
      {
        onSuccess: () => {
          setToAddress("");
          setAmount("");
        },
      },
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#39FF14]">{t.deposit.withdrawSection.title}</h2>

      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white/80">{t.deposit.withdrawSection.toAddress}</span>
          </label>
          <input
            type="text"
            placeholder="0x..."
            className="input input-bordered bg-black/50 border-white/10 focus:border-[#39FF14] text-white"
            value={toAddress}
            onChange={e => setToAddress(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-white/80">{t.deposit.withdrawSection.amount}</span>
          </label>
          <input
            type="text"
            placeholder="1000000000000000000"
            className="input input-bordered bg-black/50 border-white/10 focus:border-[#39FF14] text-white font-mono"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        {amount && amount !== "0" && (
          <div className="bg-black/30 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">{t.deposit.withdrawSection.fee}</span>
              <span className="text-white font-mono">{fee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">{t.deposit.withdrawSection.actualAmount}</span>
              <span className="text-[#39FF14] font-mono font-bold">{actual}</span>
            </div>
          </div>
        )}

        <button
          className="btn w-full bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none font-bold"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? t.deposit.withdrawSection.submitting : t.deposit.withdrawSection.submit}
        </button>
      </div>
    </div>
  );
};

/**
 * 提现历史组件 - Withdraw History Section
 * 显示提现记录表格
 */
const WithdrawHistorySection = () => {
  const { t } = useGlobalState();
  const { data: historyData } = useWithdrawHistory();

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { text: t.deposit.history.statusPending, class: "badge-warning" },
      1: { text: t.deposit.history.statusProcessing, class: "badge-info" },
      2: { text: t.deposit.history.statusCompleted, class: "badge-success" },
      3: { text: t.deposit.history.statusFailed, class: "badge-error" },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0];
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const history = historyData?.data || [];

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#39FF14]">{t.deposit.history.title}</h2>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>{t.deposit.history.id}</th>
              <th>{t.deposit.history.to}</th>
              <th>{t.deposit.history.amount}</th>
              <th>{t.deposit.history.fee}</th>
              <th>{t.deposit.history.actual}</th>
              <th>{t.deposit.history.txHash}</th>
              <th>{t.deposit.history.status}</th>
              <th>{t.deposit.history.time}</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-500">
                  {t.deposit.history.noData}
                </td>
              </tr>
            ) : (
              history.map((record: any) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td className="font-mono text-xs">{record.to_address.slice(0, 10)}...</td>
                  <td className="font-mono text-xs">{record.amount}</td>
                  <td className="font-mono text-xs">{record.fee}</td>
                  <td className="font-mono text-xs">{record.actual_amount}</td>
                  <td className="font-mono text-xs">
                    <a
                      href={`https://etherscan.io/tx/${record.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      {record.tx_hash.slice(0, 10)}...
                    </a>
                  </td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td className="text-xs">{new Date(record.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
