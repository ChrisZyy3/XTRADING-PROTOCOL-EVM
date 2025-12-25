import { useGlobalState } from "~~/services/store/store";

export const PresaleNode = () => {
  const { t } = useGlobalState();

  return (
    <div id="presale" className="w-full bg-[#0f2a18] py-16">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-tcm-green text-3xl font-bold">/</span>
            <h2 className="text-3xl font-bold uppercase tracking-widest">{t.presale.title}</h2>
          </div>
          <p className="text-gray-400 text-sm tracking-wide">{t.presale.desc}</p>
        </div>

        <div className="grid gap-8">
          {t.presale.list.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#0b1a16] border border-[#142721] shadow-[0_12px_30px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              <div className="bg-tcm-green text-black uppercase text-xs md:text-sm font-bold tracking-[0.2em] px-6 py-3 grid grid-cols-4 text-center">
                <span>{t.presale.cols.dip}</span>
                <span>{t.presale.cols.power}</span>
                <span>{t.presale.cols.tc}</span>
                <span>{t.presale.cols.price}</span>
              </div>

              <div className="px-6 py-6">
                <div className="grid grid-cols-4 text-sm md:text-base text-center">
                  <span className="text-tcm-green font-semibold">{item.dip}</span>
                  <span>{item.power}</span>
                  <span>{item.tc}</span>
                  <span>{item.price}</span>
                </div>

                <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
                  <span className="text-xs text-gray-500 tracking-widest uppercase">{t.presale.progress}</span>
                  <div className="flex-1 h-2 rounded-full bg-[repeating-linear-gradient(135deg,_#0b1512_0,_#0b1512_6px,_#101c17_6px,_#101c17_12px)] border border-[#142721] overflow-hidden">
                    <div className="h-full bg-tcm-green w-[60%]"></div>
                  </div>
                  <button className="bg-tcm-green text-black font-bold px-6 py-2 rounded-md shadow-[0_0_12px_rgba(74,222,128,0.6)]">
                    {t.presale.cols.buy}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
