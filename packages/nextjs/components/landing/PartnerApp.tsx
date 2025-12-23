import { useGlobalState } from "~~/services/store/store";

export const PartnerApp = () => {
  const { t } = useGlobalState();

  return (
    <div className="w-full bg-black/30 border-t border-tcm-green/10">
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-tcm-green mb-8 uppercase tracking-widest text-shadow-glow">
          {t.app.title}
        </h2>

        {/* Circle Graphic Placeholder */}
        <div className="w-48 h-48 rounded-full border border-tcm-green/30 flex items-center justify-center relative mb-12 animate-pulse-slow">
          <div className="absolute w-[80%] h-[80%] border border-tcm-green/50 rounded-full animate-spin-slow"></div>
          <span className="text-4xl text-tcm-green">⬇</span>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button className="flex items-center justify-center gap-3 bg-tcm-green text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all">
            {/* Apple Icon */}
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 3.94-1.64.92.05 1.78.36 2.41 1.09-2.09 1.3-1.66 4.1.33 5.37-.41 1.25-1.12 2.67-1.76 3.41zm-2.02-14.7c.6-1.54.1-3.14-.02-3.48-1.45.17-3.07 1-3.69 2.52-.77 1.81.24 3.63.17 3.82 1.62.15 2.94-1.32 3.54-2.86z" />
            </svg>
            {t.app.ios}
          </button>
          <button className="flex items-center justify-center gap-3 bg-gray-900 border border-tcm-green/30 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all">
            {/* Android Icon */}
            <svg className="w-6 h-6 fill-tcm-green" viewBox="0 0 24 24">
              <path d="M17.523 15.3414C17.523 16.7113 16.425 17.8209 15.071 17.8209C13.717 17.8209 12.619 16.7113 12.619 15.3414C12.619 13.9715 13.717 12.8619 15.071 12.8619C16.425 12.8619 17.523 13.9715 17.523 15.3414ZM7.766 15.3414C7.766 16.7113 6.667 17.8209 5.313 17.8209C3.959 17.8209 2.861 16.7113 2.861 15.3414C2.861 13.9715 3.959 12.8619 5.313 12.8619C6.667 12.8619 7.766 13.9715 7.766 15.3414ZM21.576 6.94196C21.329 6.50295 20.766 6.35395 20.334 6.60295L18.064 7.90494C16.324 7.10695 14.349 6.65795 12.228 6.59195L12.986 2.92397C13.069 2.52297 12.805 2.12897 12.408 2.04697C12.012 1.96397 11.621 2.22697 11.539 2.62897L10.741 6.48995C8.423 6.59195 6.273 7.12695 4.417 8.01994L2.096 6.60295C1.662 6.33595 1.101 6.50295 0.854 6.94196C0.607 7.37996 0.772 7.94796 1.206 8.21496L3.413 9.56395C1.681 12.2039 0.613 15.4299 0.5 18.9639H21.756C21.636 15.2289 20.443 11.8549 18.577 9.13095L21.222 7.61496C21.656 7.36596 21.821 6.78696 21.576 6.94196Z" />
            </svg>
            {t.app.android}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Footer = () => {
  const { t } = useGlobalState();
  return (
    <div className="py-12 border-t border-tcm-green/10 text-center">
      <p className="text-white font-bold text-lg mb-8">{t.footer.welcome}</p>
      <div className="flex justify-center gap-8 mb-8 text-tcm-green">
        {/* Social Icons Placeholder */}
        <span>X</span>
        <span>M</span>
        <span>@</span>
        <span>TG</span>
        <span>TP</span>
      </div>
      <p className="text-xs text-gray-500">
        {t.footer.rights} &copy; {new Date().getFullYear()} TCM PROTOCOL
      </p>
    </div>
  );
};
