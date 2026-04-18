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
        className={`fixed md:relative z-30 h-full w-64 border-r border-[#0F6E56] transition-transform duration-200 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ background: "#0F4A32" }}
      >
        <div className="flex flex-col h-full p-4 pt-16 md:pt-4">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center"
              style={{ background: "#1D9E75" }}
            >
              <span className="font-bold" style={{ color: "#E1F5EE" }}>
                D
              </span>
            </div>
            <div>
              <h1
                className="text-base font-medium"
                style={{ color: "#E1F5EE" }}
              >
                Delegation
              </h1>
              <p className="text-xs" style={{ color: "#5DCAA5" }}>
                {user?.role || "User"}
              </p>
            </div>
          </div>

          {/* Section label */}
          <p
            className="text-[10px] uppercase tracking-widest mb-2 ml-2 font-medium"
            style={{ color: "#1D9E75" }}
          >
            Main Menu
          </p>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="w-full justify-start rounded-lg"
                    style={
                      isActive
                        ? { background: "#1D9E75", color: "#E1F5EE" }
                        : { color: "#9FE1CB" }
                    }
                    onMouseEnter={(e) =>
                      !isActive &&
                      (e.currentTarget.style.background = "#0F6E56")
                    }
                    onMouseLeave={(e) =>
                      !isActive &&
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* AI Assistant */}
          <div
            style={{
              borderTop: "0.5px solid #0F6E56",
              paddingTop: "12px",
              marginTop: "12px",
            }}
          >
            <a
              href="https://deepsikha-ai.vercel.app/ai-assistant"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                className="w-full justify-start rounded-lg"
                style={{
                  color: "#E1F5EE",
                  background: "rgba(29, 158, 117, 0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1D9E75")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(29, 158, 117, 0.2)")
                }
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>
            </a>
          </div>

          {/* Logout */}
          <div style={{ borderTop: "0.5px solid #0F6E56", paddingTop: "12px" }}>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start rounded-lg"
              style={{ color: "#F09575", background: "rgba(216,90,48,0.15)" }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
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
