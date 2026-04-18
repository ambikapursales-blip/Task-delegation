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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  FileText,
  TrendingUp,
  User,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { teamAPI } from "@/lib/api";

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [error, setError] = useState("");

  const canViewTeam = ["Admin", "Manager", "HR"].includes(user?.role);

  useEffect(() => {
    if (!canViewTeam) return;
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [membersRes, statsRes] = await Promise.all([
        teamAPI.getMembers(),
        teamAPI.getStats(),
      ]);
      setMembers(membersRes.data?.members || []);
      setStats(statsRes.data?.stats || null);
    } catch (err) {
      setError("Failed to load team data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetails = async (memberId, type) => {
    try {
      let response;
      switch (type) {
        case "tasks":
          response = await teamAPI.getEmployeeTasks(memberId);
          break;
        case "activity":
          response = await teamAPI.getEmployeeActivity(memberId);
          break;
        case "dwr":
          response = await teamAPI.getEmployeeDWRs(memberId);
          break;
        case "performance":
          response = await teamAPI.getEmployeePerformance(memberId);
          break;
      }
      setMemberData(response.data);
    } catch (err) {
      setError(`Failed to load ${type}`);
      console.error(err);
    }
  };

  const handleViewMember = (member, type) => {
    setSelectedMember(member);
    setActiveTab(type);
    fetchMemberDetails(member._id, type);
  };

  if (!canViewTeam) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to view team information.
        </AlertDescription>
      </Alert>
    );
  }

  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade) => {
    const colors = {
      A: "bg-green-100 text-green-800 border-green-300",
      B: "bg-blue-100 text-blue-800 border-blue-300",
      C: "bg-yellow-100 text-yellow-800 border-yellow-300",
      D: "bg-orange-100 text-orange-800 border-orange-300",
      F: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[grade] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your team's performance
          </p>
        </div>
        <Button onClick={fetchTeamData} variant="outline" className="gap-2">
          <Activity className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {/* Team Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeUsers}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks?.totalTasks || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.tasks?.overdueTasks || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <Button
          variant={activeTab === "members" ? "default" : "ghost"}
          onClick={() => {
            setActiveTab("members");
            setSelectedMember(null);
            setMemberData(null);
          }}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Team Members
        </Button>
        {selectedMember && (
          <>
            <Button
              variant={activeTab === "tasks" ? "default" : "ghost"}
              onClick={() => handleViewMember(selectedMember, "tasks")}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Tasks
            </Button>
            <Button
              variant={activeTab === "activity" ? "default" : "ghost"}
              onClick={() => handleViewMember(selectedMember, "activity")}
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Activity
            </Button>
            <Button
              variant={activeTab === "dwr" ? "default" : "ghost"}
              onClick={() => handleViewMember(selectedMember, "dwr")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              DWR
            </Button>
            <Button
              variant={activeTab === "performance" ? "default" : "ghost"}
              onClick={() => handleViewMember(selectedMember, "performance")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Performance
            </Button>
          </>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">
          Loading team data...
        </p>
      ) : activeTab === "members" ? (
        <div className="grid gap-4">
          {members.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No team members found.</AlertDescription>
            </Alert>
          ) : (
            members.map((member) => (
              <Card
                key={member._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewMember(member, "tasks")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-slate-500" />
                        <h3 className="text-lg font-semibold">{member.name}</h3>
                        <Badge variant="outline">{member.role}</Badge>
                        <Badge variant="secondary">{member.department}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Employee ID</p>
                          <p className="font-medium">{member.employeeId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Performance Score</p>
                          <p className={`font-medium ${getPerformanceColor(member.performanceScore)}`}>
                            {member.performanceScore || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Grade</p>
                          <Badge className={getGradeColor(member.grade)}>
                            {member.grade || "N/A"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Login</p>
                          <p className="font-medium">
                            {member.lastLogin
                              ? new Date(member.lastLogin).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                      </div>
                      {member.taskStats && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground">Total Tasks</p>
                              <p className="font-semibold">{member.taskStats.total || 0}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Completed</p>
                              <p className="font-semibold text-green-600">
                                {member.taskStats.completed || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">In Progress</p>
                              <p className="font-semibold text-blue-600">
                                {member.taskStats.inProgress || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Overdue</p>
                              <p className="font-semibold text-red-600">
                                {member.taskStats.overdue || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : selectedMember ? (
        <div className="space-y-4">
          {/* Member Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-slate-500" />
                  <div>
                    <h2 className="text-xl font-semibold">{selectedMember.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedMember.role} • {selectedMember.department}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTab("members");
                    setSelectedMember(null);
                    setMemberData(null);
                  }}
                >
                  Back to Team
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          {activeTab === "tasks" && memberData?.tasks && (
            <div className="grid gap-4">
              {memberData.tasks.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No tasks found for this member.</AlertDescription>
                </Alert>
              ) : (
                memberData.tasks.map((task) => (
                  <Card key={task._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge
                              className={
                                task.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : task.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {task.status}
                            </Badge>
                            <Badge
                              className={
                                task.priority === "Critical"
                                  ? "bg-red-100 text-red-800"
                                  : task.priority === "High"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Deadline:{" "}
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString()
                              : "Not set"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "activity" && memberData?.activities && (
            <div className="grid gap-4">
              {memberData.activities.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No activity found for this member.</AlertDescription>
                </Alert>
              ) : (
                memberData.activities.map((activity) => (
                  <Card key={activity._id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Activity className="h-4 w-4 text-slate-500 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.type} •{" "}
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "dwr" && memberData?.dwrs && (
            <div className="grid gap-4">
              {memberData.dwrs.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No DWRs found for this member.</AlertDescription>
                </Alert>
              ) : (
                memberData.dwrs.map((dwr) => (
                  <Card key={dwr._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <h3 className="font-semibold">
                              {new Date(dwr.date).toLocaleDateString()}
                            </h3>
                            <Badge
                              className={
                                dwr.reviewStatus === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : dwr.reviewStatus === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {dwr.reviewStatus}
                            </Badge>
                            {dwr.isLate && (
                              <Badge className="bg-orange-100 text-orange-800">
                                Late
                              </Badge>
                            )}
                          </div>
                          {dwr.workSummary && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {dwr.workSummary}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Hours: {dwr.totalHoursWorked || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "performance" && memberData?.performance && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  {memberData.performance.period} period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Performance Score</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(memberData.performance.user.performanceScore)}`}>
                      {memberData.performance.user.performanceScore || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Task Completion Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {memberData.performance.taskCompletionRate?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">DWR Approval Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {memberData.performance.dwrApprovalRate?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Completion Time</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {memberData.performance.avgCompletionTime?.toFixed(1) || 0}h
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Tasks</p>
                      <p className="font-semibold">{memberData.performance.totalTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed Tasks</p>
                      <p className="font-semibold text-green-600">{memberData.performance.completedTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total DWRs</p>
                      <p className="font-semibold">{memberData.performance.totalDWRs || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Approved DWRs</p>
                      <p className="font-semibold text-green-600">{memberData.performance.approvedDWRs || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Select a team member to view details.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
