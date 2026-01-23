"use client";

import { CustomLoginButton } from "~~/components/auth/CustomLoginButton";
import { useHashpower, useHashpowerHistory } from "~~/hooks/api/useNodes";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";

export default function HashpowerPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useGlobalState();

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#39FF14]">{t.hashpower.title}</h1>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-xl text-gray-500">{t.hashpower.loginPrompt}</div>
          <CustomLoginButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          <HashpowerStats />
          <HashpowerHistory />
        </div>
      )}
    </div>
  );
}

const HashpowerStats = () => {
  const { t } = useGlobalState();
  const { data: hashpowerData, isLoading } = useHashpower();

  const stats = hashpowerData?.data;

  // 如果加载中显示骨架屏或Loading
  if (isLoading) {
    return <div className="loading loading-spinner loading-lg text-primary mx-auto block"></div>;
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-6 text-accent">{t.hashpower.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hashpower */}
        <div className="stat bg-black/30 rounded-lg border border-accent/20">
          <div className="stat-title text-gray-400">{t.hashpower.stats.total}</div>
          <div className="stat-value text-accent text-3xl font-mono">{stats?.total_hash_power || "0"}</div>
        </div>

        {/* Effective Hashpower */}
        <div className="stat bg-black/30 rounded-lg border border-success/20">
          <div className="stat-title text-gray-400">{t.hashpower.stats.effective}</div>
          <div className="stat-value text-success text-3xl font-mono">{stats?.effective_hash_power || "0"}</div>
        </div>

        {/* Node Hashpower */}
        <div className="stat bg-black/30 rounded-lg border border-info/20">
          <div className="stat-title text-gray-400">{t.hashpower.stats.node}</div>
          <div className="stat-value text-info text-3xl font-mono">{stats?.node_hash_power || "0"}</div>
        </div>

        {/* Hold Hashpower */}
        <div className="stat bg-black/30 rounded-lg border border-warning/20">
          <div className="stat-title text-gray-400">{t.hashpower.stats.hold}</div>
          <div className="stat-value text-warning text-3xl font-mono">{stats?.hold_hash_power || "0"}</div>
        </div>
      </div>
    </div>
  );
};

const HashpowerHistory = () => {
  const { t } = useGlobalState();
  // 分页获取历史记录，默认第一页
  const { data: historyData, isLoading } = useHashpowerHistory(1, 20);

  const historyList = historyData?.data?.list || [];

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-4 text-secondary">{t.hashpower.history.title}</h2>

      {isLoading ? (
        <div className="loading loading-spinner loading-md text-secondary mx-auto block my-10"></div>
      ) : historyList.length === 0 ? (
        <div className="text-center text-gray-500 py-10">{t.hashpower.history.noData}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200 text-white">
                <th>{t.hashpower.history.id}</th>
                <th>{t.hashpower.history.type}</th>
                <th>{t.hashpower.history.amount} (USD)</th>
                <th>{t.hashpower.history.status}</th>
                <th>{t.hashpower.history.time}</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((record: any) => (
                <tr key={record.id} className="hover:bg-base-200/50">
                  <td className="font-mono text-gray-400">#{record.id}</td>
                  <td>
                    <span className="badge badge-outline badge-accent uppercase font-bold text-xs">
                      {record.node_type}
                    </span>
                  </td>
                  <td className="font-bold text-white">${record.usd_amount}</td>
                  <td>
                    <div
                      className={`badge ${record.status === 1 ? "badge-success gap-2" : "badge-error gap-2"} badge-sm`}
                    >
                      {record.status === 1 ? "Active" : "Expired"}
                    </div>
                  </td>
                  <td className="text-gray-400 text-sm">{new Date(record.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
