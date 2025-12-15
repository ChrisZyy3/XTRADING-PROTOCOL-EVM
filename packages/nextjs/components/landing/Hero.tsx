import { useGlobalState } from "~~/services/store/store";

export const Hero = () => {
  const { t } = useGlobalState();

  return (
    <div className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/20 rounded-full blur-[120px] -z-10" />

      {/* 3D Phone Placeholders (CSS representation) */}
      <div className="relative w-full max-w-4xl h-[400px] mb-12 flex justify-center items-center">
        {/* Abstract "Phones" */}
        <div className="absolute w-[180px] h-[360px] bg-gray-900 border-4 border-gray-800 rounded-[3rem] transform -rotate-12 -translate-x-20 shadow-2xl z-10 flex flex-col items-center p-4">
          <div className="w-16 h-4 bg-gray-800 rounded-full mb-4"></div>
          <div className="w-full h-full bg-gray-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <div className="absolute w-[180px] h-[360px] bg-gray-900 border-4 border-green-500/50 rounded-[3rem] transform rotate-12 translate-x-20 shadow-2xl z-20 flex flex-col items-center p-4">
          <div className="w-16 h-4 bg-gray-800 rounded-full mb-4"></div>
          <div className="w-full h-full bg-gray-800/50 rounded-2xl flex items-center justify-center">
            <span className="text-tcm-green font-bold text-2xl">TCM</span>
          </div>
        </div>

        {/* Floating elements */}
        <div
          className="absolute top-1/2 left-1/4 w-12 h-12 bg-green-400 rounded-full blur-sm animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-green-600 rounded-full blur-sm animate-bounce"
          style={{ animationDuration: "4s" }}
        ></div>
      </div>

      <div className="text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter">
          <span className="text-white">{t.hero.titleMain}</span>{" "}
          <span className="text-tcm-green">{t.hero.titleAccent}</span>
        </h1>
        <div className="px-6 py-2 border border-tcm-green/30 rounded-full inline-block bg-black/30 backdrop-blur-sm mb-6">
          <span className="text-tcm-green tracking-[0.2em] text-sm md:text-base">{t.hero.subtitle}</span>
        </div>
        <p className="text-gray-400 max-w-xl mx-auto px-4">{t.hero.description}</p>
      </div>
    </div>
  );
};
