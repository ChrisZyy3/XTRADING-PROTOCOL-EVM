"use client";

import React from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { ArrowRightOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useLogout, useWalletLogin } from "~~/hooks/api/useAuth";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";
import { buildWalletLoginMessage } from "~~/utils/walletAuth";

export const CustomLoginButton = () => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { t } = useGlobalState();

  // Auth Store
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Login Hooks
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { mutate: walletLogin, isPending: isLoginPending } = useWalletLogin();
  const { mutate: logout } = useLogout();

  // We wrap handleLogin in useCallback to avoid unnecessary re-renders and fix the dependency warning
  const handleLogin = React.useCallback(
    async (isAuto = false) => {
      if (!isConnected || !address) {
        if (openConnectModal) {
          openConnectModal();
        } else {
          notification.error("Wallet connection not available");
        }
        return;
      }

      try {
        // 1. Generate timestamped message
        const message = buildWalletLoginMessage();

        // 2. Request signature
        const signature = await signMessageAsync({ message });

        // 3. Call backend API
        walletLogin({
          address: address,
          signature,
          message,
          // No referral code for direct login
        });
      } catch (error: any) {
        console.error("Signature or Login failed", error);
        // Only show error notification if it was a manual login attempt
        if (!isAuto) {
          notification.error("Login failed: " + (error?.message || "Unknown error"));
        }
      }
    },
    [isConnected, address, openConnectModal, signMessageAsync, walletLogin],
  );

  // Auto-login trigger REMOVED to prevent re-sign loop after logout.
  // User must manually click "Sign in" to authenticate.
  /*
  const hasAutoTriggered = React.useRef(false);

  React.useEffect(() => {
    if (isConnected && address && !isAuthenticated && !isLoginPending && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      handleLogin(true);
    }

    // Reset trigger if disconnected
    if (!isConnected) {
      hasAutoTriggered.current = false;
    }
  }, [isConnected, address, isAuthenticated, isLoginPending, handleLogin]);
  */

  const handleLogout = () => {
    disconnect();
    logout();
  };

  // 1. Authenticated -> Show User Profile (or Wallet Address) & Logout
  if (isAuthenticated) {
    // If user profile is loaded, use void_account or void_address
    // If not loaded yet, fallback to connected wallet address
    const displayName = user?.void_account || user?.void_address || address || "User";

    return (
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-ghost gap-2 text-white hover:bg-white/10">
          <UserCircleIcon className="h-5 w-5 text-[#39FF14]" />
          <span className="font-bold">{displayName.slice(0, 6)}...{displayName.slice(-4)}</span>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-[#11221c] rounded-box w-52 mt-4 border border-[#39FF14]/20"
        >
          <li>
            <a onClick={handleLogout} className="text-white hover:text-[#39FF14]">
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </a>
          </li>
        </ul>
      </div>
    );
  }

  // 2. Not Authenticated -> Show Sign In / Connect
  // If not connected, it will trigger Connect Modal first (inside handleLogin logic check)
  // If connected, it will trigger Sign Message

  // Compact Split Mode:
  // [ 0x12..34 ] [ Sign In ]
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-1 bg-[#11221c] border border-white/10 rounded-[13px] p-0.5">
        {/* Address Part - Click to switch wallet */}
        <button
          onClick={openConnectModal}
          className="hidden sm:block btn btn-xs btn-ghost text-white/50 font-normal px-2 hover:bg-white/5 hover:text-white rounded-[10px]"
          title="Switch Wallet"
        >
          {address.slice(0, 4)}...{address.slice(-4)}
        </button>

        {/* Sign In Part */}
        <button
          className="btn btn-sm bg-[#39FF14] hover:bg-[#39FF14]/80 text-black border-none rounded-[10px] px-3 font-bold min-h-8 h-8"
          onClick={() => handleLogin(false)}
          disabled={isLoginPending}
          type="button"
        >
          {isLoginPending ? t.auth.loggingIn || "..." : t.auth.signIn || "Sign in"}
        </button>
      </div>
    );
  }

  // Not Connected
  return (
    <button
      className="btn btn-sm bg-[#39FF14] hover:bg-[#39FF14]/80 text-black border-none rounded-[13px] px-2 font-bold"
      onClick={() => openConnectModal?.()}
      type="button"
    >
      Connect
    </button>
  );
};
