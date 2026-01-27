"use client";

import { useState } from "react";
import { LoginModal } from "~~/components/auth/LoginModal";
import { useAvailableNodes, usePurchaseNode } from "~~/hooks/api/useNodes";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";

export const PresaleNode = () => {
  const { t, language } = useGlobalState();
  const { data: availableNodesData, isLoading } = useAvailableNodes();
  const { mutate: buyNode, isPending: isBuying } = usePurchaseNode();
  const { isAuthenticated } = useAuthStore();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [buyingNodeType, setBuyingNodeType] = useState<string | null>(null);
  const [confirmNodeType, setConfirmNodeType] = useState<string | null>(null);

  const handleBuy = (nodeType: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setConfirmNodeType(nodeType);
  };

  const handleConfirmBuy = () => {
    if (!confirmNodeType) return;
    const nodeType = confirmNodeType;
    setConfirmNodeType(null);
    setBuyingNodeType(nodeType);
    buyNode(
      { tier_name: nodeType },
      {
        onSettled: () => setBuyingNodeType(null),
      },
    );
  };

  return (
    <div id="presale" className="w-full py-16">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[#27E903] text-3xl font-bold">/</span>
            <h2 className="text-3xl font-bold uppercase tracking-widest text-white">{t.presale.title}</h2>
          </div>
          <p className="text-gray-400 text-sm tracking-wide">{t.presale.desc}</p>
        </div>

        <div className="grid gap-8">
          {isLoading ? (
            <div className="text-center text-white/50">Loading Nodes...</div>
          ) : (
            availableNodesData?.data?.tiers?.map((item: any, index: number) => {
              const sold = (item.total_slots || 0) - (item.available_slots || 0);
              const total = item.total_slots || 0;
              const progress = total ? Math.max(0, Math.min(100, (sold / total) * 100)) : 0;
              const type = item.tier_name;
              const name = item.display_name;
              const price = item.tier_requirement;

              return (
                <div
                  key={index}
                  className="rounded-2xl bg-[#061F19] border-[3px] border-[#203731] shadow-[0_12px_30px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  <div className="bg-[#27E903] text-black uppercase text-xs md:text-sm font-bold tracking-[0.2em] px-6 py-3 grid grid-cols-4 text-center">
                    <span>DID</span>
                    <span>POWER</span>
                    <span>TC</span>
                    <span>PRICE (U)</span>
                  </div>

                  <div className="px-6 py-6">
                    <div className="grid grid-cols-4 text-sm md:text-base text-center text-white">
                      <span className="text-[#27E903] font-semibold uppercase">{language === "zh" ? name : type}</span>
                      <span>-</span>
                      <span>{item.tcm_bonus || "-"}</span>
                      <span>{price}</span>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-6 bg-[#0A1813] p-2 rounded-xl">
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <div className="flex items-center justify-between text-xs text-gray-500 tracking-widest uppercase">
                          <span>{t.presale.progress}</span>
                          <span className="text-gray-400 tracking-normal">{`${sold}/${total}`}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#101c17] border border-[#142721] overflow-hidden">
                          <div className="h-full bg-[#27E903]" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      <button
                        className="flex-shrink-0 bg-[#27E903] hover:bg-[#27E903]/80 text-black font-bold px-8 py-3 rounded-md shadow-[0_0_12px_rgba(74,222,128,0.6)] disabled:bg-gray-600 disabled:text-gray-400"
                        onClick={() => handleBuy(type)}
                        disabled={isBuying && buyingNodeType === type}
                      >
                        {isBuying && buyingNodeType === type ? "BUYING..." : t.presale.cols.buy}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {confirmNodeType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0A1813] border border-[#203731] rounded-2xl p-6 relative shadow-[#39FF14]/10 shadow-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white/70"
              onClick={() => setConfirmNodeType(null)}
            >
              ✕
            </button>
            <h3 className="font-bold text-xl mb-4 text-center text-white">{t.presale.confirmTitle}</h3>
            <div className="text-center text-sm text-gray-300">
              <div>{t.presale.confirmDesc}</div>
              <div className="mt-2 text-[#27E903] font-semibold uppercase">
                {(() => {
                  const node = availableNodesData?.data?.tiers?.find((item: any) => item.tier_name === confirmNodeType);
                  if (!node) return confirmNodeType;
                  return language === "zh" ? node.display_name : node.tier_name;
                })()}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="btn w-full bg-black/30 hover:bg-black/40 text-white border border-white/10"
                onClick={() => setConfirmNodeType(null)}
              >
                {t.presale.confirmCancel}
              </button>
              <button
                className="btn w-full bg-[#27E903] hover:bg-[#27E903]/80 text-black font-bold border-none disabled:bg-gray-600 disabled:text-gray-400"
                onClick={handleConfirmBuy}
                disabled={isBuying}
              >
                {isBuying && buyingNodeType === confirmNodeType ? "BUYING..." : t.presale.confirmOk}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
