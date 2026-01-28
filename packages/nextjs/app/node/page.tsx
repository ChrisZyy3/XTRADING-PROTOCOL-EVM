"use client";

import { format } from "date-fns";
import { CustomLoginButton } from "~~/components/auth/CustomLoginButton";
import { useClaimBonus, useMyNodes, useNodeRewards } from "~~/hooks/api/useNodes";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";

export default function MyNodesPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useGlobalState();

  const { data: nodesData, isLoading } = useMyNodes();
  const nodes = nodesData?.data?.nodes || [];

  return (
    <div className="container mx-auto p-4 md:p-10 max-w-7xl animate-fade-in-up">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#39FF14] uppercase">{t.nav.node}</h1>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-6 mt-20">
          <div className="text-center text-xl text-gray-400">{t.node.loginPrompt}</div>
          <CustomLoginButton />
        </div>
      ) : (
        <div className="w-full space-y-8">
          <NodeRewardsStats />

          <div className="w-full">
            {isLoading ? (
              <div className="flex justify-center mt-20">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : nodes.length === 0 ? (
              <div className="text-center text-gray-500 mt-20 p-10 border border-gray-800 rounded-2xl bg-black/20">
                <p className="text-xl">No nodes found.</p>
                <p className="mt-2 text-sm">Go to the presale page to purchase nodes!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map((node: any) => (
                  <NodeCard key={node.id} node={node} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const NodeRewardsStats = () => {
  const { data: rewardsData, isLoading } = useNodeRewards();
  const { t } = useGlobalState();
  const rewards = rewardsData?.data;

  if (isLoading) return <div className="loading loading-spinner text-primary mx-auto block"></div>;

  const formatNumber = (numStr?: string) => {
    if (!numStr) return "0.00";
    const num = parseFloat(numStr);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4">{t.node.rewards.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Rewards */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="text-gray-400 mb-1">{t.node.rewards.total}</div>
          <div className="text-3xl font-bold text-[#39FF14] font-mono">{formatNumber(rewards?.total_rewards)}</div>
        </div>
        {/* Pending Rewards */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="text-gray-400 mb-1">{t.node.rewards.pending}</div>
          <div className="text-3xl font-bold text-yellow-500 font-mono">{formatNumber(rewards?.pending)}</div>
        </div>
        {/* Claimed Rewards */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="text-gray-400 mb-1">{t.node.rewards.claimed}</div>
          <div className="text-3xl font-bold text-blue-400 font-mono">{formatNumber(rewards?.claimed)}</div>
        </div>
      </div>
    </div>
  );
};

const NodeCard = ({ node }: { node: any }) => {
  const { t } = useGlobalState();
  const { mutate: claimBonus, isPending: isClaiming } = useClaimBonus();

  const handleClaimBonus = () => {
    claimBonus({ node_holding_id: node.id });
  };

  // Resolve tier name from ID
  const tierName = t.node.tiers[node.node_tier_id as keyof typeof t.node.tiers] || `Tier ${node.node_tier_id}`;

  return (
    <div className="rounded-2xl bg-[#0b1210] border border-[#203731] overflow-hidden hover:border-[#39FF14] transition-all duration-300 shadow-lg group flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#142620] px-6 py-4 border-b border-[#203731] flex justify-between items-center group-hover:bg-[#39FF14]/10 transition-colors">
        <span className="text-[#39FF14] font-bold tracking-wider uppercase">{tierName}</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            node.status === "active" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"
          }`}
        >
          {node.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">{t.node.list.id}</span>
          <span className="text-white font-mono font-bold">#{node.id}</span>
        </div>

        <div className="w-full h-px bg-white/5" />

        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">{t.node.list.purchaseTime}</span>
          <span className="text-gray-300 text-sm">
            {node.purchased_at ? format(new Date(node.purchased_at * 1000), "yyyy-MM-dd HH:mm") : "Unknown"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Shares</span>
          <span className="text-white">{node.shares_count || 1}</span>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 pt-0 mt-auto">
        <button
          onClick={handleClaimBonus}
          disabled={isClaiming}
          className="btn btn-sm w-full bg-[#39FF14]/20 text-[#39FF14] hover:bg-[#39FF14] hover:text-black border-none"
        >
          {isClaiming ? "Claiming..." : t.node.list.claimBonus}
        </button>
      </div>
    </div>
  );
};
