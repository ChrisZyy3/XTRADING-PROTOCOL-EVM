import { useGlobalState } from "~~/services/store/store";

export const PresaleNode = () => {
  const { t } = useGlobalState();

  return (
    <div id="presale" className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-8 bg-tcm-green"></div>
          <h2 className="text-3xl font-bold uppercase">{t.presale.title}</h2>
        </div>
        <p className="text-gray-400">{t.presale.desc}</p>
      </div>

      <div className="grid gap-6">
        {t.presale.list.map((item, index) => (
          <div
            key={index}
            className="card-gradient rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8"
          >
            <div className="w-full flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-tcm-green/10 text-tcm-green font-semibold uppercase tracking-wide">
                {item.name}
              </span>
              <span className="text-xs text-gray-400 uppercase">{t.presale.title}</span>
            </div>

            {/* Left: Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto flex-grow text-center md:text-left">
              <div className="flex flex-col">
                <span className="text-xs text-tcm-green mb-1 uppercase">{t.presale.cols.dip}</span>
                <span className="font-bold text-lg">{item.dip}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-tcm-green mb-1 uppercase">{t.presale.cols.power}</span>
                <span className="font-bold">{item.power}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-tcm-green mb-1 uppercase">{t.presale.cols.tc}</span>
                <span className="font-bold">{item.tc}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-tcm-green mb-1 uppercase">{t.presale.cols.price}</span>
                <span className="font-bold">{item.price}</span>
              </div>
            </div>

            {/* Right: Progress and Button */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-tcm-green w-[60%]"></div>
              </div>
              <button className="btn-tcm w-full md:w-auto min-w-[100px]">{t.presale.cols.buy}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
