import { create } from "zustand";
import { persist } from "zustand/middleware";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";
import { translations } from "~~/utils/translations";

type Language = "en" | "zh";

interface GlobalState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set, get) => ({
      language: "en",
      t: translations.en,
      setLanguage: (lang: Language) => set({ language: lang, t: translations[lang] }),
      nativeCurrencyPrice: 0,
      setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
      targetNetwork: scaffoldConfig.targetNetworks[0],
      setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
    }),
    {
      name: "tcm-global-state",
      partialize: state => ({ language: state.language }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.t = translations[state.language];
        }
      },
    },
  ),
);
