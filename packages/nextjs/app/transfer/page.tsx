"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ClockIcon, PaperAirplaneIcon, WalletIcon } from "@heroicons/react/24/outline";
import { useBalance, useTransfer, useTransferHistory } from "~~/hooks/api/useAssets";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export default function TransferPage() {
  const { t } = useGlobalState();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance();
  const { mutate: transfer, isPending: isTransferPending } = useTransfer();
  const { data: historyData, isLoading: isHistoryLoading } = useTransferHistory(1, 10);

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  const tcmBalance = balanceData?.data?.tcm_balance || "0.00";
  const usdtBalance = balanceData?.data?.usdt_balance || "0.00";

  const handleTransfer = () => {
    if (!toAddress || !amount) {
      notification.error("Please fill in all fields");
      return;
    }
    // Assuming Transfer API handles amount as string directly
    transfer({ to_address: toAddress, amount });
  };

  return (
    <div className="flex flex-col flex-grow w-full bg-[#051113] min-h-screen px-4 py-6 font-sans text-white">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="btn btn-circle btn-ghost btn-sm bg-[#121c1e] text-white hover:bg-[#1a2628] border border-white/5"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Transfer Assets
          </h1>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* USDT Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-[#09181a] border border-white/5 p-6 transition-all hover:border-[#39FF14]/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <WalletIcon className="w-24 h-24 text-[#39FF14]" />
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">USDT Balance</span>
              <span className="text-3xl font-bold font-mono text-white">
                {isBalanceLoading ? <span className="loading loading-dots loading-md"></span> : usdtBalance}
              </span>
              <span className="text-xs text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded w-fit mt-1">Available</span>
            </div>
          </div>

          {/* TCM Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-[#09181a] border border-white/5 p-6 transition-all hover:border-[#F97316]/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <WalletIcon className="w-24 h-24 text-[#F97316]" />
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">TCM Balance</span>
              <span className="text-3xl font-bold font-mono text-white">
                {isBalanceLoading ? <span className="loading loading-dots loading-md"></span> : tcmBalance}
              </span>
              <span className="text-xs text-[#F97316] bg-[#F97316]/10 px-2 py-1 rounded w-fit mt-1">Available</span>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="rounded-3xl bg-[#0b1619] border border-white/5 p-8 shadow-xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#39FF14]/10 text-[#39FF14]">
              <PaperAirplaneIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">New Transfer</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Recipient Address</label>
              <input
                type="text"
                placeholder="0x..."
                className="input input-lg w-full bg-[#051113] border-[#1a2628] focus:border-[#39FF14] text-white placeholder-gray-600 rounded-xl transition-colors"
                value={toAddress}
                onChange={e => setToAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Amount</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.00"
                  className="input input-lg w-full bg-[#051113] border-[#1a2628] focus:border-[#39FF14] text-white placeholder-gray-600 rounded-xl transition-colors pr-20 font-mono"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <button
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-[#39FF14]/10 text-[#39FF14] text-sm font-bold hover:bg-[#39FF14]/20 transition-colors"
                  onClick={() => setAmount(tcmBalance)}
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-500 ml-1">Transfer Fee: 20% (Burned)</p>
            </div>

            <button
              className="btn btn-lg w-full bg-[#39FF14] hover:bg-[#32e612] text-black border-none rounded-xl font-bold shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all mt-4"
              onClick={handleTransfer}
              disabled={isTransferPending}
            >
              {isTransferPending ? <span className="loading loading-spinner"></span> : "Confirm Transfer"}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="rounded-3xl bg-[#0b1619] border border-white/5 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ClockIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Recent History</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="table w-full">
              <thead className="bg-[#051113] text-gray-400">
                <tr>
                  <th className="bg-transparent border-b border-white/5">Time</th>
                  <th className="bg-transparent border-b border-white/5">To</th>
                  <th className="bg-transparent border-b border-white/5 text-right">Amount</th>
                  <th className="bg-transparent border-b border-white/5 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {isHistoryLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Loading history...
                    </td>
                  </tr>
                ) : historyData?.data?.list?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No transfers found
                    </td>
                  </tr>
                ) : (
                  historyData?.data?.list?.map((record: any) => (
                    <tr
                      key={record.id}
                      className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                    >
                      <td className="text-gray-400 text-xs">{new Date(record.created_at).toLocaleString()}</td>
                      <td className="font-mono text-sm text-gray-300">
                        {record.to_address.slice(0, 6)}...{record.to_address.slice(-4)}
                      </td>
                      <td className="text-right font-mono font-bold text-white">{record.amount}</td>
                      <td className="text-center">
                        <span
                          className={`badge badge-sm ${record.status === 1 ? "badge-success bg-[#39FF14]/20 text-[#39FF14] border-none" : "badge-error bg-red-500/20 text-red-400 border-none"}`}
                        >
                          {record.status === 1 ? "Success" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
