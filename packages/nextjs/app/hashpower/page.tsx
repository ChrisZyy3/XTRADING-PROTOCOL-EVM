"use client";

import { CustomLoginButton } from "~~/components/auth/CustomLoginButton";
import {
  useClaimRewards,
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
      <h1 className="text-4xl font-bold mb-8 text-center text-[#39FF14]">Mining Center</h1>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-xl text-gray-500">{t.hashpower.loginPrompt}</div>
          <CustomLoginButton />
        </div>
      ) : (
        <div className="space-y-8">
          <HashrateStats />
          <RewardSection />
        </div>
      )}
    </div>
  );
}

const HashrateStats = () => {
  const { data: userData, isLoading: isUserLoading } = useUserHashrate();
  const { data: totalData } = useTotalHashrate();
  const { data: shareData } = useHashrateShare();

  const userStats = userData?.data;
  const totalHashrate = totalData?.data?.total_hashrate;
  const myShare = shareData?.data?.share; // ratio string or number?

  if (isUserLoading) return <div className="loading loading-spinner text-primary mx-auto block"></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* My Hashrate */}
      <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
        <h2 className="card-title text-gray-400">My Hashrate</h2>
        <div className="text-3xl font-bold text-[#39FF14] font-mono mt-2">{userStats?.current_hashrate || "0"}</div>
        <div className="text-xs text-gray-500 mt-2 space-y-1">
          {/* Breakdown stats are not available in v6 user/hashrate endpoint yet */}
        </div>
      </div>

      {/* Total Hashrate */}
      <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
        <h2 className="card-title text-gray-400">Network Hashrate</h2>
        <div className="text-3xl font-bold text-blue-400 font-mono mt-2">{totalHashrate || "0"}</div>
        <div className="text-sm text-gray-500 mt-2">Powering the future</div>
      </div>

      {/* My Share */}
      <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
        <h2 className="card-title text-gray-400">My Share</h2>
        <div className="text-3xl font-bold text-yellow-500 font-mono mt-2">
          {myShare ? `${(Number(myShare) * 100).toFixed(4)}%` : "0%"}
        </div>
        <div className="text-sm text-gray-500 mt-2">Of total network</div>
      </div>
    </div>
  );
};

const RewardSection = () => {
  const { data: pendingData, refetch: refetchPending } = useMiningPending();
  const { mutate: claim, isPending: isClaiming } = useClaimRewards();

  const pendingAmount = pendingData?.data?.pending_amount || "0";

  const handleClaim = () => {
    claim(undefined, {
      onSuccess: () => refetchPending(),
    });
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Mining Rewards</h2>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/30 p-6 rounded-xl border border-white/5">
        <div>
          <div className="text-gray-400 mb-1">Pending Rewards (TCM)</div>
          <div className="text-4xl font-bold text-[#39FF14] font-mono">{pendingAmount}</div>
        </div>
        <button
          className="btn btn-primary btn-lg bg-[#39FF14] text-black font-bold border-none hover:bg-[#32e612] px-10"
          onClick={handleClaim}
          disabled={isClaiming || Number(pendingAmount) <= 0}
        >
          {isClaiming ? "Claiming..." : "Claim Rewards"}
        </button>
      </div>
    </div>
  );
};
