"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import TaskBoard from "@/components/TaskBoard";
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
import Toast from "@/components/Toast";
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
  X,
} from "lucide-react";
import { taskAPI, usersAPI, teamAPI } from "@/lib/api";

export default function TasksPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
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
  const [showComments, setShowComments] = useState(null);
  const [showReassign, setShowReassign] = useState(null);
  const [showEscalate, setShowEscalate] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [reassignTo, setReassignTo] = useState("");
  const [escalateTo, setEscalateTo] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [showCompleteInput, setShowCompleteInput] = useState(null);
  const [completionProof, setCompletionProof] = useState("");
  const [expandedTask, setExpandedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    deadline: "",
    assignedTo: [],
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Initialize taskViewTab from URL params to avoid race condition
  const getInitialTab = () => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      const statusMap = {
        completed: "completed",
        pending: "pending",
        inprogress: "inprogress",
        overdue: "overdue",
      };
      if (statusMap[statusParam.toLowerCase()])
        return statusMap[statusParam.toLowerCase()];
    }
    return "all";
  };
  const [taskViewTab, setTaskViewTab] = useState(getInitialTab); // "all", "completed", "inprogress", "pending", "overdue"
  const [dateFilter, setDateFilter] = useState("all"); // "all", "today", "thisWeek", "thisMonth", "custom"
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

  const fetchTasksWithTab = async (tab) => {
    try {
      setLoading(true);
      const filters = {};

      // Add status filter
      if (tab !== "all") {
        if (tab === "completed") filters.status = "Completed";
        else if (tab === "inprogress") filters.status = "In Progress";
        else if (tab === "pending") filters.status = "Pending";
        else if (tab === "overdue") filters.overdue = "true";
      }

      // Add date filter
      if (dateFilter === "today") {
        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        endOfDay.setHours(23, 59, 59, 999);
        filters.startDate = startOfDay.toISOString();
        filters.endDate = endOfDay.toISOString();
      } else if (dateFilter === "thisWeek") {
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
      if (dateFilter === "today") {
        const now = new Date();
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        endOfDay.setHours(23, 59, 59, 999);
        filters.startDate = startOfDay.toISOString();
        filters.endDate = endOfDay.toISOString();
      } else if (dateFilter === "thisWeek") {
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
    setShowCompleteInput(taskId);
  };

  const handleCompleteSubmit = async (taskId) => {
    if (!completionProof.trim()) {
      setError("Please provide completion proof");
      return;
    }

    try {
      await taskAPI.updateTask(taskId, {
        status: "completed",
        completionProof,
      });
      setShowCompleteInput(null);
      setCompletionProof("");
      setSuccess("Task marked as completed successfully");
      fetchTasks();
    } catch (err) {
      setError("Failed to mark task as completed");
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskAPI.deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      assignedTo: Array.isArray(task.assignedTo)
        ? task.assignedTo.map((u) => (typeof u === "object" ? u._id : u))
        : [task.assignedTo],
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.updateTask(editingTask._id, editFormData);
      setSuccess("Task updated successfully");
      setEditingTask(null);
      setEditFormData({
        title: "",
        description: "",
        priority: "Medium",
        deadline: "",
        assignedTo: [],
      });
      fetchTasks();
    } catch (err) {
      setError("Failed to update task");
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
    if (status?.toLowerCase() === "completed") {
      return "bg-green-100";
    }
    // If in progress, show blue
    if (status?.toLowerCase() === "in progress") {
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

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await taskAPI.updateTask(taskId, updates);
      setSuccess("Task updated successfully!");
      fetchTasks();
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskAPI.deleteTask(taskId);
        setSuccess("Task deleted successfully!");
        fetchTasks();
      } catch (err) {
        setError("Failed to delete task");
      }
    }
  };

  const handleTaskCreate = () => {
    setActiveTab("create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Create Task */}
      <div className="sticky top-0 z-30 bg-gradient-to-r  shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
              Tasks
            </h1>
            <p className="text-blue-800 text-base mt-1 font-medium">
              {canAssignTasks ? "Manage all tasks" : "Your assigned tasks"}
            </p>
          </div>
          {canAssignTasks && (
            <Button
              onClick={handleTaskCreate}
              className="bg-indigo-700 text-gray-100 hover:bg-indigo-900 rounded-xl font-bold text-base px-6 py-3 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Toast type="error" message={error} onClose={() => setError("")} />
      )}

      {success && (
        <Toast
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {/* Create Task Modal */}
      {canAssignTasks && activeTab === "create" && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      Create New Task
                    </CardTitle>
                    <CardDescription className="text-white">
                      Assign tasks to team members
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setActiveTab("view")}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="font-semibold">
                      Task Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter task title"
                      required
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="font-semibold">
                      Description
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter task description"
                      className="mt-2 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assignedTo" className="font-semibold">
                      Assign To *
                    </Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-slate-300 rounded-xl p-3">
                      {users.map((u) => (
                        <label
                          key={u._id}
                          className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg"
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
                            className="rounded border-slate-300 w-4 h-4"
                          />
                          <span className="text-sm font-medium">{u.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">
                            {u.role}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="font-semibold">
                        Priority
                      </Label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value,
                          })
                        }
                        className="mt-2 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="deadline" className="font-semibold">
                        Deadline
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deadline: e.target.value,
                          })
                        }
                        className="mt-2 h-11 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Recurring Task Section */}
                  <div className="border-t border-slate-200 pt-4">
                    <Label className="font-semibold mb-3 block">
                      Recurring Task
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="taskType"
                            value="One-time"
                            checked={formData.taskType === "One-time"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                taskType: e.target.value,
                                isRecurring: false,
                              })
                            }
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-sm">One-time</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="taskType"
                            value="One Day"
                            checked={formData.taskType === "One Day"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                taskType: e.target.value,
                                isRecurring: true,
                                recurrencePattern: {
                                  frequency: "daily",
                                  interval: 1,
                                  daysOfWeek: [],
                                  dayOfMonth: 1,
                                },
                              })
                            }
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-sm">One Day</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="taskType"
                            value="Customize"
                            checked={formData.taskType === "Customize"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                taskType: e.target.value,
                                isRecurring: true,
                              })
                            }
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-sm">Customize</span>
                        </label>
                      </div>

                      {formData.taskType === "Customize" && (
                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                          <div>
                            <Label className="text-sm font-medium">
                              Frequency
                            </Label>
                            <select
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
                              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">
                              Interval (every X days/weeks/months)
                            </Label>
                            <Input
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
                              className="mt-1 h-10 rounded-lg"
                            />
                          </div>

                          {formData.recurrencePattern.frequency ===
                            "weekly" && (
                            <div>
                              <Label className="text-sm font-medium">
                                Days of Week
                              </Label>
                              <div className="mt-1 flex gap-2 flex-wrap">
                                {[
                                  "Sunday",
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                ].map((day) => (
                                  <label
                                    key={day}
                                    className="flex items-center space-x-1 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.recurrencePattern.daysOfWeek.includes(
                                        day,
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData({
                                            ...formData,
                                            recurrencePattern: {
                                              ...formData.recurrencePattern,
                                              daysOfWeek: [
                                                ...formData.recurrencePattern
                                                  .daysOfWeek,
                                                day,
                                              ],
                                            },
                                          });
                                        } else {
                                          setFormData({
                                            ...formData,
                                            recurrencePattern: {
                                              ...formData.recurrencePattern,
                                              daysOfWeek:
                                                formData.recurrencePattern.daysOfWeek.filter(
                                                  (d) => d !== day,
                                                ),
                                            },
                                          });
                                        }
                                      }}
                                      className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-xs">
                                      {day.slice(0, 3)}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.recurrencePattern.frequency ===
                            "monthly" && (
                            <div>
                              <Label className="text-sm font-medium">
                                Day of Month
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max="31"
                                value={formData.recurrencePattern.dayOfMonth}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    recurrencePattern: {
                                      ...formData.recurrencePattern,
                                      dayOfMonth: parseInt(e.target.value) || 1,
                                    },
                                  })
                                }
                                className="mt-1 h-10 rounded-lg"
                              />
                            </div>
                          )}

                          <div>
                            <Label className="text-sm font-medium">
                              Recurrence End Date
                            </Label>
                            <Input
                              type="date"
                              value={formData.recurrenceEndDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  recurrenceEndDate: e.target.value,
                                })
                              }
                              className="mt-1 h-10 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold h-11"
                    >
                      Create Task
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("view")}
                      className="rounded-xl h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Edit Task</CardTitle>
                    <CardDescription className="text-white">
                      Update task details
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title" className="font-semibold">
                      Task Title *
                    </Label>
                    <Input
                      id="edit-title"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter task title"
                      required
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description" className="font-semibold">
                      Description
                    </Label>
                    <textarea
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter task description"
                      className="mt-2 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-priority" className="font-semibold">
                      Priority *
                    </Label>
                    <select
                      id="edit-priority"
                      value={editFormData.priority}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          priority: e.target.value,
                        })
                      }
                      className="mt-2 w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-deadline" className="font-semibold">
                      Deadline *
                    </Label>
                    <Input
                      id="edit-deadline"
                      type="date"
                      value={editFormData.deadline}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          deadline: e.target.value,
                        })
                      }
                      required
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-assignedTo" className="font-semibold">
                      Assign To *
                    </Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-slate-300 rounded-xl p-3">
                      {users.map((u) => (
                        <label
                          key={u._id}
                          className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={editFormData.assignedTo.includes(u._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditFormData({
                                  ...editFormData,
                                  assignedTo: [
                                    ...editFormData.assignedTo,
                                    u._id,
                                  ],
                                });
                              } else {
                                setEditFormData({
                                  ...editFormData,
                                  assignedTo: editFormData.assignedTo.filter(
                                    (id) => id !== u._id,
                                  ),
                                });
                              }
                            }}
                            className="rounded border-slate-300 w-4 h-4"
                          />
                          <span className="text-sm font-medium">{u.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">
                            {u.role}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold h-11"
                    >
                      Update Task
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingTask(null)}
                      className="rounded-xl h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Task Board - Main View */}
      {!canAssignTasks || activeTab === "view" ? (
        <>
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Loading tasks...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6 py-6">
              {/* Filter Bar */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-2xl p-5 mb-6 shadow-lg">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-base font-bold text-white">
                      Status:
                    </span>
                    <div className="flex gap-2">
                      {[
                        "all",
                        "completed",
                        "inprogress",
                        "pending",
                        "overdue",
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => setTaskViewTab(status)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
                            taskViewTab === status
                              ? "bg-white text-indigo-600 transform scale-105"
                              : "bg-white/20 text-white hover:bg-white/30"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-base font-bold text-white">
                      Period:
                    </span>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-indigo-600 border-0 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="thisWeek">This Week</option>
                      <option value="thisMonth">This Month</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {canAssignTasks && (
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-base font-bold text-white">
                        User:
                      </span>
                      <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-indigo-600 border-0 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
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
                </div>

                {/* Custom Date Range */}
                {dateFilter === "custom" && (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-white mb-1 block">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-white text-slate-700 border-0 focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-white mb-1 block">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm bg-white text-slate-700 border-0 focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasksToDisplay.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <img
                                src="/nodata.gif"
                                alt="No data"
                                className="w-32 h-32 object-contain"
                              />
                              <p className="text-slate-500 font-medium">
                                No tasks found
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tasksToDisplay.map((task) => {
                          const status =
                            task.status?.toLowerCase() === "completed"
                              ? "Completed"
                              : task.isOverdue
                                ? "Overdue"
                                : task.status?.toLowerCase() === "in progress"
                                  ? "In Progress"
                                  : "Pending";

                          const statusColor =
                            {
                              Completed:
                                "bg-emerald-100 text-emerald-800 border-emerald-300",
                              "In Progress":
                                "bg-blue-100 text-blue-800 border-blue-300",
                              Pending:
                                "bg-amber-100 text-amber-800 border-amber-300",
                              Overdue: "bg-red-100 text-red-800 border-red-300",
                            }[status] ||
                            "bg-slate-100 text-slate-800 border-slate-300";

                          const rowBgColor = getRowBackgroundColor(
                            task.status,
                            task.priority,
                          );

                          return (
                            <>
                              <tr
                                key={task._id}
                                className={`${rowBgColor} border-b border-slate-100 hover:opacity-80 transition-opacity ${canAssignTasks && task.status === "Completed" ? "cursor-pointer" : ""}`}
                                onClick={() =>
                                  canAssignTasks &&
                                  task.status === "Completed" &&
                                  setExpandedTask(
                                    expandedTask === task._id ? null : task._id,
                                  )
                                }
                              >
                                <td className="px-4 py-3 max-w-xs">
                                  <div>
                                    <p className="font-semibold text-slate-800 text-sm truncate">
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 truncate">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
                                  >
                                    {status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}
                                  >
                                    {task.priority}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {task.assignedTo &&
                                    task.assignedTo.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {task.assignedTo
                                          .slice(0, 3)
                                          .map((user, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200"
                                              title={user.name || user}
                                            >
                                              {user.name || "User"}
                                            </span>
                                          ))}
                                        {task.assignedTo.length > 3 && (
                                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                            +{task.assignedTo.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400">
                                        Unassigned
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-slate-600">
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
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-medium ${task.isRecurring ? "text-purple-600 bg-purple-50 px-2 py-1 rounded" : "text-slate-500"}`}
                                  >
                                    {task.taskType || "One-time"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    {(task.assignedBy?._id === user?._id ||
                                      task.assignedBy === user?._id) &&
                                      task.status !== "Completed" && (
                                        <button
                                          onClick={() => handleEdit(task)}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                          title="Edit task"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                          </svg>
                                        </button>
                                      )}
                                    {task.status !== "Completed" && (
                                      <button
                                        onClick={() => handleComplete(task._id)}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                        title="Mark as complete"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(task._id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {showCompleteInput === task._id && (
                                <tr className="bg-emerald-50">
                                  <td colSpan="7" className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                      <label className="text-sm font-medium text-slate-700">
                                        Completion Proof{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={completionProof}
                                        onChange={(e) =>
                                          setCompletionProof(e.target.value)
                                        }
                                        placeholder="Enter proof (URL, description...)"
                                        className="flex-1 max-w-md px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleCompleteSubmit(task._id);
                                          } else if (e.key === "Escape") {
                                            setShowCompleteInput(null);
                                            setCompletionProof("");
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          handleCompleteSubmit(task._id)
                                        }
                                        className="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                      >
                                        Submit
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowCompleteInput(null);
                                          setCompletionProof("");
                                        }}
                                        className="px-4 py-2 text-sm bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {expandedTask === task._id &&
                                canAssignTasks &&
                                task.status === "Completed" && (
                                  <tr className="bg-blue-50">
                                    <td colSpan="7" className="px-4 py-4">
                                      <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-slate-800">
                                          Completion Details
                                        </h4>
                                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                                          <p className="text-xs font-semibold text-slate-600 mb-2">
                                            Completion Proof:
                                          </p>
                                          <p className="text-sm text-slate-700">
                                            {(task.history &&
                                              task.history.find(
                                                (h) => h.status === "Completed",
                                              )?.note) ||
                                              "No completion proof provided"}
                                          </p>
                                          {task.history &&
                                            task.history.find(
                                              (h) => h.status === "Completed",
                                            )?.changedAt && (
                                              <p className="text-xs text-slate-500 mt-2">
                                                Completed on:{" "}
                                                {new Date(
                                                  task.history.find(
                                                    (h) =>
                                                      h.status === "Completed",
                                                  ).changedAt,
                                                ).toLocaleString()}
                                              </p>
                                            )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                            </>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
