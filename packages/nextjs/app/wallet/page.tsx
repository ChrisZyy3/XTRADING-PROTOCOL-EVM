"use client";

import Link from "next/link";
import { ChevronLeftIcon, CubeIcon, Square2StackIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useBalance } from "~~/hooks/api/useAssets";
import { useGlobalState } from "~~/services/store/store";

export default function WalletPage() {
  const { t } = useGlobalState();
  const { data: balanceData, isLoading } = useBalance();

  const usdtBalance = balanceData?.data?.usdt_balance || "0.00";
  const tcmBalance = balanceData?.data?.tcm_balance || "0.00";

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
              <div className="text-white font-bold">{t.wallet.assets.node}</div>
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
              <div className="text-white font-bold text-xl">10</div>
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
