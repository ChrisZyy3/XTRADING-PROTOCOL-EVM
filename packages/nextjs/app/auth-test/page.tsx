"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useLogin, useRegister } from "~~/hooks/api/useAuth";
import { useAuthStore } from "~~/services/store/authStore";

const AuthTestPage: NextPage = () => {
  const { token, user, isAuthenticated, logout } = useAuthStore();
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();

  const [formData, setFormData] = useState({
    address: "",
    username: "",
    email: "",
    password: "",
  });

  const handleLogin = () => {
    login({
      address: formData.address,
      password: formData.password,
    });
  };

  const handleRegister = () => {
    register({
      address: formData.address,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Auth Module Verification</h1>

      <div className="w-full max-w-md p-4 bg-base-200 rounded-xl shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Current State</h2>
          <div className="mockup-code">
            <pre data-prefix="$">
              <code>Is Authenticated: {isAuthenticated ? "Yes" : "No"}</code>
            </pre>
            <pre data-prefix=">">
              <code>Token: {token ? token.slice(0, 20) + "..." : "None"}</code>
            </pre>
            <pre data-prefix=">">
              <code>User: {JSON.stringify(user, null, 2)}</code>
            </pre>
          </div>
          {isAuthenticated && (
            <button className="btn btn-error mt-4 w-full" onClick={() => logout()}>
              Logout
            </button>
          )}
        </div>

        {!isAuthenticated && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Actions</h2>

            <input
              type="text"
              placeholder="Wallet Address (0x...)"
              className="input input-bordered w-full"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="divider">Register Only</div>

            <input
              type="text"
              placeholder="Username"
              className="input input-bordered w-full"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <div className="flex gap-4 mt-4">
              <button className="btn btn-primary flex-1" onClick={handleLogin} disabled={isLoginPending}>
                {isLoginPending ? "Logging in..." : "Login"}
              </button>
              <button className="btn btn-secondary flex-1" onClick={handleRegister} disabled={isRegisterPending}>
                {isRegisterPending ? "Registering..." : "Register"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTestPage;
