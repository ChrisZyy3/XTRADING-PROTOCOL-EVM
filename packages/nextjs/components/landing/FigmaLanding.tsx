"use client";

import imgDaoBg from "~~/components/assets/landing/DAO-bg.png";
import imgMallBg from "~~/components/assets/landing/Mall-bg.png";
import imgPoolBg from "~~/components/assets/landing/Pool-bg.png";
import imgDC from "~~/components/assets/landing/linktree/DC.png";
import imgFB from "~~/components/assets/landing/linktree/FB.png";
import imgIG from "~~/components/assets/landing/linktree/IG.png";
import imgMM from "~~/components/assets/landing/linktree/MM.png";
import imgTG from "~~/components/assets/landing/linktree/TG.png";
import imgTP from "~~/components/assets/landing/linktree/TP.png";
import imgX from "~~/components/assets/landing/linktree/X.png";
import imgYTB from "~~/components/assets/landing/linktree/YTB.png";
import imgPhones from "~~/components/assets/landing/pic_im1@3x.png";
import { PartnerApp } from "~~/components/landing/PartnerApp";
import { PresaleNode } from "~~/components/landing/PresaleNode";
import { useGlobalState } from "~~/services/store/store";

// Image Assets

const imgHeroPhones = imgPhones.src;

// Social Icons (Placeholders removed)

export const FigmaLanding = () => {
  const { t } = useGlobalState();

  return (
    <div className="relative w-full min-h-screen bg-[#021511] text-white overflow-hidden font-sans">
      {/* Global Background - pic_im1 */}
      <div className="absolute top-0 left-0 w-full h-auto z-0 flex justify-center">
        <img
          src={imgHeroPhones}
          alt="Hero Background"
          className="w-full max-w-[520px] h-auto object-cover object-top"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1080px] mx-auto flex flex-col items-center pb-20">
        {/* HERO SECTION */}
        <div className="w-full flex flex-col items-center mt-115 text-center text-white px-4">
          {/* Phones Image Removed from Flow */}

          {/* Text Content */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6">
            <span className="text-white drop-shadow-lg">{t.hero.titleMain}</span>{" "}
            <span className="text-[#39FF14] drop-shadow-[0_0_15px_rgba(57,255,20,0.8)]">{t.hero.titleAccent}</span>
          </h1>
          <div className="inline-block px-6 py-2 border border-[#39FF14] rounded-full text-[#39FF14] text-sm md:text-base font-bold tracking-widest mb-6 bg-[#39FF14]/10 backdrop-blur-sm">
            {t.hero.badge}
          </div>
          <p className="text-white text-lg md:text-2xl tracking-[0.2em] font-bold">{t.hero.subtitle}</p>
        </div>

        {/* PRESALE SECTION */}
        <div className="w-full mt-10">
          <PresaleNode />
        </div>

        {/* ECOLOGICAL SECTIONS */}
        <div className="w-full mt-8 px-6 flex flex-col">
          {/* ECOLOGICAL TITLE */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <h2 className="text-white font-bold text-3xl tracking-widest uppercase">{t.ecological.title}</h2>
          </div>

          <div className="flex flex-col gap-32">
            {/* I TCM DAO - Card 1 */}
            <div className="relative w-full max-w-fit mx-auto rounded-[30px] overflow-hidden group">
              <img src={imgDaoBg.src} alt="DAO Background" className="block w-auto max-w-full h-auto z-0" />
              <div className="absolute inset-0 z-10 p-8 md:p-14 flex flex-col md:flex-col items-start gap-10 h-full">
                <div className="w-full">
                  <h3 className="text-[#39FF14] font-bold text-3xl mb-6 border-l-[6px] border-[#39FF14] pl-4 tracking-wider">
                    {t.ecological.dao.title}
                  </h3>
                  <p className="text-gray-300 leading-5 text-[10px] md:text-xs lg:text-sm xl:text-base font-light tracking-wide max-w-4xl">
                    {t.ecological.dao.desc}
                  </p>
                </div>
                <div className="w-full flex justify-center mt-4">{/* Image removed as per request */}</div>
              </div>
            </div>

            {/* I TCM POOL - Card 2 */}
            <div className="relative w-full max-w-fit mx-auto rounded-[30px] overflow-hidden group">
              <img src={imgPoolBg.src} alt="Pool Background" className="block w-auto max-w-full h-auto z-0" />
              <div className="absolute inset-0 z-10 p-8 md:p-14 flex flex-col md:flex-col items-start gap-10 h-full">
                <div className="w-full">
                  <h3 className="text-[#39FF14] font-bold text-3xl mb-6 border-l-[6px] border-[#39FF14] pl-4 tracking-wider">
                    {t.ecological.pool.title}
                  </h3>
                  <p className="text-gray-300 leading-5 text-[10px] md:text-xs lg:text-sm xl:text-base font-light tracking-wide max-w-4xl">
                    {t.ecological.pool.desc}
                  </p>
                </div>
                <div className="w-full flex justify-center mt-4">{/* Icon removed as per request */}</div>
              </div>
            </div>

            {/* I TCM MALL - Card 3 */}
            <div className="relative w-full max-w-fit mx-auto rounded-[30px] overflow-hidden group">
              <img src={imgMallBg.src} alt="Mall Background" className="block w-auto max-w-full h-auto z-0" />
              <div className="absolute inset-0 z-10 p-8 md:p-14 flex flex-col md:flex-col items-start gap-10 h-full">
                <div className="w-full">
                  <h3 className="text-[#39FF14] font-bold text-3xl mb-6 border-l-[6px] border-[#39FF14] pl-4 tracking-wider">
                    {t.ecological.mall.title}
                  </h3>
                  <p className="text-gray-300 leading-5 text-[11px] md:text-xs lg:text-sm xl:text-base font-light tracking-wide max-w-4xl">
                    {t.ecological.mall.desc}
                  </p>
                </div>
                <div className="w-full flex justify-center mt-4">{/* Icon removed as per request */}</div>
              </div>
            </div>
          </div>
        </div>

        {/* PARTNER APP SECTION */}
        {/* <div className="w-full mt-32">
          <PartnerApp />
        </div> */}

        {/* FOOTER */}
        <div className="w-full mt-20 flex flex-col items-center text-center pb-10 border-t border-[#39FF14]/10 pt-20">
          <h2 className="text-xl text-white font-bold tracking-[0.2em] mb-4">{t.footer.welcome}</h2>
          <p className="text-gray-500 text-sm tracking-widest mb-12 uppercase font-medium">{t.footer.subtitle}</p>

          <div className="grid grid-cols-4 gap-6 md:gap-10 mb-12">
            {[imgX, imgFB, imgIG, imgTG, imgDC, imgMM, imgTP, imgYTB].map((src, i) => (
              <a
                key={i}
                href="#"
                className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center hover:scale-110 transition-all duration-300 group"
              >
                <img
                  src={src.src}
                  alt="social"
                  className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-all"
                />
              </a>
            ))}
          </div>

          <div className="w-full max-w-2xl h-px bg-[#39FF14]/10 mb-8" />

          <p className="text-[#1A3D33] text-sm md:text-base font-medium tracking-wide">
            Wallet payment mining protocol
          </p>
        </div>
      </div>

      {/* CSS Animation Styles (Inline for simplicity, or could be in global.css) */}
      <style jsx global>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
