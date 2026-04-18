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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-stone-200">
      <div className="flex items-center justify-between h-14 px-6">
        {/* Mobile hamburger menu */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
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
        <div className="flex items-center gap-1">
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-stone-200 mx-1" />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg transition-colors ${
                showMenu
                  ? "bg-stone-100 text-stone-800"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
              }`}
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0F6E56] to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white shadow-sm">
                {initials}
              </div>

              {/* Name + role */}
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-semibold text-stone-800 leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5 leading-none">
                  {user?.role}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 hidden sm:block ${
                  showMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-lg shadow-stone-200/60 overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F6E56] to-emerald-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-stone-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  {/* Role badge */}
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5" />
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <Link href="/profile" onClick={() => setShowMenu(false)}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors text-left">
                      <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                      </div>
                      Profile
                    </button>
                  </Link>

                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center shrink-0">
                      <Settings className="w-3.5 h-3.5 text-stone-500" />
                    </div>
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="p-1.5 border-t border-stone-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    Sign out
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
