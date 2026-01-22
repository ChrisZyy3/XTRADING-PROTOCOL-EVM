"use client";

import Link from "next/link";
import { ChevronLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useDividend, useDividendHistory } from "~~/hooks/api/useDividends";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";

export default function DividendPage() {
  const { t } = useGlobalState();
  const { isAuthenticated } = useAuthStore();
  const { data: dividendData, isLoading: isDividendLoading } = useDividend(isAuthenticated);
  const { data: historyData, isLoading: isHistoryLoading } = useDividendHistory(1, 10, isAuthenticated);

  const dividendCount = dividendData?.data?.dividend_count ?? 0;
  const pendingDividend = dividendData?.data?.pending_dividend ?? "0";
  const history = historyData?.data?.list ?? [];

  return (
    <div className="flex flex-col flex-grow w-full bg-[#051113] min-h-screen px-4 py-6 font-sans text-white">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="btn btn-circle btn-ghost btn-sm bg-[#121c1e] text-white hover:bg-[#1a2628] border border-white/5"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t.dividend.title}
          </h1>
        </div>

        {!isAuthenticated ? (
          <div className="text-center text-xl text-gray-500">{t.dividend.loginPrompt}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative overflow-hidden rounded-2xl bg-[#09181a] border border-white/5 p-6">
                <div className="relative z-10 flex flex-col gap-2">
                  <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">
                    {t.dividend.overview.count}
                  </span>
                  <span className="text-3xl font-bold font-mono text-white">
                    {isDividendLoading ? <span className="loading loading-dots loading-md"></span> : dividendCount}
                  </span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-[#09181a] border border-white/5 p-6">
                <div className="relative z-10 flex flex-col gap-2">
                  <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">
                    {t.dividend.overview.pending}
                  </span>
                  <span className="text-3xl font-bold font-mono text-white">
                    {isDividendLoading ? <span className="loading loading-dots loading-md"></span> : pendingDividend}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0b1619] border border-white/5 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">{t.dividend.history.title}</h2>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="table w-full">
                  <thead className="bg-[#051113] text-gray-400">
                    <tr>
                      <th className="bg-transparent border-b border-white/5">{t.dividend.history.id}</th>
                      <th className="bg-transparent border-b border-white/5">{t.dividend.history.type}</th>
                      <th className="bg-transparent border-b border-white/5 text-right">{t.dividend.history.amount}</th>
                      <th className="bg-transparent border-b border-white/5 text-center">
                        {t.dividend.history.status}
                      </th>
                      <th className="bg-transparent border-b border-white/5">{t.dividend.history.time}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isHistoryLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          {t.dividend.loading}
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          {t.dividend.history.noData}
                        </td>
                      </tr>
                    ) : (
                      history.map((record: any) => (
                        <tr
                          key={record.id}
                          className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                        >
                          <td className="text-gray-400 text-xs">{record.id}</td>
                          <td className="text-gray-300 text-sm">{record.dividend_type}</td>
                          <td className="text-right font-mono font-bold text-white">{record.amount}</td>
                          <td className="text-center">
                            <span
                              className={`badge badge-sm ${
                                record.status === 1
                                  ? "badge-success bg-[#39FF14]/20 text-[#39FF14] border-none"
                                  : "badge-warning bg-yellow-500/20 text-yellow-400 border-none"
                              }`}
                            >
                              {record.status === 1
                                ? t.dividend.history.statusCompleted
                                : t.dividend.history.statusPending}
                            </span>
                          </td>
                          <td className="text-gray-400 text-xs">{new Date(record.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
