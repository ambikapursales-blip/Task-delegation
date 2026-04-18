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
} from "lucide-react";
import { dashboardAPI, reportsAPI } from "@/lib/api";
import Link from "next/link";
import Chart from "chart.js/auto";

/* ─── Design Tokens (kept for Chart.js only — cannot use Tailwind in JS) ── */
const T = {
  pageBg: "#f4f1ec",
  surface: "#faf8f4",
  surfaceAlt: "#ffffff",
  ink1: "#1a1410",
  ink2: "#4a3f35",
  ink3: "#9e8e80",
  ink4: "#c4b8ad",
  terracotta: "#0F6E56",
  terracottaLight: "#E8F5ED",
  terracottaBorder: "#C3E6D6",
  sage: "#4a7c5f",
  sageLight: "#e6f2ec",
  sageBorder: "#b5d5c2",
  indigo: "#3d5a9e",
  indigoLight: "#eaeefc",
  indigoBorder: "#b8c6ee",
  amber: "#c07a1e",
  amberLight: "#fdf3e3",
  amberBorder: "#e8ceaa",
  border1: "#e4ddd4",
  border2: "#d4ccc2",
};

/* ─── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ title, value, icon, trend, accent }) {
  const variants = {
    terracotta: {
      strip: "bg-[#0F6E56]",
      iconBg: "bg-[#E8F5ED] border border-[#C3E6D6] text-[#0F6E56]",
      trendBg: "bg-[#E8F5ED] border border-[#C3E6D6] text-[#0F6E56]",
    },
    sage: {
      strip: "bg-[#4a7c5f]",
      iconBg: "bg-[#e6f2ec] border border-[#b5d5c2] text-[#4a7c5f]",
      trendBg: "bg-[#e6f2ec] border border-[#b5d5c2] text-[#4a7c5f]",
    },
    indigo: {
      strip: "bg-[#3d5a9e]",
      iconBg: "bg-[#eaeefc] border border-[#b8c6ee] text-[#3d5a9e]",
      trendBg: "bg-[#eaeefc] border border-[#b8c6ee] text-[#3d5a9e]",
    },
    amber: {
      strip: "bg-[#c07a1e]",
      iconBg: "bg-[#fdf3e3] border border-[#e8ceaa] text-[#c07a1e]",
      trendBg: "bg-[#fdf3e3] border border-[#e8ceaa] text-[#c07a1e]",
    },
  };
  const v = variants[accent] || variants.indigo;

  return (
    <div className="relative overflow-hidden bg-white border border-[#e4ddd4] rounded-[18px] px-6 py-[22px] shadow-[0_1px_4px_rgba(60,40,20,0.06),0_4px_16px_rgba(60,40,20,0.04)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(60,40,20,0.12)] cursor-default">
      {/* accent strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px] ${v.strip}`}
      />

      <div className="flex justify-between items-start mt-1">
        <div>
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#9e8e80] m-0">
            {title}
          </p>
          <p className="text-[40px] font-normal text-[#1a1410] mt-[6px] mb-[6px] font-['Playfair_Display',serif] tracking-[-0.02em] leading-none">
            {value}
          </p>
          <span
            className={`text-xs font-semibold px-2 py-[2px] rounded-full ${v.trendBg}`}
          >
            {trend}
          </span>
        </div>
        <div className={`p-3 rounded-xl flex-shrink-0 ${v.iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-[#e4ddd4] rounded-[18px] px-7 py-6 shadow-[0_1px_4px_rgba(60,40,20,0.05),0_4px_16px_rgba(60,40,20,0.03)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Section Label ──────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#c4b8ad] m-0 mb-[6px]">
      {children}
    </p>
  );
}

/* ─── Divider ────────────────────────────────────────────────────── */
function Divider() {
  return <div className="h-px bg-[#e4ddd4] my-4" />;
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

  // Filter states for admin
  const [selectedUser, setSelectedUser] = useState("all");
  const [timePeriod, setTimePeriod] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [usersList, setUsersList] = useState([]);

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
        const response = await dashboardAPI.getStats({
          userId: selectedUser === "all" ? undefined : selectedUser,
          status: statusFilter === "all" ? undefined : statusFilter,
          period: timePeriod,
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
          period: timePeriod,
          userId: selectedUser === "all" ? undefined : selectedUser,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        setAnalytics(analyticsRes.data?.analytics || null);
        const activitiesRes = await dashboardAPI.getRecentActivities();
        setRecentActivities(activitiesRes.data?.activities || []);

        // Fetch users for admin filter
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
  }, [timePeriod, selectedUser, statusFilter]);

  useEffect(() => {
    if (!loading && analytics) initializeCharts();
    return () =>
      Object.values(chartInstances.current).forEach((c) => c?.destroy());
  }, [stats, analytics, loading, timePeriod, selectedUser, statusFilter]);

  const initializeCharts = () => {
    const font = { family: "'Lato', sans-serif", size: 12 };
    const tooltipDefaults = {
      backgroundColor: T.surfaceAlt,
      padding: 12,
      titleColor: T.ink1,
      bodyColor: T.ink2,
      borderColor: T.border2,
      borderWidth: 1,
      cornerRadius: 10,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
              backgroundColor: [T.terracotta, T.indigo, T.sage],
              borderColor: T.surfaceAlt,
              borderWidth: 5,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: "72%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: T.ink2,
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
      chartInstances.current.taskTrend = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Completed",
              data: trendData.map((t) => t.completed),
              borderColor: T.terracotta,
              backgroundColor: "rgba(193,83,58,0.08)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: T.terracotta,
              pointBorderColor: T.surfaceAlt,
              pointBorderWidth: 2,
            },
            {
              label: "New Tasks",
              data: trendData.map((t) => t.created),
              borderColor: T.indigo,
              backgroundColor: "rgba(61,90,158,0.06)",
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: T.indigo,
              pointBorderColor: T.surfaceAlt,
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
                color: T.ink2,
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
              grid: { color: "rgba(60,40,20,0.06)" },
              ticks: { color: T.ink3, font },
              border: { display: false },
            },
            x: {
              grid: { display: false },
              ticks: { color: T.ink3, font },
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
                T.terracotta,
                T.indigo,
                T.sage,
                T.amber,
                "#8b5cf6",
              ],
              borderRadius: 6,
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
              grid: { color: "rgba(60,40,20,0.06)" },
              ticks: { color: T.ink3, font },
              border: { display: false },
            },
            y: {
              grid: { display: false },
              ticks: { color: T.ink2, font },
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
        "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@400;500;600;700&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f1ec] flex items-center justify-center font-['Lato',sans-serif]">
        <div className="text-center">
          <div className="text-[28px] font-semibold text-[#0F6E56] mb-3">
            Loading...
          </div>
          <div className="text-sm text-[#9e8e80]">Preparing your dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] font-['Lato',sans-serif] text-[#4a3f35]">
      {/* ── Header ── */}
      <div className="relative px-12 pt-10 pb-9 bg-white border-b border-[#e4ddd4] overflow-hidden">
        {/* dot pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #c4b8ad 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* warm glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -40,
            right: 80,
            width: 320,
            height: 200,
            background:
              "radial-gradient(ellipse, rgba(193,83,58,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex justify-between items-end flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-[0.16em] uppercase text-[#0F6E56] font-bold m-0 mb-[10px]">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="text-[44px] font-normal text-[#1a1410] m-0 mb-2 font-['Playfair_Display',serif] tracking-[-0.02em] leading-[1.1]">
              Dashboard
            </h1>
            <div className="flex items-center gap-[10px]">
              <span className="text-[15px] text-[#9e8e80]">
                Welcome back,{" "}
                <strong className="text-[#1a1410] font-semibold">
                  {user?.name}
                </strong>
              </span>
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase px-3 py-[3px] rounded-full bg-[#E8F5ED] border border-[#C3E6D6] text-[#0F6E56]">
                {user?.role}
              </span>
            </div>
          </div>

          {isAdminOrManager && (
            <Link href="/tasks">
              <button className="flex items-center gap-2 px-[22px] py-[11px] rounded-xl bg-[#0F6E56] border-none text-white text-sm font-semibold cursor-pointer font-['Lato',sans-serif] shadow-[0_2px_8px_rgba(15,110,86,0.3)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(15,110,86,0.35)]">
                <Plus size={16} /> New Task
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="px-12 pt-9 pb-12 max-w-[1440px] mx-auto">
        {error && (
          <div className="mb-6 px-[18px] py-3 rounded-xl bg-[#E8F5ED] border border-[#C3E6D6] text-[#0F6E56] flex items-center gap-[10px] text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── Filters for Admin/Manager ── */}
        {isAdminOrManager && (
          <div className="mb-8 p-4 bg-white border border-[#e4ddd4] rounded-xl">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-[#9e8e80] uppercase tracking-wider mb-2 block">
                  User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4ccc2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
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
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs font-semibold text-[#9e8e80] uppercase tracking-wider mb-2 block">
                  Time Period
                </label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4ccc2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs font-semibold text-[#9e8e80] uppercase tracking-wider mb-2 block">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4ccc2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="inprogress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setSelectedUser("all");
                  setTimePeriod("month");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 text-sm font-medium text-[#9e8e80] hover:text-[#0F6E56] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#c4b8ad] m-0 mb-[14px]">
            At a glance
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <StatCard
              title="Total Tasks"
              value={analytics?.tasks?.total || 0}
              icon={<CheckSquare size={18} />}
              trend="+12% this month"
              accent="indigo"
            />
            <StatCard
              title="Completed"
              value={analytics?.tasks?.completed || 0}
              icon={<CheckCircle2 size={18} />}
              trend={`${completionRate}% rate`}
              accent="terracotta"
            />
            <StatCard
              title="Pending"
              value={analytics?.tasks?.pending || 0}
              icon={<Clock size={18} />}
              trend={
                analytics?.tasks?.pending > 0 ? "Action needed" : "All clear"
              }
              accent="amber"
            />
            {(isAdminOrManager || isHR) && (
              <StatCard
                title="Active Users"
                value={analytics?.users?.active || 0}
                icon={<Users size={18} />}
                trend="Online now"
                accent="sage"
              />
            )}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Progress Overview */}
            <Card>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <SectionLabel>Task breakdown</SectionLabel>
                  <h2 className="m-0 text-[22px] font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                    Progress Overview
                  </h2>
                </div>
                <div className="px-4 py-[6px] rounded-full bg-[#E8F5ED] border border-[#C3E6D6] text-[#0F6E56] text-[13px] font-bold">
                  {completionRate}% done
                </div>
              </div>
              <div className="grid grid-cols-[180px_1fr] gap-7 items-center">
                <div className="relative w-[180px] h-[180px]">
                  <canvas ref={chartRefs.taskProgress} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[30px] font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                      {completionRate}%
                    </span>
                    <span className="text-[10px] text-[#c4b8ad] tracking-[0.1em] font-bold uppercase">
                      Complete
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-[10px]">
                  {[
                    {
                      label: "Completed",
                      value: analytics?.tasks?.completed || 0,
                      valueCls: "text-[#0F6E56]",
                      wrapCls: "bg-[#E8F5ED] border border-[#C3E6D6]",
                    },
                    {
                      label: "Pending",
                      value: analytics?.tasks?.pending || 0,
                      valueCls: "text-[#3d5a9e]",
                      wrapCls: "bg-[#eaeefc] border border-[#b8c6ee]",
                    },
                    {
                      label: "In Progress",
                      value: analytics?.tasks?.inProgress || 0,
                      valueCls: "text-[#4a7c5f]",
                      wrapCls: "bg-[#e6f2ec] border border-[#b5d5c2]",
                    },
                  ].map(({ label, value, valueCls, wrapCls }) => (
                    <div
                      key={label}
                      className={`px-[18px] py-3 rounded-xl flex justify-between items-center ${wrapCls}`}
                    >
                      <span className="text-[13px] text-[#4a3f35] font-medium">
                        {label}
                      </span>
                      <span
                        className={`text-[26px] font-normal font-['Playfair_Display',serif] ${valueCls}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Task Trends */}
            <Card>
              <div className="mb-5">
                <SectionLabel>Activity timeline</SectionLabel>
                <h2 className="m-0 text-[22px] font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                  Task Trends
                </h2>
              </div>
              <div className="relative h-[280px]">
                <canvas ref={chartRefs.taskTrend} />
              </div>
            </Card>

            {/* Department */}
            <Card>
              <div className="mb-5">
                <SectionLabel>By team</SectionLabel>
                <h2 className="m-0 text-[22px] font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                  Department Overview
                </h2>
              </div>
              <div className="relative h-[240px]">
                <canvas ref={chartRefs.departmentStats} />
              </div>
            </Card>

            {/* HR */}
            {isHR && (
              <Card className="!border-[#b8c6ee] !bg-[#eaeefc]">
                <div className="mb-4">
                  <SectionLabel>HR tools</SectionLabel>
                  <h2 className="m-0 text-[22px] font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                    HR Dashboard
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Attendance Records",
                      href: "/attendance",
                      borderCls: "border-[#b8c6ee]",
                      iconColor: "text-[#3d5a9e]",
                    },
                    {
                      label: "Performance Data",
                      href: "/performance",
                      borderCls: "border-[#b5d5c2]",
                      iconColor: "text-[#4a7c5f]",
                    },
                  ].map(({ label, href, borderCls, iconColor }) => (
                    <Link key={href} href={href} className="no-underline">
                      <div
                        className={`px-5 py-4 rounded-xl bg-white border flex justify-between items-center cursor-pointer transition-shadow duration-150 hover:shadow-[0_2px_12px_rgba(0,0,0,0.1)] ${borderCls}`}
                      >
                        <span className="text-sm font-semibold text-[#1a1410]">
                          {label}
                        </span>
                        <ArrowUpRight size={16} className={iconColor} />
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Today's Snapshot */}
            <div className="relative overflow-hidden bg-[#0F6E56] rounded-[18px] px-[26px] py-[22px] shadow-[0_4px_20px_rgba(15,110,86,0.2)]">
              <div className="absolute -top-[30px] -right-[30px] w-[100px] h-[100px] rounded-full bg-white/[0.12] pointer-events-none" />
              <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/[0.07] pointer-events-none" />
              <div className="mb-4">
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/65 m-0 mb-1">
                  Live
                </p>
                <h2 className="m-0 text-lg font-semibold text-white font-['Playfair_Display',serif]">
                  Today's Snapshot
                </h2>
              </div>
              <div className="flex flex-col gap-[10px]">
                {[
                  {
                    label: "Present Today",
                    value: analytics?.users?.active || 0,
                  },
                  {
                    label: "Overdue Tasks",
                    value: analytics?.tasks?.overdue || 0,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="px-4 py-3 rounded-xl bg-white/[0.15] flex justify-between items-center"
                  >
                    <span className="text-[13px] text-white/80 font-medium">
                      {label}
                    </span>
                    <span className="text-[28px] font-normal text-white font-['Playfair_Display',serif]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile */}
            <Card>
              <SectionLabel>Account</SectionLabel>
              <h2 className="m-0 mb-4 text-lg font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                Profile
              </h2>
              <div className="flex items-center gap-[14px] mb-4 pb-4 border-b border-[#e4ddd4]">
                <div className="w-[46px] h-[46px] rounded-full bg-[#E8F5ED] border-2 border-[#C3E6D6] flex items-center justify-center text-[15px] font-bold text-[#0F6E56] flex-shrink-0">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-[#1a1410]">
                    {user?.name}
                  </p>
                  <p className="m-0 text-xs text-[#9e8e80]">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                {[
                  { label: "Department", value: user?.department || "N/A" },
                  { label: "Role", value: user?.role },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                  >
                    <span className="text-xs text-[#c4b8ad] font-bold uppercase tracking-[0.06em]">
                      {label}
                    </span>
                    <span className="text-[13px] text-[#1a1410] font-semibold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/profile" className="no-underline block mt-[18px]">
                <button className="w-full py-[10px] rounded-[10px] bg-transparent border border-[#d4ccc2] text-[#9e8e80] text-[13px] font-semibold cursor-pointer font-['Lato',sans-serif] transition-all duration-150 hover:border-[#0F6E56] hover:text-[#0F6E56] hover:bg-[#E8F5ED]">
                  View Full Profile
                </button>
              </Link>
            </Card>

            {/* Quick Actions */}
            {isAdminOrManager && (
              <Card>
                <SectionLabel>Shortcuts</SectionLabel>
                <h2 className="m-0 mb-4 text-lg font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                  Quick Actions
                </h2>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: "Manage Tasks",
                      href: "/tasks",
                      icon: <CheckSquare size={15} />,
                      wrapCls: "bg-[#eaeefc] border border-[#b8c6ee]",
                      iconCls: "text-[#3d5a9e]",
                    },
                    ...(user?.role === "Admin"
                      ? [
                          {
                            label: "Manage Users",
                            href: "/users",
                            icon: <Users size={15} />,
                            wrapCls: "bg-[#e6f2ec] border border-[#b5d5c2]",
                            iconCls: "text-[#4a7c5f]",
                          },
                        ]
                      : []),
                  ].map(({ label, href, icon, wrapCls, iconCls }) => (
                    <Link key={href} href={href} className="no-underline">
                      <div
                        className={`px-4 py-3 rounded-[10px] flex items-center gap-[10px] cursor-pointer transition-shadow duration-150 hover:shadow-[0_2px_10px_rgba(0,0,0,0.08)] ${wrapCls}`}
                      >
                        <span className={iconCls}>{icon}</span>
                        <span className="text-[13px] text-[#1a1410] font-semibold">
                          {label}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="text-[#c4b8ad] ml-auto"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <SectionLabel>Updates</SectionLabel>
              <h2 className="m-0 mb-4 text-lg font-normal text-[#1a1410] font-['Playfair_Display',serif]">
                Recent Activity
              </h2>
              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="px-[14px] py-[11px] rounded-[10px] bg-[#f4f1ec] border border-[#e4ddd4] border-l-[3px] border-l-[#3d5a9e]"
                  >
                    <p className="m-0 mb-[3px] text-[13px] text-[#1a1410] font-medium">
                      {activity.description}
                    </p>
                    <p className="m-0 text-[11px] text-[#c4b8ad]">
                      {activity.createdAt
                        ? new Date(activity.createdAt).toLocaleString()
                        : "Just now"}
                    </p>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-[13px] text-[#c4b8ad] text-center py-5">
                    No recent activity
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
