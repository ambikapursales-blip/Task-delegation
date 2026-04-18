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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  MessageSquare,
  ArrowUp,
  ArrowRightLeft,
  MoreVertical,
  Eye,
  Activity,
} from "lucide-react";
import { taskAPI, usersAPI, teamAPI } from "@/lib/api";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view"); // "create" or "view"
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: [],
    priority: "Medium",
    deadline: "",
    taskType: "One-time",
    isRecurring: false,
    recurrencePattern: {
      frequency: "daily",
      interval: 1,
      daysOfWeek: [],
      dayOfMonth: 1,
    },
    recurrenceEndDate: "",
  });
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showComments, setShowComments] = useState(null);
  const [showReassign, setShowReassign] = useState(null);
  const [showEscalate, setShowEscalate] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [reassignTo, setReassignTo] = useState("");
  const [escalateTo, setEscalateTo] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [taskViewTab, setTaskViewTab] = useState("all"); // "all", "completed", "inprogress", "pending", "overdue"
  const [dateFilter, setDateFilter] = useState("all"); // "all", "thisWeek", "thisMonth", "custom"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userFilter, setUserFilter] = useState(""); // user ID filter

  const canAssignTasks = ["Admin", "Manager"].includes(user?.role);

  useEffect(() => {
    fetchTasks();
    if (canAssignTasks) {
      fetchUsers();
    }
  }, [taskViewTab, dateFilter, startDate, endDate, userFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const filters = {};

      // Add status filter
      if (taskViewTab !== "all") {
        if (taskViewTab === "completed") filters.status = "Completed";
        else if (taskViewTab === "inprogress") filters.status = "In Progress";
        else if (taskViewTab === "pending") filters.status = "Pending";
        else if (taskViewTab === "overdue") filters.overdue = "true";
      }

      // Add date filter
      if (dateFilter === "thisWeek") {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        filters.startDate = startOfWeek.toISOString();
      } else if (dateFilter === "thisMonth") {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filters.startDate = startOfMonth.toISOString();
      } else if (dateFilter === "custom" && startDate) {
        filters.startDate = new Date(startDate).toISOString();
        if (endDate) {
          filters.endDate = new Date(endDate).toISOString();
        }
      }

      // Add user filter (for admins/managers)
      if (userFilter && canAssignTasks) {
        filters.assignedTo = userFilter;
      }

      const response = await taskAPI.getTasks(filters);
      setTasks(response.data?.tasks || []);
    } catch (err) {
      setError("Failed to load tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data?.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const taskData = {
        ...formData,
        assignedTo:
          formData.assignedTo.length > 0
            ? formData.assignedTo
            : [users[0]?._id],
        deadline:
          formData.deadline ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      };
      await taskAPI.createTask(taskData);
      setSuccess("Task created successfully!");
      setFormData({
        title: "",
        description: "",
        assignedTo: [],
        priority: "Medium",
        deadline: "",
        taskType: "One-time",
        isRecurring: false,
        recurrencePattern: {
          frequency: "daily",
          interval: 1,
          daysOfWeek: [],
          dayOfMonth: 1,
        },
        recurrenceEndDate: "",
      });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
    setShowBulkActions(
      selectedTasks.length > 0 || !selectedTasks.includes(taskId),
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) {
      try {
        await Promise.all(selectedTasks.map((id) => taskAPI.deleteTask(id)));
        setSuccess(`${selectedTasks.length} tasks deleted successfully`);
        setSelectedTasks([]);
        setShowBulkActions(false);
        fetchTasks();
      } catch (err) {
        setError("Failed to delete tasks");
      }
    }
  };

  const handleAddComment = async (taskId) => {
    if (!commentText.trim()) return;
    try {
      await taskAPI.addComment(taskId, { text: commentText });
      setSuccess("Comment added successfully");
      setCommentText("");
      setShowComments(null);
      fetchTasks();
    } catch (err) {
      setError("Failed to add comment");
    }
  };

  const handleReassign = async (taskId) => {
    if (!reassignTo) return;
    try {
      const task = tasks.find((t) => t._id === taskId);
      await taskAPI.reassign(taskId, {
        fromUserId: task.assignedTo[0]?._id,
        toUserId: reassignTo,
        reason: "Reassigned by manager",
      });
      setSuccess("Task reassigned successfully");
      setReassignTo("");
      setShowReassign(null);
      fetchTasks();
    } catch (err) {
      setError("Failed to reassign task");
    }
  };

  const handleEscalate = async (taskId) => {
    if (!escalateTo || !escalationReason.trim()) {
      setError("Please select a user and provide a reason");
      return;
    }
    try {
      await taskAPI.escalate(taskId, {
        escalatedTo: escalateTo,
        reason: escalationReason,
      });
      setSuccess("Task escalated successfully");
      setEscalateTo("");
      setEscalationReason("");
      setShowEscalate(null);
      fetchTasks();
    } catch (err) {
      setError("Failed to escalate task");
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await taskAPI.updateTask(taskId, { status: "completed" });
      fetchTasks();
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskAPI.deleteTask(taskId);
        fetchTasks();
      } catch (err) {
        setError("Failed to delete task");
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "bg-red-100 text-red-800 border-red-300",
      High: "bg-orange-100 text-orange-800 border-orange-300",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Low: "bg-green-100 text-green-800 border-green-300",
    };
    return colors[priority] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusColor = (status) => {
    return status === "completed"
      ? "bg-green-50 border-green-200"
      : "bg-white border-slate-200";
  };

  const getRowBackgroundColor = (status, priority) => {
    // If completed, show green
    if (status === "Completed" || status === "completed") {
      return "bg-green-100";
    }
    // If in progress, show blue
    if (status === "In Progress" || status === "in progress") {
      return "bg-blue-100";
    }
    // If pending, color by priority
    if (priority === "Critical") return "bg-red-100";
    if (priority === "High") return "bg-orange-100";
    if (priority === "Medium") return "bg-yellow-100";
    if (priority === "Low") return "bg-green-100";
    return "bg-white";
  };

  const filteredTasks = canAssignTasks
    ? tasks
    : tasks.filter((task) =>
        Array.isArray(task.assignedTo)
          ? task.assignedTo.some((a) => a._id === user?._id)
          : task.assignedTo?._id === user?._id ||
            task.author?._id === user?._id,
      );

  const tasksToDisplay = filteredTasks;

  return (
    <div className="space-y-6">
      {/* Header with Tab Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {canAssignTasks ? "Manage all tasks" : "Your assigned tasks"}
          </p>
        </div>
        {canAssignTasks && (
          <Button onClick={() => setActiveTab("create")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>

      {/* Status Filters - shown for all users */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTaskViewTab("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            taskViewTab === "all"
              ? "border-b-2 border-[#0F6E56] text-[#0F6E56]"
              : "text-muted-foreground hover:text-slate-900"
          }`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setTaskViewTab("completed")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            taskViewTab === "completed"
              ? "border-b-2 border-[#0F6E56] text-[#0F6E56]"
              : "text-muted-foreground hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="inline h-4 w-1 mr-1" />
          Completed
        </button>
        <button
          onClick={() => setTaskViewTab("inprogress")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            taskViewTab === "inprogress"
              ? "border-b-2 border-[#0F6E56] text-[#0F6E56]"
              : "text-muted-foreground hover:text-slate-900"
          }`}
        >
          <Activity className="inline h-4 w-1 mr-1" />
          In Progress
        </button>
        <button
          onClick={() => setTaskViewTab("pending")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            taskViewTab === "pending"
              ? "border-b-2 border-[#0F6E56] text-[#0F6E56]"
              : "text-muted-foreground hover:text-slate-900"
          }`}
        >
          <Clock className="inline h-4 w-1 mr-1" />
          Pending
        </button>
        <button
          onClick={() => setTaskViewTab("overdue")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            taskViewTab === "overdue"
              ? "border-b-2 border-[#0F6E56] text-[#0F6E56]"
              : "text-muted-foreground hover:text-slate-900"
          }`}
        >
          <AlertCircle className="inline h-4 w-1 mr-1" />
          Overdue
        </button>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Time</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateFilter === "custom" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </>
            )}

            {/* User Filter - only for admins/managers */}
            {canAssignTasks && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assigned To</Label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="">All Users</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTaskViewTab("all");
                setDateFilter("all");
                setStartDate("");
                setEndDate("");
                setUserFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-600">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Create Task Section */}
      {canAssignTasks && activeTab === "create" && (
        <Card className="border-slate-200 shadow-sm bg-slate-50">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>
              Only Admin and Manager can create and assign tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div>
                <Label htmlFor="assignedTo">Assign To *</Label>
                <div className="mt-1 space-y-2 max-h-32 overflow-y-auto border border-slate-300 rounded-md p-2">
                  {users.map((u) => (
                    <label
                      key={u._id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assignedTo: [...formData.assignedTo, u._id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedTo: formData.assignedTo.filter(
                                (id) => id !== u._id,
                              ),
                            });
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm">
                        {u.name} ({u.role})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Task Type Selection */}
              <div>
                <Label htmlFor="taskType">Task Type</Label>
                <select
                  id="taskType"
                  value={formData.taskType}
                  onChange={(e) => {
                    const isRecurring = e.target.value !== "One-time";
                    setFormData({
                      ...formData,
                      taskType: e.target.value,
                      isRecurring,
                    });
                  }}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="One-time">One-time</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* Recurrence Fields */}
              {formData.isRecurring && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
                  <h3 className="font-semibold text-sm text-blue-900">
                    Recurrence Settings
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <select
                        id="frequency"
                        value={formData.recurrencePattern.frequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrencePattern: {
                              ...formData.recurrencePattern,
                              frequency: e.target.value,
                            },
                          })
                        }
                        className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="interval">Repeat Every</Label>
                      <Input
                        id="interval"
                        type="number"
                        min="1"
                        value={formData.recurrencePattern.interval}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrencePattern: {
                              ...formData.recurrencePattern,
                              interval: parseInt(e.target.value) || 1,
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recurrenceEndDate">
                      End Date (Optional)
                    </Label>
                    <Input
                      id="recurrenceEndDate"
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurrenceEndDate: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      Leave empty for indefinite recurrence
                    </p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Create Task
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* View Tasks Section */}
      {!canAssignTasks || activeTab === "view" ? (
        <>
          {/* Bulk Actions Bar */}
          {showBulkActions && selectedTasks.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedTasks.length} task
                      {selectedTasks.length > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTasks([]);
                        setShowBulkActions(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks Table */}
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading tasks...
            </p>
          ) : tasksToDisplay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <img
                src="/nodata.gif"
                alt="No data found"
                className="w-64 h-64 object-contain"
              />
              <p className="text-muted-foreground mt-4">
                {canAssignTasks
                  ? "No tasks found. Create one to get started!"
                  : taskViewTab === "all"
                    ? "No tasks found."
                    : `No ${taskViewTab} tasks found.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {canAssignTasks && (
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedTasks.length === tasksToDisplay.length &&
                            tasksToDisplay.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks(
                                tasksToDisplay.map((t) => t._id),
                              );
                              setShowBulkActions(true);
                            } else {
                              setSelectedTasks([]);
                              setShowBulkActions(false);
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Task Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Deadline
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasksToDisplay.map((task) => (
                    <>
                      <tr
                        key={task._id}
                        className={`border-b border-slate-300 hover:opacity-80 transition-all ${getRowBackgroundColor(
                          task.status,
                          task.priority,
                        )} ${selectedTasks.includes(task._id) ? "ring-2 ring-[#0F6E56]" : ""}`}
                      >
                        {canAssignTasks && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task._id)}
                              onChange={() => handleSelectTask(task._id)}
                              className="rounded border-slate-300"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              task.isRecurring
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : "bg-gray-100 text-gray-800 border border-gray-300"
                            }
                          >
                            {task.taskType || "One-time"}
                            {task.isRecurring && task.recurrencePattern && (
                              <span className="ml-1 text-xs">
                                ({task.recurrencePattern.frequency})
                              </span>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              task.status === "Completed" ||
                              task.status === "completed"
                                ? "bg-green-500 text-white"
                                : task.status === "In Progress" ||
                                    task.status === "in progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {task.status || "Pending"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {Array.isArray(task.assignedTo)
                            ? task.assignedTo.map((a) => a.name).join(", ")
                            : task.assignedTo?.name || "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {task.deadline ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === task._id ? null : task._id,
                              )
                            }
                            className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                          >
                            {expandedRow === task._id ? "Hide" : "Show"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row - Actions and Details */}
                      {expandedRow === task._id && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td
                            colSpan={canAssignTasks ? 7 : 6}
                            className="px-4 py-4"
                          >
                            <div className="space-y-4">
                              {/* Task Details */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {task.assignedBy && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Assigned By
                                    </p>
                                    <p className="font-semibold">
                                      {task.assignedBy?.name}
                                    </p>
                                  </div>
                                )}
                                {task.escalated && (
                                  <div>
                                    <p className="text-xs font-medium text-red-600">
                                      <ArrowUp className="inline h-3 w-3 mr-1" />
                                      Escalated
                                    </p>
                                    <p className="font-semibold text-red-700">
                                      Yes
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Comments */}
                              {task.comments && task.comments.length > 0 && (
                                <div className="p-2 bg-white rounded border border-slate-200">
                                  <p className="font-medium text-slate-700 mb-2">
                                    Comments ({task.comments.length}):
                                  </p>
                                  {task.comments
                                    .slice(-3)
                                    .map((comment, idx) => (
                                      <div key={idx} className="mb-1 text-xs">
                                        <span className="font-semibold">
                                          {comment.user?.name}:
                                        </span>{" "}
                                        {comment.text}
                                      </div>
                                    ))}
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {task.status === "Completed" ||
                                task.status === "completed" ? (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                    disabled
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Completed
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleComplete(task._id)}
                                    className="gap-2"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Complete
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowComments(task._id)}
                                  className="gap-2"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Add Comment
                                </Button>
                                {canAssignTasks && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowReassign(task._id)}
                                      className="gap-2"
                                    >
                                      <ArrowRightLeft className="h-4 w-4" />
                                      Reassign
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowEscalate(task._id)}
                                      className="gap-2 text-orange-600 hover:text-orange-700"
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                      Escalate
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(task._id)}
                                      className="gap-2 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </Button>
                                  </>
                                )}
                              </div>

                              {/* Comment Form */}
                              {showComments === task._id && (
                                <div className="flex gap-2 pt-2 border-t border-slate-200">
                                  <Input
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) =>
                                      setCommentText(e.target.value)
                                    }
                                    className="flex-1"
                                  />
                                  <Button
                                    onClick={() => handleAddComment(task._id)}
                                    size="sm"
                                  >
                                    Send
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowComments(null);
                                      setCommentText("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}

                              {/* Reassign Form */}
                              {showReassign === task._id && (
                                <div className="flex gap-2 items-end pt-2 border-t border-slate-200">
                                  <div className="flex-1">
                                    <Label className="text-xs">
                                      Reassign to:
                                    </Label>
                                    <select
                                      value={reassignTo}
                                      onChange={(e) =>
                                        setReassignTo(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1"
                                    >
                                      <option value="">Select user</option>
                                      {users
                                        .filter(
                                          (u) =>
                                            u._id !== task.assignedTo[0]?._id,
                                        )
                                        .map((u) => (
                                          <option key={u._id} value={u._id}>
                                            {u.name}
                                          </option>
                                        ))}
                                    </select>
                                  </div>
                                  <Button
                                    onClick={() => handleReassign(task._id)}
                                    size="sm"
                                  >
                                    Reassign
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowReassign(null);
                                      setReassignTo("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}

                              {/* Escalate Form */}
                              {showEscalate === task._id && (
                                <div className="space-y-3 pt-2 border-t border-slate-200">
                                  <div>
                                    <Label className="text-xs">
                                      Escalate to:
                                    </Label>
                                    <select
                                      value={escalateTo}
                                      onChange={(e) =>
                                        setEscalateTo(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1"
                                    >
                                      <option value="">
                                        Select manager/admin
                                      </option>
                                      {users
                                        .filter((u) =>
                                          ["Admin", "Manager"].includes(u.role),
                                        )
                                        .map((u) => (
                                          <option key={u._id} value={u._id}>
                                            {u.name} ({u.role})
                                          </option>
                                        ))}
                                    </select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Reason:</Label>
                                    <Input
                                      value={escalationReason}
                                      onChange={(e) =>
                                        setEscalationReason(e.target.value)
                                      }
                                      placeholder="Reason for escalation..."
                                      className="text-sm mt-1"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleEscalate(task._id)}
                                      size="sm"
                                      className="bg-[#0F6E56] hover:bg-[#0C5A45] text-white"
                                    >
                                      Escalate
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setShowEscalate(null);
                                        setEscalateTo("");
                                        setEscalationReason("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
