"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Check,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header({ onMobileMenuToggle, isMobileMenuOpen }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [hasNotifications] = useState(true);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-white via-slate-50 to-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Mobile hamburger menu */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Left spacer — sidebar title fills this area */}
        <div className="flex-1 hidden md:block" />

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full ring-2 ring-white animate-pulse-soft" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-300" />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 leading-none mt-1">
                  {user?.role || "User"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{user?.email}</p>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-200 text-sm font-medium"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-200 text-sm font-medium">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-slate-200 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
