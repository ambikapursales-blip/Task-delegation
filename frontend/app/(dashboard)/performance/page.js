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
  "A+": "#22c55e",
  A: "#84cc16",
  "B+": "#eab308",
  B: "#f97316",
  C: "#ef4444",
  D: "#6366f1",
  F: "#64748b",
};

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
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
      <Alert>
        <AlertDescription>
          You don't have permission to view performance data.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) return <Loading />;

  const getRankColor = (index) => {
    if (index === 0) return "text-yellow-600";
    if (index === 1) return "text-gray-500";
    if (index === 2) return "text-orange-600";
    return "text-slate-600";
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade) => {
    const colors = {
      "A+": "bg-green-100 text-green-800 border-green-300",
      A: "bg-green-100 text-green-800 border-green-300",
      "B+": "bg-blue-100 text-blue-800 border-blue-300",
      B: "bg-blue-100 text-blue-800 border-blue-300",
      C: "bg-yellow-100 text-yellow-800 border-yellow-300",
      D: "bg-orange-100 text-orange-800 border-orange-300",
      F: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[grade] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getCompletionBarColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getCompletionTextColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800 mb-1">{label}</p>
          <p className="text-sm text-indigo-600">Assigned: {data?.assigned}</p>
          <p className="text-sm text-green-600">Completed: {data?.completed}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">
            Employee performance metrics and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Leaderboard</CardTitle>
                  <CardDescription>
                    Compare task assignments with completions across employees
                  </CardDescription>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#475569" }}
                          angle={-35}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
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
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="font-semibold text-sm truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                          <div>
                            <p className="text-xs text-slate-500">Completion</p>
                            <p
                              className={`text-2xl font-bold ${getCompletionTextColor(item.completionRate)}`}
                            >
                              {item.completionRate.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>
                              {item.completed}/{item.assigned}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
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
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">
                          #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">
                          Employee
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Assigned
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Completed
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Pending
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Completion %
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">
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
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
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
                                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                                />
                                <div>
                                  <p className="font-medium">
                                    {item?.user?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item?.user?.department || "N/A"} •{" "}
                                    {item?.user?.role || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-indigo-600">
                                {assigned}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-green-600">
                                {completed}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-orange-600">
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
                                <div className="w-24 bg-slate-100 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${getCompletionBarColor(completionRate)}`}
                                    style={{
                                      width: `${Math.min(completionRate, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">
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
                            className="py-8 text-center text-muted-foreground"
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assigned vs Completed Tasks</CardTitle>
                  <CardDescription>
                    Compare task assignments with completions across employees
                  </CardDescription>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#475569" }}
                          angle={-35}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
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
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="font-semibold text-sm truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                          <div>
                            <p className="text-xs text-slate-500">Completion</p>
                            <p
                              className={`text-2xl font-bold ${getCompletionTextColor(item.completionRate)}`}
                            >
                              {item.completionRate.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>
                              {item.completed}/{item.assigned}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
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
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">
                          #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">
                          Employee
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Assigned
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Completed
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Pending
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">
                          Completion %
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">
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
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
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
                                <span className="font-medium">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-indigo-600">
                                {item.assigned}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-green-600">
                                {item.completed}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-orange-600">
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
                                <div className="w-24 bg-slate-100 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${getCompletionBarColor(item.completionRate)}`}
                                    style={{
                                      width: `${Math.min(item.completionRate, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">
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
                            className="py-8 text-center text-muted-foreground"
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
          <Card>
            <CardHeader>
              <CardTitle>Compare Performance</CardTitle>
              <CardDescription>
                Select users to compare their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Users (min 2)</Label>
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
                          className="rounded"
                        />
                        <img
                          src={
                            item?.user?.avatar ||
                            (item?.user?.name === "Test User"
                              ? "https://media.licdn.com/dms/image/v2/D4D35AQFg1T2O6uFFqQ/profile-framedphoto-shrink_200_200/B4DZ2VAojkGcAY-/0/1776321464831?e=1776927600&v=beta&t=ScJJtGxGE9WzGYJtjXpkcvYj-RECD_KumfnxzblzKZk"
                              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${item?.user?.name || "user"}`)
                          }
                          alt={item?.user?.name || "User"}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-sm">{item.user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCompare} className="gap-2">
                  <Users className="h-4 w-4" />
                  Compare Selected
                </Button>
              </div>
            </CardContent>
          </Card>

          {comparisons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparison Results</CardTitle>
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
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="taskRate"
                        fill="#3b82f6"
                        name="Task Completion %"
                      />
                      <Bar
                        dataKey="dwrRate"
                        fill="#22c55e"
                        name="DWR Approval %"
                      />
                      <Bar
                        dataKey="score"
                        fill="#f59e0b"
                        name="Performance Score"
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid gap-4">
                    {comparisons.map((comp) => (
                      <div
                        key={comp.user._id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{comp.user.name}</h3>
                          <Badge className={getGradeColor(comp.user.grade)}>
                            {comp.user.grade || "N/A"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Tasks</p>
                            <p className="font-semibold">
                              {comp.metrics.totalTasks} /{" "}
                              {comp.metrics.completedTasks} completed
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">DWRs</p>
                            <p className="font-semibold">
                              {comp.metrics.totalDWRs} /{" "}
                              {comp.metrics.approvedDWRs} approved
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Task Rate</p>
                            <p className="font-semibold text-blue-600">
                              {comp.metrics.taskCompletionRate?.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Time</p>
                            <p className="font-semibold">
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
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Track performance over time for individual employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <select
                    value={trendUserId}
                    onChange={(e) => setTrendUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1"
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
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                    />
                    <div>
                      <p className="font-semibold">
                        {
                          leaderboard.find(
                            (item) => item.user._id === trendUserId,
                          )?.user?.name
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {
                          leaderboard.find(
                            (item) => item.user._id === trendUserId,
                          )?.user?.department
                        }
                      </p>
                    </div>
                  </div>
                )}
                <Button onClick={fetchData} disabled={!trendUserId}>
                  View Trends
                </Button>
              </div>
            </CardContent>
          </Card>

          {trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tasksCompleted"
                      stroke="#3b82f6"
                      name="Tasks Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="dwrSubmitted"
                      stroke="#22c55e"
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
