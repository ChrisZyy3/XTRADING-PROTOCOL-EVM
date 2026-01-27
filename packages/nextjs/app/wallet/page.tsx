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
  // Remove useBalance, use UserProfile from authStore
  const { data: nodeData, isLoading: isNodeLoading } = useMyNodes();
  const { mutate: fetchProfile } = useUserProfile();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [fetchProfile, isAuthenticated]);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      // queryClient.removeQueries({ queryKey: ["balance"] }); // no longer needed
      queryClient.removeQueries({ queryKey: ["myNodes"] });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, queryClient]);

  const usdtBalance = "0.00"; // v6 API has no USDT balance? It has tc_balance and tcm_balance? v6 doc: tcp_balance, tc_balance.
  // v6 Profile: tcm_balance, tc_balance.
  // Let's assume TC is the main currency replacing USDT or just display TC.
  // The UI had USDT and TC. V6 has TCM (Token) and TC (Coin?).
  // Let's map USDT card to TC balance? And TC card to TCM?
  // Doc: tc_balance (TC代币), tcm_balance (TCM代币).
  // WalletPage has USDT and TC. I will swap USDT -> TC, and TC -> TCM to align with profile.
  const tcBalance = user?.tc_balance || "0.00";
  const tcmBalance = user?.tcm_balance || "0.00";

  // Node Data: MyNode[]
  const firstNode = nodeData?.data?.nodes?.[0]; // MyNodesResponse { nodes: MyNode[] }

  const totalRefCount = 0; // v6 MyNode doesn't explicitly return ref_count in MyNode type?
  // MyNode: { id, node_tier_id, tier_name, shares_count, status, purchased_at }
  // Ref count not in list. Omit for now or hardcode 0.

  const displayNodeType = firstNode
    ? language === "zh"
      ? firstNode.tier_name === "genesis" // tier_name
        ? "创世节点"
        : firstNode.tier_name === "super"
          ? "超级节点"
          : firstNode.tier_name === "city"
            ? "城市节点"
            : firstNode.tier_name === "community"
              ? "社区节点"
              : firstNode.tier_name
      : firstNode.tier_name.charAt(0).toUpperCase() + firstNode.tier_name.slice(1) + " Node"
    : t.wallet.assets.node;

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
                <h2 className="text-lg font-bold text-white truncate">{user?.void_account || "Guest"}</h2>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <span className="truncate">{user?.void_address || "No Address"}</span>
                  <button onClick={copyAddress} className="btn btn-ghost btn-xs text-[#27E903] p-0 min-h-0 h-auto">
                    <Square2StackIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TC Balance Card (replacing USDT) */}
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

        {/* Node Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#34D399] flex items-center justify-center text-white">
                <CubeIcon className="w-7 h-7" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                {isNodeLoading ? <span className="loading loading-spinner loading-xs"></span> : displayNodeType}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
