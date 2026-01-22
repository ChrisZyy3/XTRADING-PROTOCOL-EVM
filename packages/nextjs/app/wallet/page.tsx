"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeftIcon, CubeIcon, Square2StackIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useBalance } from "~~/hooks/api/useAssets";
import { useUserProfile } from "~~/hooks/api/useAuth";
import { useNodeList } from "~~/hooks/api/useNode";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export default function WalletPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { t, language } = useGlobalState();
  const queryClient = useQueryClient();
  const wasAuthenticated = useRef(isAuthenticated);
  const { data: balanceData, isLoading } = useBalance();
  const { data: nodeData, isLoading: isNodeLoading } = useNodeList();
  const { mutate: fetchProfile } = useUserProfile();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [fetchProfile, isAuthenticated]);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      queryClient.removeQueries({ queryKey: ["balance"] });
      queryClient.removeQueries({ queryKey: ["node-list"] });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, queryClient]);

  const balance = balanceData?.data?.balance ?? balanceData?.data;
  const usdtBalance = balance?.usdt_balance || "0.00";
  const tcmBalance = balance?.tcm_balance || "0.00";

  // Get the first active node (or handle multiple if design allows, currently assuming single summary)
  const firstNode = nodeData?.data?.[0];

  // Calculate total referral count across all nodes
  const totalRefCount = nodeData?.data?.reduce((acc, curr) => acc + curr.ref_count, 0) || 0;

  // Format node type display
  const displayNodeType = firstNode
    ? language === "zh"
      ? firstNode.node_type === "genesis"
        ? "创世节点"
        : firstNode.node_type === "super"
          ? "超级节点"
          : firstNode.node_type === "city"
            ? "城市节点"
            : firstNode.node_type === "community"
              ? "社区节点"
              : firstNode.node_type
      : firstNode.node_type.charAt(0).toUpperCase() + firstNode.node_type.slice(1) + " Node"
    : t.wallet.assets.node;

  const copyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
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
                <h2 className="text-lg font-bold text-white truncate">{user?.username || "Guest"}</h2>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <span className="truncate">{user?.address || "No Address"}</span>
                  <button onClick={copyAddress} className="btn btn-ghost btn-xs text-[#27E903] p-0 min-h-0 h-auto">
                    <Square2StackIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* USDT Card */}
        <div className="card bg-[#09181a] border border-[#4ADE80]/30 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#4ADE80] flex items-center justify-center text-black font-bold text-xl">
                T
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#4ADE80] font-bold text-xl">
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : usdtBalance}
              </div>
            </div>
          </div>
        </div>

        {/* TC Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-xl">
                TC
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-xl">
                {isLoading ? <span className="loading loading-spinner loading-xs"></span> : tcmBalance}
              </div>
            </div>
          </div>
        </div>

        {/* Genesis Node */}
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

        {/* Team Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
                <UsersIcon className="w-7 h-7" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-xl">
                {isNodeLoading ? <span className="loading loading-spinner loading-xs"></span> : totalRefCount}
              </div>
            </div>
          </div>
        </div>

        {/* Invite Code Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body flex-row items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D97706]/80 flex items-center justify-center text-white">
                <UsersIcon className="w-7 h-7" />
                <div className="absolute ml-4 mt-4 bg-white text-black text-[10px] px-1 rounded-full">+</div>
              </div>
              <div className="text-gray-400 text-sm truncate max-w-[150px] sm:max-w-[200px]">
                123456789101123565186165489561
              </div>
            </div>
            <button className="btn btn-ghost btn-circle btn-sm text-white">
              <Square2StackIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
