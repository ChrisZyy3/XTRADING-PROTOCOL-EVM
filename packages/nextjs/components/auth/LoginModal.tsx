"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { useLogin, useRegister } from "~~/hooks/api/useAuth";
import { notification } from "~~/utils/scaffold-eth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [manualAddress, setManualAddress] = useState("");

  // Decide which address to use: connected one or manually typed one
  // If connected, we prefer the connected address and lock the input?
  // User Requirement: "Includes login info... currently wallet address + password"
  // So we should populate with connected address if available, but maybe allow edit if logic permits?
  // For safety, if connected, let's use that one. If not, allow typing.
  const targetAddress = isConnected ? connectedAddress : manualAddress;

  // Login State
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoginPassword("");
      setRegisterData({ username: "", email: "", password: "" });
      setManualAddress("");
    }
  }, [isOpen]);

  const handleLogin = () => {
    if (!targetAddress) {
      notification.error("Please enter your wallet address");
      return;
    }
    if (!loginPassword) {
      notification.error("Please enter your password");
      return;
    }

    login(
      { address: targetAddress, password: loginPassword },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleRegister = () => {
    if (!targetAddress) {
      notification.error("Please enter your wallet address");
      return;
    }
    if (!registerData.username || registerData.username.length <= 4) {
      notification.error("Username must be longer than 4 characters");
      return;
    }

    // Simple email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerData.email || !emailRegex.test(registerData.email)) {
      notification.error("Please enter a valid email address");
      return;
    }

    if (!registerData.password || registerData.password.length <= 6) {
      notification.error("Password must be longer than 6 characters");
      return;
    }

    register(
      {
        address: targetAddress,
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleConnectWallet = () => {
    // Try to connect with the first available connector (usually MetaMask/Injected)
    // Or just open the rainbowkit modal?
    // Since we replaced the button, we might need to invoke RainbowKit's modal programmatically if we want that experience.
    // But here, let's just use standard wagmi connect for simplicity or ask user to connect.
    const connector = connectors[0];
    if (connector) connect({ connector });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Manual styling instead of daisyui 'modal-box' to ensure visibility */}
      <div className="w-full max-w-sm bg-[#0A1813] border border-[#203731] rounded-2xl p-6 relative shadow-[#39FF14]/10 shadow-2xl">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white/70" onClick={onClose}>
          ✕
        </button>

        <h3 className="font-bold text-xl mb-6 text-center text-white">
          {activeTab === "login" ? "Welcome Back" : "Create Account"}
        </h3>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-black/40 mb-6 p-1 border border-white/5 w-full">
          <a
            className={`tab flex-1 transition-all duration-300 ${
              activeTab === "login" ? "bg-[#39FF14] !text-black font-bold rounded-lg" : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </a>
          <a
            className={`tab flex-1 transition-all duration-300 ${
              activeTab === "register"
                ? "bg-[#39FF14] !text-black font-bold rounded-lg"
                : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </a>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {/* Wallet Address Input */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-white/80 text-xs uppercase tracking-wider">Wallet Address</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetAddress || ""}
                onChange={e => !isConnected && setManualAddress(e.target.value)}
                placeholder="0x..."
                disabled={isConnected}
                className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm pl-3 pr-10"
              />
            </div>
          </div>

          {activeTab === "login" ? (
            // Login Form
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-white/80 text-xs uppercase tracking-wider">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
          ) : (
            // Register Form
            <>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  value={registerData.username}
                  onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  value={registerData.email}
                  onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Set password"
                  className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  value={registerData.password}
                  onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="mt-4">
            {activeTab === "login" ? (
              <button
                className="btn w-full bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none font-bold rounded-lg uppercase tracking-wide disabled:bg-gray-600 disabled:text-gray-400"
                onClick={handleLogin}
                disabled={isLoginPending || !targetAddress}
              >
                {isLoginPending ? "Logging in..." : "Login"}
              </button>
            ) : (
              <button
                className="btn w-full bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none font-bold rounded-lg uppercase tracking-wide disabled:bg-gray-600 disabled:text-gray-400"
                onClick={handleRegister}
                disabled={isRegisterPending || !targetAddress}
              >
                {isRegisterPending ? "Creating Account..." : "Register"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
