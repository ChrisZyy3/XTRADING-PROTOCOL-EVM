import imgPhone1 from "~~/components/assets/landing/pic_im2@3x.png";
import imgPhone2 from "~~/components/assets/landing/pic_im3@3x.png";
import imgPhone3 from "~~/components/assets/landing/pic_im4@3x.png";
import { useGlobalState } from "~~/services/store/store";

export const PartnerApp = () => {
  const { t } = useGlobalState();

  return (
    <div className="w-full py-20 relative overflow-hidden">
      <div className="max-w-[1080px] mx-auto px-6 flex flex-col items-center relative z-10">
        <div className="flex items-center gap-2 mb-16 justify-center">
          <span className="text-[#39FF14] text-2xl font-bold">/</span>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-white">{t.app.title}</h2>
        </div>

        {/* Phones Layout */}
        <div className="flex justify-center items-end gap-4 md:gap-10 mb-20">
          {/* Left Phone */}
          <div className="w-1/4 max-w-[200px] opacity-80 transfrom translate-y-4">
            <img src={imgPhone2.src} alt="App Screen 2" className="w-full h-auto object-contain drop-shadow-2xl" />
          </div>

          {/* Center Phone (Main) */}
          <div className="w-1/3 max-w-[260px] z-10">
            <img
              src={imgPhone1.src}
              alt="App Screen 1"
              className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(57,255,20,0.3)]"
            />
          </div>

          {/* Right Phone */}
          <div className="w-1/4 max-w-[200px] opacity-80 transfrom translate-y-4">
            <img src={imgPhone3.src} alt="App Screen 3" className="w-full h-auto object-contain drop-shadow-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
