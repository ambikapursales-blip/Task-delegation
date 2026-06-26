"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { performanceAPI } from "@/lib/api";
import { Loading } from "@/components/loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Trophy, BarChart3, Table2 } from "lucide-react";

const gradeColors = {
  "A+": "#00FF88",
  A: "#84cc16",
  "B+": "#FFB84D",
  B: "#f97316",
  C: "#FF6B6B",
  D: "#B366FF",
  F: "#64748b",
};

const CHART_COLORS = [
  "#B366FF",
  "#00FF88",
  "#FFB84D",
  "#FF6B6B",
  "#00D4FF",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export default function PerformancePage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [period, setPeriod] = useState("month");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [trendUserId, setTrendUserId] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("chart"); // "chart" or "table"

  const canView = ["Admin", "Manager", "HR"].includes(user?.role);

  useEffect(() => {
    if (!canView) return;
    fetchData();
  }, [activeTab, period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      if (activeTab === "leaderboard" || activeTab === "assignvscompleted") {
        const response = await performanceAPI.getLeaderboard({ period });
        setLeaderboard(response.data?.leaderboard || []);
      } else if (activeTab === "compare") {
        if (selectedUsers.length > 0) {
          const response = await performanceAPI.compare({
            period,
            userIds: selectedUsers.join(","),
          });
          setComparisons(response.data?.comparisons || []);
        } else {
          setComparisons([]);
        }
      } else if (activeTab === "trends" && trendUserId) {
        const response = await performanceAPI.getTrends(trendUserId, {
          period,
        });
        setTrends(response.data?.trends || []);
      }
    } catch (error) {
      setError("Failed to fetch performance data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    if (selectedUsers.length < 2) {
      setError("Select at least 2 users to compare");
      return;
    }
    setActiveTab("compare");
  };

  if (!canView) {
    return (
      <Alert className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
        <AlertDescription>
          You don't have permission to view performance data.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) return <Loading />;

  const getRankColor = (index) => {
    if (index === 0) return "text-[#FFB84D]";
    if (index === 1) return "text-white/50";
    if (index === 2) return "text-[#FF6B6B]";
    return "text-white/40";
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-[#00FF88]";
    if (score >= 60) return "text-[#FFB84D]";
    return "text-[#FF6B6B]";
  };

  const getGradeColor = (grade) => {
    const colors = {
      "A+": "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/25",
      A: "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/25",
      "B+": "bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/25",
      B: "bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/25",
      C: "bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]/25",
      D: "bg-[#FF6B6B]/15 text-[#FF6B6B] border-[#FF6B6B]/25",
      F: "bg-[#FF6B6B]/15 text-[#FF6B6B] border-[#FF6B6B]/25",
    };
    return colors[grade] || "bg-white/[0.08] text-white/60 border-white/[0.1]";
  };

  const getCompletionBarColor = (percentage) => {
    if (percentage >= 80) return "bg-[#00FF88]";
    if (percentage >= 60) return "bg-[#FFB84D]";
    if (percentage >= 40) return "bg-[#FF6B6B]";
    return "bg-red-500";
  };

  const getCompletionTextColor = (percentage) => {
    if (percentage >= 80) return "text-[#00FF88]";
    if (percentage >= 60) return "text-[#FFB84D]";
    if (percentage >= 40) return "text-[#FF6B6B]";
    return "text-red-500";
  };

  // Prepare chart data for Assign vs Completed
  const assignVsCompletedData = leaderboard.map((item, index) => ({
    name: item?.user?.name || "Unknown",
    assigned: item?.metrics?.totalTasks || 0,
    completed: item?.metrics?.completedTasks || 0,
    completionRate: item?.metrics?.taskCompletionRate || 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-[#0B1220]/95 backdrop-blur-xl p-3 rounded-lg shadow-lg border border-white/[0.06]">
          <p className="font-semibold text-white/85 mb-1">{label}</p>
          <p className="text-sm text-[#B366FF]">Assigned: {data?.assigned}</p>
          <p className="text-sm text-[#00FF88]">Completed: {data?.completed}</p>
          <p
            className={`text-sm font-bold ${getCompletionTextColor(data?.completionRate)}`}
          >
            Completion: {data?.completionRate?.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white/85">Performance</h1>
          <p className="text-white/50">
            Employee performance metrics and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-white/[0.1] rounded-md text-sm bg-white/[0.05] text-white"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {error && (
        <Alert className="bg-white/[0.04] backdrop-blur-xl border-red-500/30">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/[0.06]">
        <Button
          variant={activeTab === "leaderboard" ? "default" : "ghost"}
          onClick={() => setActiveTab("leaderboard")}
          className="gap-2"
        >
          <Trophy className="h-4 w-4" />
          Leaderboard
        </Button>
        {/* Compare tab hidden - not removed */}
        {/* Trends tab hidden - not removed */}
      </div>

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-glass-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white/85">Performance Leaderboard</CardTitle>
                  <CardDescription className="text-white/50">
                    Compare task assignments with completions across employees
                  </CardDescription>
                </div>
                <div className="flex gap-1 bg-white/[0.08] p-1 rounded-lg">
                  <Button
                    variant={viewMode === "chart" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("chart")}
                    className="gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Chart
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="gap-1"
                  >
                    <Table2 className="h-4 w-4" />
                    Table
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "chart" ? (
                <div className="space-y-6">
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={assignVsCompletedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        barGap={4}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                          angle={-35}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: "13px" }}
                          iconType="rounded"
                        />
                        <Bar
                          dataKey="assigned"
                          name="Assigned"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        >
                          {assignVsCompletedData.map((entry, index) => (
                            <Cell key={`assigned-${index}`} fill="#6366f1" />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="completed"
                          name="Completed"
                          fill="#22c55e"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        >
                          {assignVsCompletedData.map((entry, index) => (
                            <Cell key={`completed-${index}`} fill="#22c55e" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {assignVsCompletedData.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 shadow-glass-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="font-semibold text-sm text-white/85 truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                          <div>
                            <p className="text-xs text-white/50">Completion</p>
                            <p
                              className={`text-2xl font-bold ${getCompletionTextColor(item.completionRate)}`}
                            >
                              {item.completionRate.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right text-xs text-white/50">
                            <p>
                              {item.completed}/{item.assigned}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-white/[0.08] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCompletionBarColor(item.completionRate)}`}
                            style={{
                              width: `${Math.min(item.completionRate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                        <th className="text-left py-3 px-4 font-semibold text-white/40">
                          #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-white/40">
                          Employee
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Assigned
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Completed
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Pending
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Completion %
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-white/40">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((item, index) => {
                        const assigned = item?.metrics?.totalTasks || 0;
                        const completed = item?.metrics?.completedTasks || 0;
                        const pending = assigned - completed;
                        const completionRate =
                          item?.metrics?.taskCompletionRate || 0;
                        const color = CHART_COLORS[index % CHART_COLORS.length];
                        return (
                          <tr
                            key={item?.user?._id || index}
                            className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${getRankColor(index)}`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    item?.user?.avatar ||
                                    (item?.user?.name === "Test User"
                                      ? "https://media.licdn.com/dms/image/v2/D4D35AQFg1T2O6uFFqQ/profile-framedphoto-shrink_200_200/B4DZ2VAojkGcAY-/0/1776321464831?e=1776927600&v=beta&t=ScJJtGxGE9WzGYJtjXpkcvYj-RECD_KumfnxzblzKZk"
                                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${item?.user?.name || "user"}`)
                                  }
                                  alt={item?.user?.name || "User"}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white/[0.1]"
                                />
                                <div>
                                  <p className="font-medium">
                                    {item?.user?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-white/50">
                                    {item?.user?.department || "N/A"} •{" "}
                                    {item?.user?.role || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-[#B366FF]">
                                {assigned}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-[#00FF88]">
                                {completed}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-[#FFB84D]">
                                {pending}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`font-bold ${getCompletionTextColor(completionRate)}`}
                              >
                                {completionRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-white/[0.08] rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${getCompletionBarColor(completionRate)}`}
                                    style={{
                                      width: `${Math.min(completionRate, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-white/50">
                                  {completionRate.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {leaderboard.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-white/50"
                          >
                            No performance data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign vs Completed Tab - removed, now merged into Leaderboard */}
      {activeTab === "assignvscompleted" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-glass-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white/85">Assigned vs Completed Tasks</CardTitle>
                  <CardDescription className="text-white/50">
                    Compare task assignments with completions across employees
                  </CardDescription>
                </div>
                <div className="flex gap-1 bg-white/[0.08] p-1 rounded-lg">
                  <Button
                    variant={viewMode === "chart" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("chart")}
                    className="gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Chart
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="gap-1"
                  >
                    <Table2 className="h-4 w-4" />
                    Table
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "chart" ? (
                <div className="space-y-6">
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={assignVsCompletedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        barGap={4}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                          angle={-35}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: "13px" }}
                          iconType="rounded"
                        />
                        <Bar
                          dataKey="assigned"
                          name="Assigned"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        >
                          {assignVsCompletedData.map((entry, index) => (
                            <Cell key={`assigned-${index}`} fill="#6366f1" />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="completed"
                          name="Completed"
                          fill="#22c55e"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        >
                          {assignVsCompletedData.map((entry, index) => (
                            <Cell key={`completed-${index}`} fill="#22c55e" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {assignVsCompletedData.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 shadow-glass-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="font-semibold text-sm text-white/85 truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                          <div>
                            <p className="text-xs text-white/50">Completion</p>
                            <p
                              className={`text-2xl font-bold ${getCompletionTextColor(item.completionRate)}`}
                            >
                              {item.completionRate.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right text-xs text-white/50">
                            <p>
                              {item.completed}/{item.assigned}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-white/[0.08] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCompletionBarColor(item.completionRate)}`}
                            style={{
                              width: `${Math.min(item.completionRate, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        <th className="text-left py-3 px-4 font-semibold text-white/40">
                          #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-white/40">
                          Employee
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Assigned
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Completed
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Pending
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-white/40">
                          Completion %
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-white/40">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignVsCompletedData.map((item, index) => {
                        const pending = item.assigned - item.completed;
                        return (
                          <tr
                            key={index}
                            className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${getRankColor(index)}`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-medium text-white/85">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-[#B366FF]">
                                {item.assigned}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-[#00FF88]">
                                {item.completed}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-[#FFB84D]">
                                {pending}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`font-bold ${getCompletionTextColor(item.completionRate)}`}
                              >
                                {item.completionRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-white/[0.08] rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${getCompletionBarColor(item.completionRate)}`}
                                    style={{
                                      width: `${Math.min(item.completionRate, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-white/50">
                                  {item.completionRate.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {assignVsCompletedData.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-white/50"
                          >
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compare Tab - hidden but code preserved */}
      {activeTab === "compare" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-glass-sm">
            <CardHeader>
              <CardTitle className="text-white/85">Compare Performance</CardTitle>
              <CardDescription className="text-white/50">
                Select users to compare their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 font-medium">Select Users (min 2)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {leaderboard.map((item) => (
                        <label
                          key={item.user._id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(item.user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([
                                  ...selectedUsers,
                                  item.user._id,
                                ]);
                              } else {
                                setSelectedUsers(
                                  selectedUsers.filter(
                                    (id) => id !== item.user._id,
                                  ),
                                );
                              }
                            }}
                            className="rounded bg-white/[0.05] border-white/30"
                          />
                          <img
                            src={
                              item?.user?.avatar ||
                              (item?.user?.name === "Test User"
                                ? "https://media.licdn.com/dms/image/v2/D4D35AQFg1T2O6uFFqQ/profile-framedphoto-shrink_200_200/B4DZ2VAojkGcAY-/0/1776321464831?e=1776927600&v=beta&t=ScJJtGxGE9WzGYJtjXpkcvYj-RECD_KumfnxzblzKZk"
                                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${item?.user?.name || "user"}`)
                            }
                            alt={item?.user?.name || "User"}
                            className="w-6 h-6 rounded-full object-cover border border-white/[0.1]"
                          />
                          <span className="text-sm text-white/70">{item.user.name}</span>
                        </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCompare} className="gap-2 bg-gradient-to-r from-[#00FF88] to-[#00CC70] text-[#0B1220] hover:opacity-90">
                  <Users className="h-4 w-4" />
                  Compare Selected
                </Button>
              </div>
            </CardContent>
          </Card>

          {comparisons.length > 0 && (
            <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-glass-sm">
              <CardHeader>
                <CardTitle className="text-white/85">Comparison Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={comparisons.map((c) => ({
                        name: c.user.name,
                        taskRate: c.metrics.taskCompletionRate,
                        dwrRate: c.metrics.dwrApprovalRate,
                        score: c.user.performanceScore,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.5)" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0B1220", border: "1px solid rgba(255,255,255,0.06)" }} />
                      <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                      <Bar
                        dataKey="taskRate"
                        fill="#00D4FF"
                        name="Task Completion %"
                      />
                      <Bar
                        dataKey="dwrRate"
                        fill="#00FF88"
                        name="DWR Approval %"
                      />
                      <Bar
                        dataKey="score"
                        fill="#FFB84D"
                        name="Performance Score"
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid gap-4">
                    {comparisons.map((comp) => (
                      <div
                        key={comp.user._id}
                        className="p-4 border border-white/[0.06] rounded-lg bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white/85">{comp.user.name}</h3>
                          <Badge className={getGradeColor(comp.user.grade)}>
                            {comp.user.grade || "N/A"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-white/50">Tasks</p>
                            <p className="font-semibold text-white/85">
                              {comp.metrics.totalTasks} /{" "}
                              {comp.metrics.completedTasks} completed
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50">DWRs</p>
                            <p className="font-semibold text-white/85">
                              {comp.metrics.totalDWRs} /{" "}
                              {comp.metrics.approvedDWRs} approved
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50">Task Rate</p>
                            <p className="font-semibold text-[#00D4FF]">
                              {comp.metrics.taskCompletionRate?.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50">Avg Time</p>
                            <p className="font-semibold text-white/85">
                              {comp.metrics.avgCompletionTime?.toFixed(1)}h
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Trends Tab - hidden but code preserved */}
      {activeTab === "trends" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-glass-sm">
            <CardHeader>
              <CardTitle className="text-white/85">Performance Trends</CardTitle>
              <CardDescription className="text-white/50">
                Track performance over time for individual employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 font-medium">Select User</Label>
                  <select
                    value={trendUserId}
                    onChange={(e) => setTrendUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-white/[0.1] rounded-md text-sm mt-1 bg-white/[0.05] text-white"
                  >
                    <option value="">Select a user</option>
                    {leaderboard.map((item) => (
                      <option key={item.user._id} value={item.user._id}>
                        {item.user.name}
                      </option>
                    ))}
                  </select>
                </div>
                {trendUserId && (
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        leaderboard.find(
                          (item) => item.user._id === trendUserId,
                        )?.user?.avatar ||
                        (leaderboard.find(
                          (item) => item.user._id === trendUserId,
                        )?.user?.name === "Test User"
                          ? "https://media.licdn.com/dms/image/v2/D4D35AQFg1T2O6uFFqQ/profile-framedphoto-shrink_200_200/B4DZ2VAojkGcAY-/0/1776321464831?e=1776927600&v=beta&t=ScJJtGxGE9WzGYJtjXpkcvYj-RECD_KumfnxzblzKZk"
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard.find((item) => item.user._id === trendUserId)?.user?.name || "user"}`)
                      }
                      alt={
                        leaderboard.find(
                          (item) => item.user._id === trendUserId,
                        )?.user?.name || "User"
                      }
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/[0.1]"
                    />
                    <div>
                      <p className="font-semibold text-white/85">
                        {
                          leaderboard.find(
                            (item) => item.user._id === trendUserId,
                          )?.user?.name
                        }
                      </p>
                      <p className="text-sm text-white/50">
                        {
                          leaderboard.find(
                            (item) => item.user._id === trendUserId,
                          )?.user?.department
                        }
                      </p>
                    </div>
                  </div>
                )}
                <Button onClick={fetchData} disabled={!trendUserId} className="bg-gradient-to-r from-[#00FF88] to-[#00CC70] text-[#0B1220] hover:opacity-90">
                  View Trends
                </Button>
              </div>
            </CardContent>
          </Card>

          {trends.length > 0 && (
            <Card className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-glass-sm">
              <CardHeader>
                <CardTitle className="text-white/85">Performance Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0B1220", border: "1px solid rgba(255,255,255,0.06)" }} />
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                    <Line
                      type="monotone"
                      dataKey="tasksCompleted"
                      stroke="#00D4FF"
                      name="Tasks Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="dwrSubmitted"
                      stroke="#00FF88"
                      name="DWR Submitted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
