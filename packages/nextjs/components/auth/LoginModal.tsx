"use client";

import { useEffect, useState } from "react";
import { useLogin, useRegister } from "~~/hooks/api/useAuth";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { t } = useGlobalState(); // 获取翻译函数 (Get translation function)

  // Login State
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    refer: "",
  });
  const [loginUsername, setLoginUsername] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoginPassword("");
      setRegisterData({ username: "", password: "", refer: "" });
      setLoginUsername("");
    }
  }, [isOpen]);

  const handleLogin = () => {
    if (!loginUsername) {
      notification.error(t.auth.pleaseEnterUsername);
      return;
    }
    if (!loginPassword) {
      notification.error(t.auth.pleaseEnterPassword);
      return;
    }

    login(
      { username: loginUsername, password: loginPassword },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleRegister = () => {
    if (!registerData.username || registerData.username.length <= 8) {
      notification.error(t.auth.usernameTooShort);
      return;
    }

    if (!registerData.password || registerData.password.length < 8) {
      notification.error(t.auth.passwordTooShort);
      return;
    }

    register(
      {
        username: registerData.username,
        password: registerData.password,
        refer: registerData.refer, // Optional
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
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
          {activeTab === "login" ? t.auth.welcomeBack : t.auth.createAccount}
        </h3>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-black/40 mb-6 p-1 border border-white/5 w-full">
          <a
            className={`tab flex-1 transition-all duration-300 ${
              activeTab === "login" ? "bg-[#39FF14] !text-black font-bold rounded-lg" : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab("login")}
          >
            {t.auth.login}
          </a>
          <a
            className={`tab flex-1 transition-all duration-300 ${
              activeTab === "register"
                ? "bg-[#39FF14] !text-black font-bold rounded-lg"
                : "text-white/60 hover:text-white"
            }`}
            onClick={() => setActiveTab("register")}
          >
            {t.auth.register}
          </a>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {activeTab === "login" ? (
            // Login Form
            <>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">{t.auth.username}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder={t.auth.enterUsername}
                    className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">{t.auth.password}</span>
                </label>
                <input
                  type="password"
                  placeholder={t.auth.enterPassword}
                  className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            // Register Form
            <>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">{t.auth.username}</span>
                </label>
                <input
                  type="text"
                  placeholder={t.auth.setUsername}
                  className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  value={registerData.username}
                  onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">{t.auth.password}</span>
                </label>
                <input
                  type="password"
                  placeholder={t.auth.setPassword}
                  className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  value={registerData.password}
                  onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white/80 text-xs uppercase tracking-wider">
                    {t.auth.referralCode}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder={t.auth.referralAddress}
                  className="input input-bordered w-full bg-black/50 border-white/10 focus:border-[#39FF14] focus:outline-none text-white text-sm"
                  value={registerData.refer}
                  onChange={e => setRegisterData({ ...registerData, refer: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="mt-4">
            {activeTab === "login" ? (
              <button
                className="btn w-full bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none font-bold rounded-lg uppercase tracking-wide disabled:bg-gray-600 disabled:text-gray-400"
                onClick={handleLogin}
                disabled={isLoginPending || !loginUsername}
              >
                {isLoginPending ? t.auth.loggingIn : t.auth.loginButton}
              </button>
            ) : (
              <button
                className="btn w-full bg-[#39FF14] hover:bg-[#39FF14]/80 !text-black border-none font-bold rounded-lg uppercase tracking-wide disabled:bg-gray-600 disabled:text-gray-400"
                onClick={handleRegister}
                disabled={isRegisterPending || !registerData.username}
              >
                {isRegisterPending ? t.auth.creatingAccount : t.auth.registerButton}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
