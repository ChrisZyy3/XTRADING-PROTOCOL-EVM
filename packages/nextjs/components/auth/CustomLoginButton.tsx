"use client";

import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { useAccount, useConnect } from "wagmi";
import { ArrowRightOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "~~/services/store/authStore";

export const CustomLoginButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If authenticated, show User Profile (similar to previous AuthButton)
  if (isAuthenticated && user) {
    return (
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 normal-case">
          <div className="w-8 h-8 rounded-full bg-[#39FF14]/20 flex items-center justify-center">
            <UserCircleIcon className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-xs font-bold text-white">{user.username || "User"}</span>
            <span className="text-[10px] text-gray-400">
              {user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : ""}
            </span>
          </div>
        </label>
        <ul
          tabIndex={0}
          className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-black rounded-box w-40 border border-white/10"
        >
          <li>
            <a onClick={() => logout()} className="text-error hover:bg-white/5">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </a>
          </li>
        </ul>
      </div>
    );
  }

  // If NOT authenticated (regardless of wallet connection), show "Connect" style button
  // This replaces the functionality: Click -> Open Login Modal
  return (
    <>
      <button
        className="btn btn-sm bg-[#39FF14] hover:bg-[#39FF14]/80 text-black border-none rounded-[13px] px-4 font-bold"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        Connect
      </button>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
