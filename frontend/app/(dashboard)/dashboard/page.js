"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle2,
  AlertCircle,
  Users,
  Plus,
  Clock,
  CheckSquare,
  ArrowUpRight,
  TrendingUp,
  BarChart2,
  List,
  Filter,
  RefreshCw,
} from "lucide-react";
import { dashboardAPI, reportsAPI } from "@/lib/api";
import { taskAPI } from "@/lib/api";
import Link from "next/link";
import Toast from "@/components/Toast";
import Chart from "chart.js/auto";

/* ─── Design Tokens ─────────────────────────────────────────────── */
const T = {
  // Purple theme from sidebar
  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  primaryLight: "#8B5CF6",
  primaryGradStart: "#7C3AED",
  primaryGradEnd: "#5B21B6",
  primaryBg: "#EDE9FE",
  primaryBorder: "#C4B5FD",

  // Page background - light lavender/blue-gray
  pageBg: "#F0F0F7",
  surface: "#FFFFFF",
  surfaceAlt: "#F8F7FF",

  // Text
  ink1: "#1E1B4B",
  ink2: "#3730A3",
  ink3: "#6B7280",
  ink4: "#9CA3AF",

  // Status colors
  emerald: "#059669",
  emeraldLight: "#D1FAE5",
  emeraldBorder: "#6EE7B7",

  amber: "#D97706",
  amberLight: "#FEF3C7",
  amberBorder: "#FCD34D",

  rose: "#DC2626",
  roseLight: "#FEE2E2",
  roseBorder: "#FCA5A5",

  blue: "#2563EB",
  blueLight: "#DBEAFE",
  blueBorder: "#93C5FD",

  // Borders
  border1: "#E5E7EB",
  border2: "#D1D5DB",
};

/* ─── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ title, value, icon, trend, trendUp, accent, href }) {
  const variants = {
    purple: {
      gradient: "from-[#7C3AED] to-[#5B21B6]",
      iconBg: "bg-white/20",
      trendBg: "bg-white/20 text-white",
      textColor: "text-white",
      border: "border-[#7C3AED]/20",
    },
    emerald: {
      gradient: "from-[#059669] to-[#047857]",
      iconBg: "bg-white/20",
      trendBg: "bg-white/20 text-white",
      textColor: "text-white",
      border: "border-[#059669]/20",
    },
    amber: {
      gradient: "from-[#D97706] to-[#B45309]",
      iconBg: "bg-white/20",
      trendBg: "bg-white/20 text-white",
      textColor: "text-white",
      border: "border-[#D97706]/20",
    },
    blue: {
      gradient: "from-[#2563EB] to-[#1D4ED8]",
      iconBg: "bg-white/20",
      trendBg: "bg-white/20 text-white",
      textColor: "text-white",
      border: "border-[#2563EB]/20",
    },
  };
  const v = variants[accent] || variants.purple;

  const cardContent = (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${v.gradient} p-5 shadow-lg ${href ? "hover:-translate-y-1 cursor-pointer" : "cursor-default"} transition-all duration-200`}
    >
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 -left-2 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[11px] font-bold tracking-widest uppercase text-white/70 mb-2">
            {title}
          </p>
          <p
            className="text-4xl font-bold text-white mb-3 leading-none"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {value}
          </p>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.trendBg}`}
          >
            {trendUp ? "↑" : "→"} {trend}
          </span>
        </div>
        <div className={`p-3 rounded-xl ${v.iconBg} text-white`}>{icon}</div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}

/* ─── Card ───────────────────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-2xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Card Header ────────────────────────────────────────────────── */
function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
      <div>
        <h3 className="text-sm font-bold text-[#1E1B4B]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Overdue: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {status}
    </span>
  );
}

/* ─── Priority Badge ─────────────────────────────────────────────── */
function PriorityBadge({ priority }) {
  const map = {
    Critical: "bg-red-100 text-red-700 border-red-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[priority] || "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {priority}
    </span>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalUsers: 0,
    presentToday: 0,
    eventsCount: 0,
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);
  const [dashboardTasks, setDashboardTasks] = useState([]);
  const [viewMode, setViewMode] = useState("table");

  const [selectedUser, setSelectedUser] = useState("all");
  const [timePeriod, setTimePeriod] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [usersList, setUsersList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const chartRefs = {
    taskProgress: useRef(null),
    taskTrend: useRef(null),
    departmentStats: useRef(null),
  };
  const chartInstances = useRef({});

  const isAdminOrManager = ["Admin", "Manager"].includes(user?.role);
  const isHR = user?.role === "HR";
  const completionRate =
    analytics?.tasks?.total > 0
      ? Math.round((analytics.tasks.completed / analytics.tasks.total) * 100)
      : 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let period = timePeriod;
        let customStartDate, customEndDate;

        if (timePeriod === "today") {
          const now = new Date();
          customStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          customStartDate.setHours(0, 0, 0, 0);
          customEndDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          customEndDate.setHours(23, 59, 59, 999);
        } else if (timePeriod === "custom" && startDate && endDate) {
          customStartDate = new Date(startDate);
          customStartDate.setHours(0, 0, 0, 0);
          customEndDate = new Date(endDate);
          customEndDate.setHours(23, 59, 59, 999);
        }

        const response = await dashboardAPI.getStats({
          userId: selectedUser === "all" ? undefined : selectedUser,
          status: statusFilter === "all" ? undefined : statusFilter,
          period,
          startDate: customStartDate?.toISOString(),
          endDate: customEndDate?.toISOString(),
        });
        const statsData = response.data?.stats;
        setStats({
          totalTasks: statsData?.tasks?.total || 0,
          completedTasks: statsData?.tasks?.completed || 0,
          pendingTasks: statsData?.tasks?.pending || 0,
          inProgressTasks: statsData?.tasks?.inProgress || 0,
          totalUsers: statsData?.users?.total || 0,
          presentToday: statsData?.users?.active || 0,
          eventsCount: 0,
        });

        const analyticsRes = await reportsAPI.getDashboardAnalytics({
          period,
          userId: selectedUser === "all" ? undefined : selectedUser,
          status: statusFilter === "all" ? undefined : statusFilter,
          startDate: customStartDate?.toISOString(),
          endDate: customEndDate?.toISOString(),
        });
        setAnalytics(analyticsRes.data?.analytics || null);

        const activitiesRes = await dashboardAPI.getRecentActivities();
        setRecentActivities(activitiesRes.data?.activities || []);

        const tasksRes = await taskAPI.getTasks({
          userId: selectedUser === "all" ? undefined : selectedUser,
          status: statusFilter === "all" ? undefined : statusFilter,
          period,
          startDate: customStartDate?.toISOString(),
          endDate: customEndDate?.toISOString(),
        });
        setDashboardTasks(tasksRes.data?.tasks || []);

        if (isAdminOrManager) {
          try {
            const usersRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/users`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            );
            const usersData = await usersRes.json();
            setUsersList(usersData?.users || []);
          } catch (err) {
            console.error("Failed to fetch users:", err);
          }
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timePeriod, selectedUser, statusFilter, startDate, endDate]);

  useEffect(() => {
    if (!loading && analytics && viewMode === "graphs") initializeCharts();
    return () =>
      Object.values(chartInstances.current).forEach((c) => c?.destroy());
  }, [
    stats,
    analytics,
    loading,
    timePeriod,
    selectedUser,
    statusFilter,
    viewMode,
  ]);

  const initializeCharts = () => {
    const font = { family: "'DM Sans', sans-serif", size: 12 };
    const tooltipDefaults = {
      backgroundColor: "#1E1B4B",
      padding: 12,
      titleColor: "#FFFFFF",
      bodyColor: "#C4B5FD",
      borderColor: "#7C3AED",
      borderWidth: 1,
      cornerRadius: 10,
    };

    if (chartRefs.taskProgress.current) {
      const ctx = chartRefs.taskProgress.current.getContext("2d");
      chartInstances.current.taskProgress?.destroy();
      chartInstances.current.taskProgress = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending", "In Progress"],
          datasets: [
            {
              data: [
                analytics?.tasks?.completed || 0,
                analytics?.tasks?.pending || 0,
                analytics?.tasks?.inProgress || 0,
              ],
              backgroundColor: ["#7C3AED", "#D97706", "#2563EB"],
              borderColor: "#FFFFFF",
              borderWidth: 4,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: "75%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#6B7280",
                font,
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 8,
              },
            },
            tooltip: tooltipDefaults,
          },
        },
      });
    }

    if (
      chartRefs.taskTrend.current &&
      analytics?.trends?.taskCompletion?.length > 0
    ) {
      const ctx = chartRefs.taskTrend.current.getContext("2d");
      chartInstances.current.taskTrend?.destroy();
      const trendData = analytics.trends.taskCompletion;
      const labels = trendData.map((t) =>
        new Date(t.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      );

      // Create gradient
      const gradPurple = ctx.createLinearGradient(0, 0, 0, 300);
      gradPurple.addColorStop(0, "rgba(124,58,237,0.2)");
      gradPurple.addColorStop(1, "rgba(124,58,237,0)");

      const gradBlue = ctx.createLinearGradient(0, 0, 0, 300);
      gradBlue.addColorStop(0, "rgba(37,99,235,0.15)");
      gradBlue.addColorStop(1, "rgba(37,99,235,0)");

      chartInstances.current.taskTrend = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Completed",
              data: trendData.map((t) => t.completed),
              borderColor: "#7C3AED",
              backgroundColor: gradPurple,
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: "#7C3AED",
              pointBorderColor: "#FFFFFF",
              pointBorderWidth: 2,
            },
            {
              label: "New Tasks",
              data: trendData.map((t) => t.created),
              borderColor: "#2563EB",
              backgroundColor: gradBlue,
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: "#2563EB",
              pointBorderColor: "#FFFFFF",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "#6B7280",
                font,
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 8,
              },
            },
            tooltip: { ...tooltipDefaults, mode: "index", intersect: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(124,58,237,0.06)" },
              ticks: { color: "#9CA3AF", font },
              border: { display: false },
            },
            x: {
              grid: { display: false },
              ticks: { color: "#9CA3AF", font },
              border: { display: false },
            },
          },
        },
      });
    }

    if (
      chartRefs.departmentStats.current &&
      analytics?.departments?.length > 0
    ) {
      const ctx = chartRefs.departmentStats.current.getContext("2d");
      chartInstances.current.departmentStats?.destroy();
      const deptData = analytics.departments;
      chartInstances.current.departmentStats = new Chart(ctx, {
        type: "bar",
        data: {
          labels: deptData.map((d) => d.label),
          datasets: [
            {
              label: "Tasks",
              data: deptData.map((d) => d.value),
              backgroundColor: [
                "#7C3AED",
                "#2563EB",
                "#059669",
                "#D97706",
                "#8B5CF6",
              ],
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipDefaults },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: "rgba(124,58,237,0.06)" },
              ticks: { color: "#9CA3AF", font },
              border: { display: false },
            },
            y: {
              grid: { display: false },
              ticks: { color: "#374151", font: { ...font, weight: "600" } },
              border: { display: false },
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    if (!document.getElementById("dash-fonts")) {
      const l = document.createElement("link");
      l.id = "dash-fonts";
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#6B7280]">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  const selectClass =
    "w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg text-sm text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all";
  const inputClass =
    "w-full px-3 py-2 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg text-sm text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all";

  return (
    <div
      className="min-h-screen bg-[#F0F0F7]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Top Header Bar ── */}
      <div className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold tracking-widest uppercase text-[#7C3AED]">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1
            className="text-2xl font-bold text-[#1E1B4B] leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-[#F0F0F7] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white shadow-md shadow-purple-200"
                  : "text-[#9CA3AF] hover:text-[#7C3AED]"
              }`}
            >
              <List size={14} />
              Table
            </button>
            <button
              onClick={() => setViewMode("graphs")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                viewMode === "graphs"
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white shadow-md shadow-purple-200"
                  : "text-[#9CA3AF] hover:text-[#7C3AED]"
              }`}
            >
              <BarChart2 size={14} />
              Graphs
            </button>
          </div>

          {/* Filter toggle */}
          {isAdminOrManager && (
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                showFilters
                  ? "bg-[#EDE9FE] border-[#C4B5FD] text-[#7C3AED]"
                  : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED]"
              }`}
            >
              <Filter size={14} />
              Filters
            </button>
          )}

          {isAdminOrManager && (
            <Link href="/tasks">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white text-xs font-bold shadow-lg shadow-purple-200 hover:-translate-y-0.5 hover:shadow-purple-300 transition-all duration-200">
                <Plus size={15} />
                New Task
              </button>
            </Link>
          )}

          {/* User chip */}
          <div className="flex items-center gap-2 pl-3 border-l border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white text-xs font-bold">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-[#1E1B4B] leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-[#9CA3AF]">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pt-6 pb-10 max-w-[1440px] mx-auto">
        {error && (
          <Toast type="error" message={error} onClose={() => setError("")} />
        )}

        {/* ── Filters Panel ── */}
        {isAdminOrManager && showFilters && (
          <div className="mb-6 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1E1B4B]">Filters</h3>
              <button
                onClick={() => {
                  setSelectedUser("all");
                  setTimePeriod("month");
                  setStatusFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="flex items-center gap-1.5 text-xs text-[#7C3AED] font-semibold hover:underline"
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#9CA3AF] block mb-1.5">
                  User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All Users</option>
                  {usersList
                    .filter((u) => u.role !== "Admin")
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#9CA3AF] block mb-1.5">
                  Period
                </label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className={selectClass}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {timePeriod === "custom" && (
                <>
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-[#9CA3AF] block mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-[#9CA3AF] block mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </>
              )}
              <div className="flex-1 min-w-[160px]">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#9CA3AF] block mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="inprogress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="mb-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#9CA3AF] mb-3">
            Overview
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Tasks"
              value={analytics?.tasks?.total || 0}
              icon={<CheckSquare size={18} />}
              trend="+12% this month"
              trendUp
              accent="purple"
              href="/tasks"
            />
            <StatCard
              title="Completed"
              value={analytics?.tasks?.completed || 0}
              icon={<CheckCircle2 size={18} />}
              trend={`${completionRate}% completion`}
              trendUp
              accent="emerald"
              href="/tasks?status=completed"
            />
            <StatCard
              title="Pending"
              value={analytics?.tasks?.pending || 0}
              icon={<Clock size={18} />}
              trend={
                analytics?.tasks?.pending > 0 ? "Needs attention" : "All clear"
              }
              accent="amber"
              href="/tasks?status=pending"
            />
            {(isAdminOrManager || isHR) && (
              <StatCard
                title="Active Users"
                value={analytics?.users?.active || 0}
                icon={<Users size={18} />}
                trend="Online now"
                accent="blue"
              />
            )}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
          {/* ── Left Column ── */}
          <div className="flex flex-col gap-6">
            {viewMode === "table" ? (
              /* Tasks Table */
              <Card>
                <CardHeader
                  title="Tasks Overview"
                  subtitle={`Showing ${dashboardTasks.length} tasks`}
                  action={
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                      {timePeriod === "all"
                        ? "All Time"
                        : timePeriod.charAt(0).toUpperCase() +
                          timePeriod.slice(1)}
                    </span>
                  }
                />
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F8F7FF]">
                        {[
                          "Task",
                          "Status",
                          "Priority",
                          "Assigned To",
                          "Deadline",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest first:pl-6 last:pr-6"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {dashboardTasks.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] flex items-center justify-center">
                                <CheckSquare
                                  size={28}
                                  className="text-[#C4B5FD]"
                                />
                              </div>
                              <p className="text-sm font-semibold text-[#9CA3AF]">
                                No tasks found
                              </p>
                              <p className="text-xs text-[#C4B5FD]">
                                Try adjusting your filters
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        dashboardTasks.slice(0, 10).map((task) => {
                          const status =
                            task.status?.toLowerCase() === "completed"
                              ? "Completed"
                              : task.isOverdue
                                ? "Overdue"
                                : task.status?.toLowerCase() === "in progress"
                                  ? "In Progress"
                                  : "Pending";

                          return (
                            <tr
                              key={task._id}
                              className="hover:bg-[#F8F7FF] transition-colors group"
                            >
                              <td className="px-5 py-3.5 pl-6 max-w-xs">
                                <p className="font-semibold text-[#1E1B4B] text-sm truncate">
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">
                                    {task.description}
                                  </p>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <StatusBadge status={status} />
                              </td>
                              <td className="px-5 py-3.5">
                                <PriorityBadge priority={task.priority} />
                              </td>
                              <td className="px-5 py-3.5">
                                {task.assignedTo?.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {task.assignedTo.slice(0, 2).map((u, i) => (
                                      <span
                                        key={i}
                                        className="text-xs font-medium text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md"
                                      >
                                        {u.name || "User"}
                                      </span>
                                    ))}
                                    {task.assignedTo.length > 2 && (
                                      <span className="text-xs font-medium text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
                                        +{task.assignedTo.length - 2}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#C4B5FD]">
                                    Unassigned
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 pr-6">
                                <span className="text-xs font-medium text-[#6B7280]">
                                  {task.deadline
                                    ? new Date(
                                        task.deadline,
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "No deadline"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              /* Graphs View */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doughnut */}
                <Card>
                  <CardHeader
                    title="Task Distribution"
                    subtitle="Status breakdown"
                  />
                  <div className="p-6">
                    <canvas ref={chartRefs.taskProgress} />
                  </div>
                </Card>

                {/* Line Chart */}
                <Card>
                  <CardHeader
                    title="Task Trend"
                    subtitle="Completion over time"
                  />
                  <div className="p-6" style={{ height: 280 }}>
                    <canvas ref={chartRefs.taskTrend} />
                  </div>
                </Card>

                {/* Bar Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader
                    title="Department Statistics"
                    subtitle="Tasks per department"
                  />
                  <div className="p-6" style={{ height: 260 }}>
                    <canvas ref={chartRefs.departmentStats} />
                  </div>
                </Card>
              </div>
            )}

            {/* HR Tools */}
            {isHR && (
              <Card>
                <CardHeader
                  title="HR Dashboard"
                  subtitle="Quick access to HR tools"
                />
                <div className="p-5 grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Attendance Records",
                      href: "/attendance",
                      icon: "📋",
                    },
                    {
                      label: "Performance Data",
                      href: "/performance",
                      icon: "📊",
                    },
                  ].map(({ label, href, icon }) => (
                    <Link key={href} href={href} className="no-underline">
                      <div className="px-4 py-4 rounded-xl bg-[#F8F7FF] border border-[#E5E7EB] flex items-center justify-between hover:border-[#C4B5FD] hover:bg-[#EDE9FE] transition-all group">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{icon}</span>
                          <span className="text-sm font-semibold text-[#1E1B4B]">
                            {label}
                          </span>
                        </div>
                        <ArrowUpRight
                          size={16}
                          className="text-[#C4B5FD] group-hover:text-[#7C3AED] transition-colors"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-5">
            {/* Today's Snapshot */}
            <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] shadow-xl shadow-purple-200">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-1">
                  Live
                </p>
                <h2
                  className="text-base font-bold text-white mb-4"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Today's Snapshot
                </h2>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      label: "Present Today",
                      value: analytics?.users?.active || 0,
                      icon: "👥",
                    },
                    {
                      label: "Overdue Tasks",
                      value: analytics?.tasks?.overdue || 0,
                      icon: "⚠️",
                    },
                  ].map(({ label, value, icon }) => (
                    <div
                      key={label}
                      className="px-4 py-3 rounded-xl bg-white/15 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{icon}</span>
                        <span className="text-xs font-semibold text-white/80">
                          {label}
                        </span>
                      </div>
                      <span
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Completion ring */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white/70">
                      Completion Rate
                    </span>
                    <span className="text-sm font-bold text-white">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <Card>
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#C4B5FD] mb-3">
                  Account
                </p>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F3F4F6]">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E1B4B]">
                      {user?.name}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: "Department", value: user?.department || "N/A" },
                    { label: "Role", value: user?.role },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4B5FD]">
                        {label}
                      </span>
                      <span className="text-xs font-semibold text-[#1E1B4B]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/profile" className="no-underline block mt-4">
                  <button className="w-full py-2.5 rounded-xl bg-[#F8F7FF] border border-[#E5E7EB] text-[#7C3AED] text-xs font-bold hover:bg-[#EDE9FE] hover:border-[#C4B5FD] transition-all duration-150">
                    View Full Profile
                  </button>
                </Link>
              </div>
            </Card>

            {/* Quick Actions */}
            {isAdminOrManager && (
              <Card>
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#C4B5FD] mb-3">
                    Shortcuts
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        label: "Manage Tasks",
                        href: "/tasks",
                        icon: <CheckSquare size={15} />,
                        color: "text-[#7C3AED] bg-[#EDE9FE]",
                      },
                      ...(user?.role === "Admin"
                        ? [
                            {
                              label: "Manage Users",
                              href: "/users",
                              icon: <Users size={15} />,
                              color: "text-[#2563EB] bg-[#DBEAFE]",
                            },
                          ]
                        : []),
                    ].map(({ label, href, icon, color }) => (
                      <Link key={href} href={href} className="no-underline">
                        <div className="px-4 py-3 rounded-xl bg-[#F8F7FF] border border-[#E5E7EB] flex items-center gap-3 hover:border-[#C4B5FD] hover:bg-[#EDE9FE] transition-all group cursor-pointer">
                          <span className={`p-1.5 rounded-lg ${color}`}>
                            {icon}
                          </span>
                          <span className="text-sm font-semibold text-[#1E1B4B] flex-1">
                            {label}
                          </span>
                          <ArrowUpRight
                            size={14}
                            className="text-[#C4B5FD] group-hover:text-[#7C3AED] transition-colors"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#C4B5FD] mb-1">
                  Updates
                </p>
                <h3 className="text-sm font-bold text-[#1E1B4B] mb-3">
                  Recent Activity
                </h3>
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {recentActivities.slice(0, 5).map((activity, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 rounded-xl bg-[#F8F7FF] border border-[#E5E7EB] border-l-2 border-l-[#7C3AED]"
                    >
                      <p className="text-xs font-semibold text-[#1E1B4B] mb-0.5 leading-snug">
                        {activity.description}
                      </p>
                      <p className="text-[10px] text-[#C4B5FD]">
                        {activity.createdAt
                          ? new Date(activity.createdAt).toLocaleString()
                          : "Just now"}
                      </p>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="text-xs text-[#C4B5FD] text-center py-6">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
