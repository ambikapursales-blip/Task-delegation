"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authAPI } from "@/lib/api";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      login(user, token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-50 overflow-hidden">

      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 py-12 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        {/* Blobs */}
        <div className="absolute w-96 h-96 rounded-full bg-white opacity-10 -top-24 -left-24" />
        <div className="absolute w-64 h-64 rounded-full bg-white opacity-10 bottom-16 -right-20" />
        <div className="absolute w-36 h-36 rounded-full bg-white opacity-10 top-[45%] left-[55%]" />

        {/* Brand */}
        <div className="relative z-10 text-center">
          <div
            className="mx-auto mb-7 flex items-center justify-center rounded-2xl border-2 border-white/30 backdrop-blur-sm"
            style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)" }}
          >
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="font-bold text-4xl text-white tracking-tight leading-tight mb-3">
            Delegation
          </h1>
          <p className="text-sm font-light text-white/70 max-w-[280px] leading-relaxed mx-auto">
            Streamline your workflow with intelligent task delegation and team management.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 mt-12 flex flex-col gap-3 w-full max-w-xs">
          {[
            "Assign tasks with precision and clarity",
            "Real-time progress visibility",
            "Automated accountability tracking",
          ].map((text) => (
            <div
              key={text}
              className="flex items-center gap-3 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0" />
              <span className="text-sm text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-9">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <LogIn className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl text-blue-900 tracking-tight">
              Delegation
            </span>
          </div>

          <h2 className="font-bold text-3xl text-gray-900 tracking-tight mb-1.5">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to your account to continue
          </p>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mb-5">
              <svg
                className="text-red-500 flex-shrink-0 mt-0.5"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm text-red-700 leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2"
              >
                <Mail size={14} className="text-blue-600" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2"
              >
                <Lock size={14} className="text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-11 px-3.5 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 flex items-center bg-transparent border-none cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-7 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-semibold rounded-xl tracking-wide shadow-[0_4px_14px_rgba(26,86,219,0.35)] transition-all duration-150 hover:opacity-90 hover:shadow-[0_6px_20px_rgba(26,86,219,0.42)] hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer border-none"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-7 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
              Demo Credentials
            </p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 font-mono text-xs text-blue-800 leading-relaxed">
              test@example.com
              <br />
              password123
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}