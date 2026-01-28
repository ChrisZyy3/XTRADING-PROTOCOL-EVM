"use client";

import { CustomLoginButton } from "~~/components/auth/CustomLoginButton";
import {
  useClaimRewards,
  useDailyReward,
  useHashrateShare,
  useMiningPending,
  useTotalHashrate,
  useUserHashrate,
} from "~~/hooks/api/useMining";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";

export default function MiningPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useGlobalState();

  return (
    <div className="container mx-auto p-10 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#39FF14]">{t.hashpower.title}</h1>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-xl text-gray-500">{t.hashpower.loginPrompt}</div>
          <CustomLoginButton />
        </div>
      ) : (
        <div className="space-y-8">
          <HashrateStats />
          <DailyRewardSection />
          <RewardSection />
        </div>
      )}
    </div>
  );
}

const formatNumber = (numStr?: string | number) => {
  if (!numStr) return "0.00";
  const num = Number(numStr);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const HashrateStats = () => {
  const { data: userData, isLoading: isUserLoading } = useUserHashrate();
  const { data: totalData } = useTotalHashrate();
  const { data: shareData } = useHashrateShare();
  const { t } = useGlobalState();

  const userStats = userData?.data;
  const totalHashrate = totalData?.data?.total_hashrate;
  const myShare = shareData?.data?.share;

  if (isUserLoading) return <div className="loading loading-spinner text-primary mx-auto block"></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* My Hashrate */}
      <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
        <h2 className="card-title text-gray-400">{t.hashpower.stats.myHashrate}</h2>
        <div className="text-3xl font-bold text-[#39FF14] font-mono mt-2">
          {formatNumber(userStats?.current_hashrate)}
        </div>
      </div>

      {/* Transfer Count */}
      <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
        <h2 className="card-title text-gray-400">{t.hashpower.stats.transferCount}</h2>
        <div className="text-3xl font-bold text-purple-400 font-mono mt-2">{userStats?.transfer_count || "0"}</div>
        <div className="text-sm text-gray-500 mt-2">{t.hashpower.stats.transferSubtitle}</div>
      </div>

      {/* Total Hashrate */}
      <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
        <h2 className="card-title text-gray-400">{t.hashpower.stats.networkHashrate}</h2>
        <div className="text-3xl font-bold text-blue-400 font-mono mt-2">{formatNumber(totalHashrate)}</div>
        <div className="text-sm text-gray-500 mt-2">{t.hashpower.stats.networkSubtitle}</div>
      </div>

      {/* My Share */}
      <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
        <h2 className="card-title text-gray-400">{t.hashpower.stats.myShare}</h2>
        <div className="text-3xl font-bold text-yellow-500 font-mono mt-2">
          {myShare ? `${(Number(myShare) * 100).toFixed(4)}%` : "0%"}
        </div>
        <div className="text-sm text-gray-500 mt-2">{t.hashpower.stats.shareSubtitle}</div>
      </div>
    </div>
  );
};

const DailyRewardSection = () => {
  const { data: dailyData } = useDailyReward();
  const { t } = useGlobalState();
  const reward = dailyData?.data;

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">{t.hashpower.daily.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Pool */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="text-gray-400 mb-1">{t.hashpower.daily.pool}</div>
          <div className="text-3xl font-bold text-blue-400 font-mono">{formatNumber(reward?.daily_pool)}</div>
        </div>
        {/* Estimated */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="text-gray-400 mb-1">{t.hashpower.daily.estimated}</div>
          <div className="text-3xl font-bold text-[#39FF14] font-mono">{formatNumber(reward?.estimated_reward)}</div>
        </div>
      </div>
    </div>
  );
};

const RewardSection = () => {
  const { data: pendingData, refetch: refetchPending } = useMiningPending();
  const { mutate: claim, isPending: isClaiming } = useClaimRewards();
  const { t } = useGlobalState();

  const pendingAmount = pendingData?.data?.pending_amount || "0";

  const handleClaim = () => {
    claim(undefined, {
      onSuccess: () => refetchPending(),
    });
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">{t.hashpower.rewards.title}</h2>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl border border-white/5">
        <div>
          <div className="text-gray-400 mb-1">{t.hashpower.rewards.pending}</div>
          <div className="text-4xl font-bold text-[#39FF14] font-mono">{formatNumber(pendingAmount)}</div>
        </div>
        <button
          className="btn btn-primary btn-lg bg-[#39FF14] text-black font-bold border-none hover:bg-[#32e612] disabled:bg-gray-600 disabled:text-white/50 px-10"
          onClick={handleClaim}
          disabled={isClaiming || Number(pendingAmount) <= 0}
        >
          {isClaiming ? t.hashpower.rewards.claiming : t.hashpower.rewards.claim}
        </button>
      </div>
    </div>
  );
};
