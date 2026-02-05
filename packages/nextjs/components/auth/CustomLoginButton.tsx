"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { ArrowRightOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useLogout, useWalletLogin } from "~~/hooks/api/useAuth";
import { useAuthStore } from "~~/services/store/authStore";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export const CustomLoginButton = () => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { t } = useGlobalState();

  // Auth Store
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Login Hooks
  const { signMessageAsync } = useSignMessage();
  const { mutate: walletLogin, isPending: isLoginPending } = useWalletLogin();
  const { mutate: logout } = useLogout();

  const handleLogin = async () => {
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
      const now = new Date();
      const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
      const message = `Login to XTG at ${timestamp}`;

      // 2. Request signature
      const signature = await signMessageAsync({ message });

      // 3. Call backend API
      walletLogin({
        address,
        signature,
        message,
        // No referral code for direct login
      });
    } catch (error: any) {
      console.error("Signature or Login failed", error);
      notification.error("Login failed: " + (error?.message || "Unknown error"));
    }
  };

  const handleLogout = () => {
    logout();
  };

  // 1. Authenticated -> Show User Profile & Logout
  if (user && isAuthenticated) {
    return (
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-ghost gap-2 text-white hover:bg-white/10">
          <UserCircleIcon className="h-5 w-5 text-[#39FF14]" />
          <span className="font-bold">{user.void_account || user.void_address?.slice(0, 6)}</span>
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
  return (
    <button
      className="btn btn-sm bg-[#39FF14] hover:bg-[#39FF14]/80 text-black border-none rounded-[13px] px-2 font-bold"
      onClick={handleLogin}
      disabled={isLoginPending}
      type="button"
    >
      {isLoginPending ? t.auth.loggingIn || "Logging in..." : isConnected ? t.auth.signIn || "Sign in" : "Connect"}
    </button>
  );
};
