"use client";

import imgBox1 from "~~/components/assets/landing/box_1@3x.png";
import imgBox2 from "~~/components/assets/landing/box_2@3x.png";
import imgBox3 from "~~/components/assets/landing/box_3@3x.png";
import imgPhones from "~~/components/assets/landing/pic_im1@3x.png";
import imgShield from "~~/components/assets/landing/pic_im2@3x.png";
import { PartnerApp } from "~~/components/landing/PartnerApp";
import { PresaleNode } from "~~/components/landing/PresaleNode";
import { useGlobalState } from "~~/services/store/store";

// Image Assets

const imgHeroPhones = imgPhones.src;
const imgDaoShield = imgShield.src;

// Social Icons (Placeholders)
const imgFacebook = "https://cdn-icons-png.flaticon.com/512/733/733547.png";
const imgTwitter = "https://cdn-icons-png.flaticon.com/512/733/733579.png";
const imgTelegram = "https://cdn-icons-png.flaticon.com/512/2111/2111646.png";
const imgYoutube = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";

export const FigmaLanding = () => {
  const { t } = useGlobalState();

  return (
    <div className="relative w-full min-h-screen bg-[#021511] text-white overflow-hidden font-sans">
      {/* Global Background - pic_im1 */}
      <div className="absolute top-0 left-0 w-full h-auto z-0">
        <img src={imgHeroPhones} alt="Hero Background" className="w-full h-auto object-cover object-top" />
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
          <p className="text-gray-300 text-lg md:text-2xl tracking-[0.2em] uppercase font-light">{t.hero.subtitle}</p>
        </div>

        {/* PRESALE SECTION */}
        <div className="w-full mt-10">
          <PresaleNode />
        </div>

        {/* ECOLOGICAL SECTIONS */}
        <div className="w-full mt-32 px-6 flex flex-col gap-32">
          {/* I TCM POOL - moved up as per analysis */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="flex-1 text-gray-300 leading-relaxed text-sm md:text-base">
              <h3 className="text-[#39FF14] font-bold text-3xl mb-6 border-l-4 border-[#39FF14] pl-4">
                {t.ecological.pool.title}
              </h3>
              <p className="opacity-80 leading-7">{t.ecological.pool.desc}</p>
            </div>
            <div className="flex-1 flex justify-center relative">
              {/* Background Box for visual interest */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none scale-150">
                <img src={imgBox2.src} alt="bg" className="object-contain" />
              </div>
              <div className="w-80 h-80 rounded-full flex items-center justify-center relative z-10 bg-gradient-to-br from-[#39FF14]/20 to-transparent border border-[#39FF14]/30 backdrop-blur-md shadow-[0_0_40px_rgba(57,255,20,0.1)]">
                <span className="text-6xl font-bold text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                  POOL
                </span>
              </div>
            </div>
          </div>

          {/* I TCM DAO */}
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-gray-300 leading-relaxed text-sm md:text-base">
              <h3 className="text-[#39FF14] font-bold text-3xl mb-6 border-l-4 border-[#39FF14] pl-4">
                {t.ecological.dao.title}
              </h3>
              <p className="opacity-80 leading-7">{t.ecological.dao.desc}</p>
            </div>
            <div className="flex-1 flex justify-center relative">
              <div className="w-[400px] h-[400px] relative z-10 animate-float-slow">
                <img
                  src={imgDaoShield}
                  alt="DAO Shield"
                  className="w-full h-full object-contain drop-shadow-[0_0_60px_rgba(57,255,20,0.3)]"
                />
              </div>
            </div>
          </div>

          {/* I TCM MALL */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10">
            <div className="flex-1 text-gray-300 leading-relaxed text-sm md:text-base">
              <h3 className="text-[#39FF14] font-bold text-3xl mb-6 border-l-4 border-[#39FF14] pl-4">
                {t.ecological.mall.title}
              </h3>
              <p className="opacity-80 leading-7">{t.ecological.mall.desc}</p>
            </div>
            <div className="flex-1 flex justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none scale-150">
                <img src={imgBox3.src} alt="bg" className="object-contain" />
              </div>
              <div className="w-80 h-80 rounded-full flex items-center justify-center relative z-10 bg-gradient-to-bl from-[#39FF14]/20 to-transparent border border-[#39FF14]/30 backdrop-blur-md shadow-[0_0_40px_rgba(57,255,20,0.1)]">
                <span className="text-6xl font-bold text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                  MALL
                </span>
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
          <h2 className="text-3xl text-white font-bold tracking-[0.2em] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {t.footer.welcome}
          </h2>
          <p className="text-[#39FF14] text-sm tracking-widest mb-12 uppercase font-medium">{t.footer.subtitle}</p>

          <div className="flex items-center gap-8 mb-12">
            {[imgFacebook, imgTwitter, imgTelegram, imgYoutube].map((src, i) => (
              <a
                key={i}
                href="#"
                className="w-14 h-14 rounded-full bg-[#0b1a16] border border-[#39FF14]/30 flex items-center justify-center p-3 hover:bg-[#39FF14] hover:text-black hover:scale-110 transition-all duration-300 group shadow-[0_0_20px_rgba(57,255,20,0.1)]"
              >
                <img
                  src={src}
                  alt="social"
                  className="w-full h-full object-contain opacity-70 group-hover:opacity-100 group-hover:invert filter transition-all"
                />
              </a>
            ))}
          </div>

          <p className="text-gray-600 text-xs tracking-wider">© 2024 TCM PROTOCOL. {t.footer.rights}</p>
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
