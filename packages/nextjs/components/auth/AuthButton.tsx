"use client";

import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { ArrowRightOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export const AuthButton = () => {
  const { address } = useAccount();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t } = useGlobalState();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If wallet not connected, don't show anything (Header handles wallet connect)
  if (!address) {
    return null;
  }

  const handleLogout = () => {
    logout();
    queryClient.clear();
    notification.success(t.auth.logoutSuccess);
  };

  // If wallet connected but not authenticated with backend
  if (!isAuthenticated) {
    return (
      <>
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
          <UserCircleIcon className="w-4 h-4 mr-1" />
          Login
        </button>
        <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // If authenticated
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 normal-case">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <UserCircleIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-xs font-bold">{user?.username || "User"}</span>
          <span className="text-[10px] opacity-70">
            Addr: {user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}
          </span>
        </div>
      </label>
      <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-40">
        <li>
          <a onClick={handleLogout} className="text-error">
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
};
