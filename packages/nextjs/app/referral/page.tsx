"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, LinkIcon, QrCodeIcon, Square2StackIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useBindReferral, useMyReferralCode, useMyReferrals } from "~~/hooks/api/useReferral";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export default function ReferralPage() {
  const { t } = useGlobalState();
  const { isAuthenticated } = useAuthStore();
  const [bindInput, setBindInput] = useState("");

  const { data: myCodeData, isLoading: isLoadingCode } = useMyReferralCode();
  const { data: myReferralsData, isLoading: isLoadingReferrals } = useMyReferrals();
  const { mutate: bindReferral, isPending: isBinding } = useBindReferral();
  const hasBindInput = bindInput.trim().length > 0;
  const bindButtonClass = hasBindInput
    ? "bg-[#27E903] text-black hover:bg-[#20bd02] border-[#27E903]"
    : "bg-[#2A2F3A] text-[#8E95A3] hover:bg-[#2A2F3A] border-[#2A2F3A]";

  const handleBind = () => {
    const value = bindInput.trim();
    if (!value) return;
    bindReferral({ referral_code: value });
  };

  const copyToClipboard = (text: string) => {
    // 降级方案：使用传统方法兼容 HTTP 环境
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      notification.success("Copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
      notification.error("Failed to copy");
    }
    document.body.removeChild(textArea);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col flex-grow w-full bg-[#051113] min-h-screen px-4 py-6 items-center justify-center">
        <div className="text-white text-lg">{t.node.loginPrompt}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow w-full bg-[#051113] min-h-screen px-4 py-6">
      <div className="max-w-md mx-auto w-full space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="btn btn-circle btn-ghost btn-sm bg-[#121c1e] text-white hover:bg-[#1a2628]">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{t.referral.title}</h1>
        </div>

        {/* My Code Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body p-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5 text-[#27E903]" />
              {t.referral.myCode}
            </h2>

            {isLoadingCode ? (
              <div className="animate-pulse h-10 bg-white/5 rounded"></div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <div className="bg-black/30 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                  <span className="text-xl font-mono text-[#27E903]">
                    {myCodeData?.referral_code
                      ? myCodeData.referral_code.length > 10
                        ? `${myCodeData.referral_code.slice(0, 4)}...${myCodeData.referral_code.slice(-4)}`
                        : myCodeData.referral_code
                      : "-"}
                  </span>
                  <button
                    onClick={() => myCodeData?.referral_code && copyToClipboard(myCodeData.referral_code)}
                    className="btn btn-ghost btn-xs text-[#27E903] p-0 min-h-0 h-auto"
                  >
                    <Square2StackIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bind Referral Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body p-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#27E903]" />
              {t.referral.bindTitle}
            </h2>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder={t.referral.bindPlaceholder}
                className="input input-bordered w-full bg-black/30 border-white/10 text-white focus:border-[#27E903]"
                value={bindInput}
                onChange={e => setBindInput(e.target.value)}
              />
              <button
                className={`btn border-none transition-all duration-200 disabled:opacity-100 disabled:cursor-not-allowed ${bindButtonClass}`}
                onClick={handleBind}
                disabled={isBinding || !hasBindInput}
              >
                {isBinding ? <span className="loading loading-spinner loading-xs"></span> : t.referral.bindButton}
              </button>
            </div>
          </div>
        </div>

        {/* My Referrals Card */}
        <div className="card bg-[#09181a] border border-white/10 shadow-sm">
          <div className="card-body p-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-[#27E903]" />
              {t.referral.myReferrals}
            </h2>

            <div className="stats shadow bg-black/30 border border-white/5 mt-2 w-full">
              <div className="stat place-items-center py-2">
                <div className="stat-title text-gray-400 text-xs">{t.referral.totalReferrals}</div>
                <div className="stat-value text-[#27E903] text-2xl">{myReferralsData?.total || 0}</div>
              </div>
            </div>

            <div className="mt-4">
              {isLoadingReferrals ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner text-[#27E903]"></span>
                </div>
              ) : myReferralsData?.referrals && myReferralsData.referrals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/10">
                        <th>User ID</th>
                        <th>Address</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myReferralsData.referrals.map(user => (
                        <tr key={user.user_id} className="border-b border-white/5">
                          <td className="text-white">{user.user_id}</td>
                          <td className="text-gray-300 font-mono">
                            {user.void_address.substring(0, 6)}...
                            {user.void_address.substring(user.void_address.length - 4)}
                          </td>
                          <td className="text-gray-400">{new Date(user.created_at * 1000).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">{t.referral.noReferrals}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
