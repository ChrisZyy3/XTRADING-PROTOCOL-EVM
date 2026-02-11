"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { CustomLoginButton } from "~~/components/auth/CustomLoginButton";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { t } = useGlobalState();

  const links = [
    { label: t.nav.wallet, href: "/wallet" },
    { label: t.nav.transfer, href: "/transfer" },
    { label: t.nav.deposit, href: "/newDeposit" },
    { label: t.withdraw.nav, href: "/withdraw" },
    { label: t.nav.hashpower, href: "/hashpower" },
    { label: t.nav.node, href: "/node" },
    { label: t.nav.referral, href: "/referral" },
  ];

  return (
    <>
      {links.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { language, setLanguage, t } = useGlobalState();
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });
  useOutsideClick(languageDropdownRef, () => {
    languageDropdownRef?.current?.removeAttribute("open");
  });

  const handleLanguageChange = (lang: "en" | "zh") => {
    setLanguage(lang);
    document.documentElement.lang = lang;
    languageDropdownRef?.current?.removeAttribute("open");
  };

  // keep <html lang=""> in sync on initial render
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }

  return (
    <div className="sticky lg:static top-0 navbar bg-black min-h-0 shrink-0 justify-between z-30 shadow-md shadow-secondary px-0 sm:px-2 border-b border-white/10">
      <div className="navbar-start w-auto lg:w-1/2">
        <Link href="/" passHref className="flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="XTrading Protocol" fill className="rounded-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight text-sm sm:text-lg tracking-tight text-white">
              {t.hero.titleMain} {t.hero.titleAccent}
            </span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow gap-0 sm:gap-1">
        {/* Custom Login Button (Replaces Connect + Auth) */}
        <CustomLoginButton />

        {/* Language Switcher - Globe Icon with Dropdown */}
        <div className="dropdown dropdown-end" ref={languageDropdownRef}>
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-black rounded-box w-32 border border-white/10"
          >
            <li>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`${language === "en" ? "bg-[#39FF14] text-black font-bold" : "text-white hover:bg-white/10"}`}
              >
                English
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLanguageChange("zh")}
                className={`${language === "zh" ? "bg-[#39FF14] text-black font-bold" : "text-white hover:bg-white/10"}`}
              >
                中文
              </button>
            </li>
          </ul>
        </div>

        {/* Hamburger Menu (Mobile Only) - Moved to End */}
        <details className="dropdown dropdown-end" ref={burgerMenuRef}>
          <summary className="btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-black rounded-box w-52 border border-white/10"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
      </div>
    </div>
  );
};
