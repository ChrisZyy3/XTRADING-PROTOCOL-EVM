"use client";

import { format } from "date-fns";
import { CustomLoginButton } from "~~/components/auth/CustomLoginButton";
import { useMyNodes } from "~~/hooks/api/useNodes";
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
          <div className="text-center text-xl text-gray-400">Please log in to view your nodes.</div>
          <CustomLoginButton />
        </div>
      ) : (
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
                <div
                  key={node.id}
                  className="rounded-2xl bg-[#0b1210] border border-[#203731] overflow-hidden hover:border-[#39FF14] transition-all duration-300 shadow-lg group"
                >
                  {/* Header */}
                  <div className="bg-[#142620] px-6 py-4 border-b border-[#203731] flex justify-between items-center group-hover:bg-[#39FF14]/10 transition-colors">
                    <span className="text-[#39FF14] font-bold tracking-wider uppercase">{node.tier_name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        node.status === "active" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Node ID</span>
                      <span className="text-white font-mono font-bold">#{node.id}</span>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Purchase Time</span>
                      <span className="text-gray-300 text-sm">
                        {node.purchased_at ? format(new Date(node.purchased_at * 1000), "yyyy-MM-dd HH:mm") : "Unknown"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Shares</span>
                      <span className="text-white">{node.shares_count || 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
