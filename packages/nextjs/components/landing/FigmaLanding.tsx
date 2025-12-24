"use client";

import { useGlobalState } from "~~/services/store/store";

// Image Assets derived from Figma
const imgBg = "http://localhost:3845/assets/cbbb9cbf445fe8979d27197a562a0230d88abd16.png";
const imgHeroPhones = "http://localhost:3845/assets/05d3e5ed6ccfaa561038e4bda46e706dbe5123b5.png";
const imgPresaleCard = "http://localhost:3845/assets/ae7197c093c2aee53ec2297c5151070cee3c77a0.svg";
const imgEcologicalMask = "http://localhost:3845/assets/e2b1cf000ef57de934a0399956a24971a841fbd1.svg";

// Social Icons (Placeholder URLs or from Figma if available, using generated ones for now)
const imgFacebook = "http://localhost:3845/assets/7c53aa04e893b7d617b1396b415f02b8ced6d033.png";
const imgTwitter = "http://localhost:3845/assets/a150fa5954d866a7aff6b830fd41915e3b3f61ea.png"; // Assuming generic icon
const imgTelegram = "http://localhost:3845/assets/36cd0209376b1c53e871cfa9e192b63072b9bc72.png";
const imgYoutube = "http://localhost:3845/assets/87e2d39868d2f5291491ac75faf0f17c41a5843c.png";

export const FigmaLanding = () => {
  const { t } = useGlobalState();

  return (
    <div className="relative w-full min-h-screen bg-[#021511] text-white overflow-hidden font-sans">
      {/* Global Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1080px] h-[12233px] pointer-events-none z-0">
        <img src={imgBg} alt="Background" className="w-full h-full object-cover opacity-100" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1080px] mx-auto flex flex-col items-center pb-20">
        {/* HERO SECTION */}
        <div className="w-full flex flex-col items-center mt-32 text-center text-white">
          {/* Phones Image */}
          <div className="relative w-full max-w-2xl h-[600px] mb-[-50px]">
            <img src={imgHeroPhones} alt="Hero Phones" className="w-full h-full object-contain" />
          </div>

          {/* Text Content */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            <span className="text-white">TCM</span> <span className="text-[#39FF14]">PROTOCOL</span>
          </h1>
          <div className="inline-block px-4 py-1 border border-[#39FF14] rounded-full text-[#39FF14] text-sm mb-4">
            WEB3 - RWA
          </div>
          <p className="text-gray-300 text-xl tracking-wide uppercase">Wallet payment mining protocol</p>
        </div>

        {/* PRESALE SECTION */}
        <div className="w-full px-6 mt-40">
          {/* Title */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-1 h-8 bg-[#39FF14]"></div>
            <h2 className="text-2xl font-bold uppercase tracking-widest">PRESALE NODE</h2>
          </div>

          {/* Cards List - Mimicking the PresaleNode logic but with Figma styling */}
          <div className="flex flex-col gap-6">
            {t.presale.list.map((item, index) => (
              <div key={index} className="relative w-full h-[100px] md:h-[120px]">
                {/* SVG Background Card */}
                <div className="absolute inset-0 z-0">
                  <img src={imgPresaleCard} alt="Card Bg" className="w-full h-full object-fill" />
                </div>

                {/* Card Content Overlay */}
                <div className="relative z-10 h-full flex items-center justify-between px-8 text-sm md:text-base font-bold">
                  <span className="text-[#39FF14] w-1/6">{item.name}</span>
                  <span className="w-1/6">{item.dip}</span>
                  <span className="w-1/6">{item.power}</span>
                  <span className="w-1/6">{item.price}</span>
                  <button className="bg-[#39FF14] text-black px-6 py-2 rounded font-bold hover:opacity-90 transition shadow-[0_0_10px_#39FF14]">
                    BUY
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ECOLOGICAL SECTION */}
        <div className="w-full mt-40 relative">
          {/* Background Mask */}
          <div className="absolute top-0 left-0 w-full h-[1669px] z-0 opacity-50 pointer-events-none">
            <img src={imgEcologicalMask} alt="Eco Mask" className="w-full h-full object-contain " />
          </div>

          <div className="relative z-10 px-6 pt-20">
            <div className="flex items-center gap-2 mb-20 justify-center">
              <div className="w-1 h-8 bg-[#39FF14]"></div>
              <h2 className="text-2xl font-bold uppercase tracking-widest text-center">ECOLOGICAL</h2>
            </div>

            {/* Sections */}
            {/* TCM DAO */}
            <div className="flex flex-col md:flex-row items-center gap-10 mb-32">
              <div className="flex-1 text-gray-300 leading-relaxed text-sm">
                <h3 className="text-[#39FF14] font-bold text-xl mb-4 border-l-4 border-[#39FF14] pl-3">TCM DAO</h3>
                <p>{t.ecological.dao.desc}</p>
              </div>
              <div className="flex-1 flex justify-center">
                {/* Placeholder for Graphic - reusing existing circle style or Figma asset if I had it */}
                <div className="w-64 h-64 border border-[#39FF14]/30 rounded-full flex items-center justify-center relative overflow-hidden bg-black/50">
                  <span className="text-6xl font-bold text-[#39FF14]/20">DAO</span>
                </div>
              </div>
            </div>

            {/* TCM POOL */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-10 mb-32">
              <div className="flex-1 text-gray-300 leading-relaxed text-sm">
                <h3 className="text-[#39FF14] font-bold text-xl mb-4 border-l-4 border-[#39FF14] pl-3">TCM POOL</h3>
                <p>{t.ecological.pool.desc}</p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 border border-[#39FF14]/30 rounded-full flex items-center justify-center relative overflow-hidden bg-black/50">
                  <span className="text-6xl font-bold text-[#39FF14]/20">POOL</span>
                </div>
              </div>
            </div>

            {/* TCM MALL */}
            <div className="flex flex-col md:flex-row items-center gap-10 mb-32">
              <div className="flex-1 text-gray-300 leading-relaxed text-sm">
                <h3 className="text-[#39FF14] font-bold text-xl mb-4 border-l-4 border-[#39FF14] pl-3">TCM MALL</h3>
                <p>{t.ecological.mall.desc}</p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 border border-[#39FF14]/30 rounded-full flex items-center justify-center relative overflow-hidden bg-black/50">
                  <span className="text-6xl font-bold text-[#39FF14]/20">MALL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PARTNER APP SECTION */}
        <div className="w-full px-6 mt-20 flex flex-col items-center">
          <h2 className="text-[#39FF14] text-2xl font-bold uppercase tracking-widest mb-16 text-center">
            ECOLOGICAL PARTNER APP
          </h2>

          <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-b from-[#0e2a20] to-black border border-[#39FF14] flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(57,255,20,0.2)]">
            <span className="text-6xl text-[#39FF14]">⬇</span>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button className="flex items-center justify-center gap-4 bg-[#39FF14] text-black font-bold py-4 rounded-full hover:scale-105 transition">
              <span></span> {t.app.ios}
            </button>
            <button className="flex items-center justify-center gap-4 bg-[#111] border border-[#39FF14] text-white font-bold py-4 rounded-full hover:bg-[#222] transition">
              <span>🤖</span> {t.app.android}
            </button>
          </div>
        </div>

        {/* FOOTER - As per Figma text */}
        <div className="w-full mt-40 flex flex-col items-center text-center pb-20">
          <h2 className="text-2xl text-white font-bold tracking-widest mb-2">Welcome To The TCM Ecosystem</h2>
          <p className="text-gray-400 text-sm mb-10">TCM Protocol Web3-Rwa</p>

          <div className="flex items-center gap-6">
            {[imgFacebook, imgTwitter, imgTelegram, imgYoutube].map((src, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center p-2 hover:bg-[#39FF14]/30 transition cursor-pointer"
              >
                <img src={src} alt="social" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
