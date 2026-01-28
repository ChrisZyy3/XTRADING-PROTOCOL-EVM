"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon, CubeIcon, Square2StackIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useUserProfile } from "~~/hooks/api/useAuth";
import { useMyNodes } from "~~/hooks/api/useNodes";
// Updated import
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export default function WalletPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { t, language } = useGlobalState();
  const queryClient = useQueryClient();
  const wasAuthenticated = useRef(isAuthenticated);
  const { mutate: fetchProfile } = useUserProfile();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [fetchProfile, isAuthenticated]);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["myNodes"] });
      // Clear profile data if needed, but Zustand store handles auth state usually
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, queryClient]);

  const formatNumber = (numStr?: string) => {
    if (!numStr) return "0.00";
    const num = parseFloat(numStr);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const tcBalance = formatNumber(user?.tc_balance);
  const tcmBalance = formatNumber(user?.tcm_balance);
  const totalHashrate = formatNumber(user?.total_hashrate);

  const copyAddress = () => {
    if (user?.void_address) {
      navigator.clipboard.writeText(user.void_address);
      notification.success("Address copied!");
    }
  };

  return (
    <div className="flex flex-col flex-grow w-full bg-[#051113] min-h-screen px-4 py-6">
      <div className="max-w-md mx-auto w-full space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="btn btn-circle btn-ghost btn-sm bg-[#121c1e] text-white hover:bg-[#1a2628]">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{t.wallet.title}</h1>
        </div>

        {/* Profile Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm mb-6">
          <div className="card-body p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#27E903]/20 flex items-center justify-center text-[#27E903]">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 overflow-hidden">
                {/* Username removed as per request */}
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="truncate">{user?.void_address || "No Address"}</span>
                  <button onClick={copyAddress} className="btn btn-ghost btn-xs text-[#27E903] p-0 min-h-0 h-auto">
                    <Square2StackIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TC Balance Card */}
        <div className="card bg-[#09181a] border border-[#4ADE80]/30 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#4ADE80] flex items-center justify-center text-black font-bold text-xl">
                TC
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#4ADE80] font-bold text-xl">{tcBalance}</div>
            </div>
          </div>
        </div>

        {/* TCM Balance Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-xl">
                TCM
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-xl">{tcmBalance}</div>
            </div>
          </div>
        </div>

        {/* Total Hashrate Card (replacing Node) */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#34D399] flex items-center justify-center text-white">
                <CubeIcon className="w-7 h-7" />
              </div>
              <span className="text-gray-400 font-bold">{t.hashpower.stats.myHashrate}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-xl">{totalHashrate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
