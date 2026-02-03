"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  useWithdrawHistory,
  useWithdrawInject,
  useWithdrawInjectionStatus,
  useWithdrawRequest,
} from "~~/hooks/api/useWithdraw";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export default function WithdrawPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useGlobalState();
  const queryClient = useQueryClient();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["withdrawHistory"] });
      queryClient.removeQueries({ queryKey: ["withdrawInjectionStatus"] });
    }
    if (!wasAuthenticated.current && isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ["withdrawInjectionStatus"] });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, queryClient]);

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-fade-in-up">
      <h1 className="text-3xl md:text-5xl font-bold mb-12 text-center text-[#39FF14] uppercase font-display text-glow">
        {t.withdraw.title}
      </h1>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-6 mt-20">
          <div className="text-center text-xl text-gray-400 font-display">{t.withdraw.loginPrompt}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Injection Status & Actions */}
          <InjectionSection balance={user?.tcm_balance} />

          {/* Withdraw Form */}
          <WithdrawFormSection balance={user?.tcm_balance} />

          {/* Withdrawal History */}
          <div className="md:col-span-2">
            <WithdrawHistorySection />
          </div>
        </div>
      )}
    </div>
  );
}

const InjectionSection = ({ balance }: { balance?: string }) => {
  const { t } = useGlobalState();
  const {
    data: injectionData,
    isLoading: isInjectionLoading,
    refetch: refetchInjection,
  } = useWithdrawInjectionStatus();
  const { mutate: injectPool, isPending: isInjecting } = useWithdrawInject();

  const [injectAmount, setInjectAmount] = useState("");
  const status = injectionData?.data;

  // status structure: { has_injected, required_amount, injected_amount, remaining }

  const formatNumber = (numStr?: string) => {
    if (!numStr) return "0.00";
    const num = parseFloat(numStr);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const handleInject = () => {
    if (!injectAmount) return;
    injectPool(
      { amount: injectAmount },
      {
        onSuccess: () => {
          setInjectAmount("");
          refetchInjection();
        },
      },
    );
  };

  if (isInjectionLoading)
    return (
      <div className="card bg-[#0b1210] border border-[#203731] p-6 h-64 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="card card-premium p-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-display mb-2">{t.withdraw.injection.title}</h2>
        <button onClick={() => refetchInjection()} className="btn btn-ghost btn-xs text-gray-400 hover:text-white">
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      <p className="text-gray-400 text-sm mb-6">{t.withdraw.injection.desc}</p>

      {!status?.has_injected ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <div className="text-xs text-gray-500">{t.withdraw.injection.injected}</div>
              <div className="text-lg font-mono text-white">{formatNumber(status?.injected_amount)}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <div className="text-xs text-gray-500">{t.withdraw.injection.remaining}</div>
              <div className="text-lg font-mono text-yellow-500">{formatNumber(status?.remaining)}</div>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-400">{t.withdraw.injection.required}</span>
              <span className="label-text-alt text-gray-500">
                {t.withdraw.form.balance} <span className="text-white">{formatNumber(balance)}</span>
              </span>
            </label>
            <div className="join w-full">
              <input
                type="text"
                className="input input-bordered join-item w-full bg-black/50 border-[#203731] text-white focus:border-[#39FF14]"
                value={injectAmount}
                onChange={e => setInjectAmount(e.target.value)}
                placeholder={formatNumber(status?.remaining)}
              />
              <button
                className="btn join-item bg-[#203731] border-[#203731] text-white hover:bg-[#2a453d]"
                onClick={() => setInjectAmount(status?.remaining || "")}
              >
                Max
              </button>
            </div>
          </div>

          <button
            className="btn btn-warning w-full font-bold mt-2"
            onClick={handleInject}
            disabled={isInjecting || !injectAmount}
          >
            {isInjecting ? <span className="loading loading-spinner loading-xs"></span> : t.withdraw.injection.button}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center border-2 border-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-500">{t.withdraw.injection.success}</h3>
          <p className="text-gray-400 text-sm">You can now request withdrawals.</p>
        </div>
      )}
    </div>
  );
};

const WithdrawFormSection = ({ balance }: { balance?: string }) => {
  const { t } = useGlobalState();
  const { mutate: requestWithdraw, isPending: isRequesting } = useWithdrawRequest();
  const { data: injectionData } = useWithdrawInjectionStatus();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  const hasInjected = injectionData?.data?.has_injected;

  const formatNumber = (numStr?: string) => {
    if (!numStr) return "0.00";
    const num = parseFloat(numStr);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawAddress) {
      notification.error("Please fill all fields");
      return;
    }
    if (!hasInjected) {
      notification.error("You must complete the liquidity injection first.");
      return;
    }

    requestWithdraw(
      { amount: withdrawAmount, destination_address: withdrawAddress },
      {
        onSuccess: () => {
          setWithdrawAmount("");
          setWithdrawAddress("");
        },
      },
    );
  };

  return (
    <div className="card card-premium p-8 h-full">
      <h2 className="text-2xl font-bold text-[#39FF14] mb-6 font-display text-glow">{t.withdraw.form.title}</h2>

      <div className="space-y-4">
        {/* Destination Address */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-gray-400">{t.withdraw.form.address}</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full bg-black/50 border-[#203731] text-white focus:border-[#39FF14] font-mono placeholder:text-gray-700"
            value={withdrawAddress}
            onChange={e => setWithdrawAddress(e.target.value)}
            placeholder="0x..."
            disabled={!hasInjected}
          />
        </div>

        {/* Amount */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-gray-400">{t.withdraw.form.amount}</span>
            <span className="label-text-alt text-gray-500">
              {t.withdraw.form.balance} <span className="text-white">{formatNumber(balance)}</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              className="input input-bordered w-full bg-black/50 border-[#203731] text-white focus:border-[#39FF14] font-mono pr-16"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              disabled={!hasInjected}
            />
            <span className="absolute right-4 top-3 text-gray-500 text-sm font-bold">TCM</span>
          </div>
        </div>

        <button
          className={`btn w-full font-bold mt-4 border-none text-black ${
            hasInjected ? "bg-[#39FF14] hover:bg-[#32e612]" : "btn-disabled bg-gray-800 text-gray-500"
          }`}
          onClick={handleWithdraw}
          disabled={isRequesting || !hasInjected}
        >
          {isRequesting ? <span className="loading loading-spinner loading-xs"></span> : t.withdraw.form.button}
        </button>
        {!hasInjected && (
          <p className="text-center text-xs text-yellow-600 mt-2">{t.withdraw.form.injectionRequired}</p>
        )}
      </div>
    </div>
  );
};

const WithdrawHistorySection = () => {
  const { t } = useGlobalState();
  const { data: historyData, isLoading } = useWithdrawHistory();

  const formatNumber = (numStr?: string) => {
    if (!numStr) return "0.00";
    const num = parseFloat(numStr);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };
  const withdrawals = historyData?.data?.withdrawals || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "approved":
        return "badge-info";
      case "completed":
        return "badge-success";
      case "rejected":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const statusMap = (status: string) => {
    // @ts-ignore
    return t.withdraw.status?.[status] || status;
  };

  return (
    <div className="card card-premium p-8">
      <h2 className="text-2xl font-bold text-white mb-6 font-display">{t.withdraw.history.title}</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="text-gray-400 border-b border-[#203731]">
                <th className="bg-transparent">{t.withdraw.history.id}</th>
                <th className="bg-transparent">{t.withdraw.history.date}</th>
                <th className="bg-transparent">{t.withdraw.history.amount}</th>
                <th className="bg-transparent">{t.withdraw.history.address}</th>
                <th className="bg-transparent text-right">{t.withdraw.history.status}</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8 bg-transparent">
                    {t.withdraw.history.noData}
                  </td>
                </tr>
              ) : (
                withdrawals.map((item: any) => (
                  <tr key={item.request_id} className="hover:bg-white/5 border-b border-[#203731]">
                    <td className="bg-transparent text-white font-mono">#{item.request_id}</td>
                    <td className="bg-transparent text-gray-300 text-sm">
                      {new Date(item.created_at * 1000).toLocaleString()}
                    </td>
                    <td className="bg-transparent text-[#39FF14] font-mono font-bold">
                      {formatNumber(item.amount)} TCM
                    </td>
                    <td
                      className="bg-transparent text-gray-400 font-mono text-xs max-w-[150px] truncate"
                      title={item.destination_address}
                    >
                      {item.destination_address}
                    </td>
                    <td className="bg-transparent text-right">
                      <div className={`badge ${getStatusColor(item.status)} gap-2`}>{statusMap(item.status)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
