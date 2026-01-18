import { useState } from "react";
import { LoginModal } from "~~/components/auth/LoginModal";
import { useBuyNode, useNodeTypes } from "~~/hooks/api/useNodes";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export const PresaleNode = () => {
  const { t, language } = useGlobalState();
  const { data: nodeTypes, isLoading } = useNodeTypes();
  const { mutate: buyNode, isPending: isBuying } = useBuyNode();
  const { isAuthenticated } = useAuthStore();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [buyingNodeType, setBuyingNodeType] = useState<string | null>(null);

  const handleBuy = (nodeType: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setBuyingNodeType(nodeType);
    buyNode(
      { node_type: nodeType },
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
            nodeTypes?.data?.map((item: any, index: number) => (
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
                    <span className="text-[#27E903] font-semibold uppercase">
                      {language === "zh" ? item.name : item.type}
                    </span>
                    <span>{item.hash_power}</span>
                    <span>{item.tcm_locked}</span>
                    <span>{item.usd_amount}</span>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-6 bg-[#0A1813] p-2 rounded-xl">
                    <div className="flex-1 flex flex-col gap-2 min-w-0 invisible">
                      {/* Progress Hidden as per request */}
                      <span className="text-xs text-gray-500 tracking-widest uppercase text-left">
                        {t.presale.progress}
                      </span>
                      <div className="w-full h-2 rounded-full bg-[#101c17] border border-[#142721] overflow-hidden">
                        <div className="h-full bg-[#27E903] w-[0%]"></div>
                      </div>
                    </div>
                    <button
                      className="flex-shrink-0 bg-[#27E903] hover:bg-[#27E903]/80 text-black font-bold px-8 py-3 rounded-md shadow-[0_0_12px_rgba(74,222,128,0.6)] disabled:bg-gray-600 disabled:text-gray-400"
                      onClick={() => handleBuy(item.type)}
                      disabled={isBuying && buyingNodeType === item.type}
                    >
                      {isBuying && buyingNodeType === item.type ? "BUYING..." : t.presale.cols.buy}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};
