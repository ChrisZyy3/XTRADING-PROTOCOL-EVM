"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";

export default function TeamPage() {
  const { t } = useGlobalState();

  const teamData = [
    { algebra: "1", members: "0", amount: "0.00" },
    { algebra: "2", members: "0", amount: "0.00" },
    { algebra: "3", members: "0", amount: "0.00" },
    { algebra: "4", members: "0", amount: "0.00" },
    { algebra: "5", members: "0", amount: "0.00" },
  ];

  return (
    <div className="flex flex-col flex-grow w-full bg-[#051113] min-h-screen px-4 py-6">
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link href="/" className="btn btn-circle btn-ghost btn-sm bg-[#121c1e] text-white hover:bg-[#1a2628]">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{t.team.title}</h1>
        </div>

        {/* Stats Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm overflow-hidden">
          <div className="divide-y divide-white/10">
            {/* My Team */}
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">{t.team.stats.myTeam}</span>
              <span className="text-[#4ADE80] font-bold text-xl">0.00</span>
            </div>

            {/* Global Nodes */}
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">{t.team.stats.globalNodes}</span>
              <span className="bg-[#2D1A1A] text-[#F87171] text-xs px-2 py-0.5 rounded border border-[#451e1e]">
                {t.team.stats.no}
              </span>
            </div>

            {/* My Direct Push */}
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">{t.team.stats.directPush}</span>
              <span className="text-[#4ADE80] font-bold text-xl">0.00</span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 p-4 bg-[#112224] border-b border-white/10">
            <div className="text-gray-400 text-sm text-center">{t.team.table.algebra}</div>
            <div className="text-gray-400 text-sm text-center">{t.team.table.members}</div>
            <div className="text-gray-400 text-sm text-center">{t.team.table.amount}</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/10">
            {teamData.map((row, index) => (
              <div key={index} className="grid grid-cols-3 p-4">
                <div className="text-white text-center font-medium">{row.algebra}</div>
                <div className="text-white text-center font-medium">{row.members}</div>
                <div className="text-white text-center font-medium">{row.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* No Data Footer */}
        <div className="text-center text-[#1c3336] text-xs mt-8">{t.team.noData}</div>
      </div>
    </div>
  );
}
