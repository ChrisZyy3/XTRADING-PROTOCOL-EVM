import { useGlobalState } from "~~/services/store/store";

const Section = ({ title, desc, reverse = false }: { title: string; desc: string; reverse?: boolean }) => (
  <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 py-12`}>
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-tcm-green"></div>
        <h3 className="text-2xl font-bold uppercase text-tcm-green">{title}</h3>
      </div>
      <p className="text-gray-300 leading-relaxed text-sm md:text-base">{desc}</p>
    </div>
    <div className="flex-1 flex justify-center">
      {/* Placeholder for 3D Graphic */}
      <div className="w-64 h-64 bg-gradient-to-br from-gray-800 to-black border border-tcm-green/20 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl card-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent"></div>
        <span className="text-6xl opacity-20 font-bold select-none">{title.split(" ")[1]}</span>
      </div>
    </div>
  </div>
);

export const Ecological = () => {
  const { t } = useGlobalState();

  return (
    <div id="ecological" className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-8 bg-tcm-green"></div>
          <h2 className="text-3xl font-bold uppercase">{t.ecological.title}</h2>
        </div>
      </div>

      <div className="space-y-12">
        <Section title={t.ecological.dao.title} desc={t.ecological.dao.desc} />
        <Section title={t.ecological.pool.title} desc={t.ecological.pool.desc} reverse />
        <Section title={t.ecological.mall.title} desc={t.ecological.mall.desc} />
      </div>
    </div>
  );
};
