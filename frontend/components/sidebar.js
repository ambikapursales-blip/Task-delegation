"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Calendar,
  Users,
  Bell,
  LogOut,
  Activity,
  BarChart3,
  Sparkles,
} from "lucide-react";

const getAllMenuItems = () => [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    title: "DWR",
    icon: FileText,
    href: "/dwr",
  },
  {
    title: "Events",
    icon: Calendar,
    href: "/events",
  },
  {
    title: "Attendance",
    icon: Activity,
    href: "/attendance",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Performance",
    icon: BarChart3,
    href: "/performance",
  },
];

const ROLE_MENU = {
  Admin: ["Dashboard", "Tasks", "Events", "Attendance", "Users", "Performance"],
  Manager: [
    "Dashboard",
    "Tasks",

    "Events",
    "Attendance",
    "Users",
    "Performance",
  ],
  HR: ["Dashboard", "Tasks", "DWR", "Attendance", "Performance"],
  "Sales Executive": [
    "Dashboard",
    "Tasks",

    "Events",
    "Attendance",
    "Performance",
  ],
  Coordinator: ["Dashboard", "Tasks", "Events", "Attendance", "Performance"],
  It: ["Dashboard", "Tasks", "Events", "Attendance", "Performance"],
};

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const allItems = getAllMenuItems();
  const allowedTitles = ROLE_MENU[user?.role] || [];
  const menuItems = allItems.filter((item) =>
    allowedTitles.includes(item.title),
  );

  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-30 h-full w-64 border-r border-indigo-200 transition-transform duration-200 transform bg-gradient-to-b from-indigo-50 to-purple-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full p-4 pt-16 md:pt-4">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
              <span className="font-bold text-white text-lg">D</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Delegation</h1>
              <p className="text-xs text-slate-600">{user?.role || "User"}</p>
            </div>
          </div>

          {/* Section label */}
          <p className="text-[10px] uppercase tracking-widest mb-3 ml-2 font-bold text-indigo-600">
            Navigation
          </p>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "text-slate-700 hover:bg-indigo-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {item.title}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* AI Assistant */}
          <div className="border-t border-indigo-200 pt-4 mt-4">
            <a
              href="https://deepsikha-ai.vercel.app/ai-assistant"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 hover:from-purple-200 hover:to-indigo-200 transition-all duration-200 font-semibold">
                <Sparkles className="h-5 w-5" />
                AI Assistant
              </button>
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-indigo-200 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 font-semibold"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
