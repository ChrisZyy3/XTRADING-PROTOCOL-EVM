"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowPathIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useInjectPool, useInjectionStatus, useRequestWithdraw, useWithdrawHistory } from "~~/hooks/api/usePayment";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export default function DepositPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useGlobalState();
  const queryClient = useQueryClient();
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["withdrawHistory"] });
      queryClient.removeQueries({ queryKey: ["injectionStatus"] });
    }
    if (!wasAuthenticated.current && isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ["injectionStatus"] });
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
          {/* Deposit Section now just shows user address */}
          <DepositAddressSection userAddress={user?.void_address || ""} />

          {/* Withdraw Section handles Injection + Withdraw Request */}
          <WithdrawSection />

          <div className="lg:col-span-2">
            <WithdrawHistorySection />
          </div>
        </div>
      )}
    </div>
  );
}

const DepositAddressSection = ({ userAddress }: { userAddress: string }) => {
  const { t } = useGlobalState();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (userAddress) {
      navigator.clipboard.writeText(userAddress);
      setCopied(true);
      notification.success(t.deposit.depositSection.copied);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#39FF14]">{t.deposit.depositSection.title}</h2>
      <p className="mb-4 text-gray-400 text-sm">Transfer TCM to your address to deposit.</p>

      <div className="flex gap-2 items-center bg-black/50 p-3 rounded-lg border border-white/10">
        <div className="flex-1 font-mono text-white break-all text-sm">{userAddress || "Loading..."}</div>
        <button onClick={handleCopy} className="btn btn-ghost btn-sm text-[#39FF14]">
          {copied ? "✓" : <DocumentDuplicateIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const WithdrawSection = () => {
  const { t } = useGlobalState(); // Ensure translations exist for new labels or use defaults
  const { data: injectionData, isLoading: isInjectionLoading, refetch: refetchInjection } = useInjectionStatus();
  const { mutate: injectPool, isPending: isInjecting } = useInjectPool();
  const { mutate: requestWithdraw, isPending: isRequesting } = useRequestWithdraw();

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  // Injection Form State
  const [injectAmount, setInjectAmount] = useState("");

  const status = injectionData?.data;
  // status: { has_injected, required_amount, injected_amount, remaining }

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

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawAddress) {
      notification.error("Please fill all fields");
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

  if (isInjectionLoading)
    return <div className="card bg-base-100 shadow-xl border border-gray-700 p-6 animate-pulse h-64"></div>;

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#39FF14]">{t.deposit.withdrawSection.title}</h2>
        <button onClick={() => refetchInjection()} className="btn btn-ghost btn-xs">
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      {!status?.has_injected ? (
        // Injection Required State
        <div className="space-y-4">
          <div className="alert alert-warning">
            <span>You must inject 20% to the base pool before withdrawing.</span>
          </div>
          <div className="stats shadow bg-black/30 w-full">
            <div className="stat place-items-center">
              <div className="stat-title">Remaining to Inject</div>
              <div className="stat-value text-warning text-lg font-mono">{status?.remaining || "0"}</div>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Injection Amount</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={injectAmount}
              onChange={e => setInjectAmount(e.target.value)}
              placeholder={status?.remaining}
            />
          </div>

          <button
            className="btn btn-warning w-full font-bold"
            onClick={handleInject}
            disabled={isInjecting || !injectAmount}
          >
            {isInjecting ? "Injecting..." : "Inject to Pool"}
          </button>
        </div>
      ) : (
        // Withdraw Form State
        <div className="space-y-4">
          <div className="alert alert-success bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20 py-2">
            <span>✓ Base Pool Injected</span>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">To Address</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full font-mono"
              value={withdrawAddress}
              onChange={e => setWithdrawAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full font-mono"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <button
            className="btn btn-primary w-full bg-[#39FF14] border-none text-black font-bold hover:bg-[#32e612]"
            onClick={handleWithdraw}
            disabled={isRequesting}
          >
            {isRequesting ? "Submitting..." : "Request Withdraw"}
          </button>
        </div>
      )}
    </div>
  );
};

const WithdrawHistorySection = () => {
  const { t } = useGlobalState();
  const { data: historyData } = useWithdrawHistory();
  const withdrawals = historyData?.data?.withdrawals || [];

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-[#39FF14]">{t.deposit.history.title}</h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500">
                  No history
                </td>
              </tr>
            ) : (
              withdrawals.map((item: any) => (
                <tr key={item.request_id}>
                  <td>{item.request_id}</td>
                  <td>{new Date(item.created_at * 1000).toLocaleString()}</td>
                  <td className="font-mono">{item.amount}</td>
                  <td className="font-mono text-xs">{item.destination_address}</td>
                  <td>
                    <span className={`badge ${item.status === "completed" ? "badge-success" : "badge-warning"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
