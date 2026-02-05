"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useWalletLogin } from "~~/hooks/api/useAuth";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { mutate: walletLogin, isPending: isLoginPending } = useWalletLogin();
  const { t } = useGlobalState();
  const [referralCode, setReferralCode] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReferralCode("");
    }
  }, [isOpen]);

  const handleWalletLogin = async () => {
    if (!isConnected || !address) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      // 1. Generate timestamped message
      // Format: YYYY-MM-DD HH:MM:SS
      const now = new Date();
      const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
      const message = `Login to XTG at ${timestamp}`;

      // 2. Request signature
      const signature = await signMessageAsync({ message });

      // 3. Call backend API
      walletLogin(
        {
          address,
          signature,
          message,
          referral_code: referralCode || undefined,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } catch (error: any) {
      console.error("Signature or Login failed", error);
      notification.error("Login failed: " + (error?.message || "Unknown error"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm card-premium rounded-2xl p-6 relative shadow-[#39FF14]/10 shadow-2xl">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white/70" onClick={onClose}>
          ✕
        </button>

        <h3 className="font-bold text-2xl mb-6 text-center text-white font-display text-glow">
          {t.auth.welcomeBack || "Welcome Back"}
        </h3>

        <div className="flex flex-col gap-4">
          <p className="text-center text-white/60 text-sm mb-4">
            Sign a message with your wallet to verify ownership and log in securelessly.
          </p>

          {!isConnected ? <div className="alert alert-warning text-sm">Please connect your wallet first.</div> : null}

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-white/80 text-xs uppercase tracking-wider">
                Referral Code (Optional)
              </span>
            </label>
            <input
              type="text"
              placeholder="XTG..."
              className="input input-bordered border-2 w-full bg-[#11221c] border-white/20 focus:border-[#39FF14] focus:outline-none text-white text-sm"
              value={referralCode}
              onChange={e => setReferralCode(e.target.value)}
            />
          </div>

          <button
            className="btn w-full bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none font-bold rounded-lg uppercase tracking-wide disabled:!bg-[#2c2c2c] disabled:!text-white/50"
            onClick={handleWalletLogin}
            disabled={isLoginPending || !isConnected}
          >
            {isLoginPending ? t.auth.loggingIn || "Logging in..." : t.auth.login || "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
