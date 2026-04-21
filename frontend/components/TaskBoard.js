"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Search,
  Filter,
  SortAsc,
  Plus,
  User,
  Calendar,
  Tag,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TaskBoard = ({
  tasks = [],
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sortBy, setSortBy] = useState("deadline");
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Status configuration with colors matching the image
  const statusConfig = {
    Pending: {
      label: "Pending",
      color: "bg-orange-50",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
      textColor: "text-orange-600",
      dotColor: "bg-orange-500",
      icon: Clock,
      count: 0,
    },
    "In Progress": {
      label: "In Progress",
      color: "bg-blue-50",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      textColor: "text-blue-600",
      dotColor: "bg-blue-500",
      icon: Zap,
      count: 0,
    },
    Completed: {
      label: "Completed",
      color: "bg-emerald-50",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      textColor: "text-emerald-600",
      dotColor: "bg-emerald-500",
      icon: CheckCircle2,
      count: 0,
    },
    Overdue: {
      label: "OverDue",
      color: "bg-red-50",
      badgeColor: "bg-red-100 text-red-800 border-red-300",
      textColor: "text-red-600",
      dotColor: "bg-red-500",
      icon: AlertCircle,
      count: 0,
    },
  };

  // Determine task status
  const getTaskStatus = (task) => {
    if (task.status === "Completed") return "Completed";
    if (task.isOverdue) return "Overdue";
    if (task.status === "In Progress") return "In Progress";
    return "Pending";
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const taskStatus = getTaskStatus(task);
      const matchesStatus = !selectedStatus || taskStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      if (sortBy === "deadline") {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === "priority") {
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (
          (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
        );
      }
      return 0;
    });

    return filtered;
  }, [tasks, searchQuery, selectedStatus, sortBy]);

  // Count tasks by status
  const statusCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      "In Progress": 0,
      Completed: 0,
      Overdue: 0,
    };
    tasks.forEach((task) => {
      const status = getTaskStatus(task);
      counts[status]++;
    });
    return counts;
  }, [tasks]);

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "bg-red-100 text-red-800 border-red-300",
      High: "bg-orange-100 text-orange-800 border-orange-300",
      Medium: "bg-amber-100 text-amber-800 border-amber-300",
      Low: "bg-green-100 text-green-800 border-green-300",
    };
    return colors[priority] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const daysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    return `${diffDays} days from now`;
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Task Board</h1>
          <p className="text-slate-600">
            Manage and track all your tasks in one place
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 space-y-4 lg:space-y-0">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="rounded-xl border-slate-200 hover:bg-slate-100 h-12"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                {filterOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-slate-200 z-10 p-3 min-w-max">
                    <button
                      onClick={() => {
                        setSelectedStatus(null);
                        setFilterOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      All Status
                    </button>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedStatus(key);
                          setFilterOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                      >
                        {config.label} ({statusCounts[key]})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => setSortBy("deadline")}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    sortBy === "deadline"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Deadline
                </button>
                <button
                  onClick={() => setSortBy("priority")}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    sortBy === "priority"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Priority
                </button>
              </div>

              <Button
                onClick={onTaskCreate}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl h-12 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div
                key={key}
                onClick={() =>
                  setSelectedStatus(selectedStatus === key ? null : key)
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedStatus === key
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      {config.label}
                    </p>
                    <p className={`text-2xl font-bold ${config.textColor}`}>
                      {statusCounts[key]}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${config.badgeColor.split(" ")[0]}`}
                  >
                    <config.icon
                      className="h-6 w-6"
                      style={{ color: config.textColor.split("-")[1] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                No tasks found
              </h3>
              <p className="text-slate-500">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Create your first task to get started"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const taskStatus = getTaskStatus(task);
              const statusInfo = statusConfig[taskStatus];

              return (
                <div
                  key={task._id}
                  onClick={() =>
                    setSelectedTask(selectedTask === task._id ? null : task._id)
                  }
                  className={`p-5 rounded-2xl border-l-4 transition-all cursor-pointer hover:shadow-lg ${
                    selectedStatus === taskStatus
                      ? "bg-white shadow-md border-b-2 border-r-2"
                      : "bg-white border-b border-r border-slate-200"
                  }`}
                  style={{ borderLeftColor: statusInfo.dotColor }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge className={`ml-2 ${statusInfo.badgeColor} border`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Task metadata */}
                  <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-slate-100">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>

                    {task.deadline && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(task.deadline)}
                      </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                        <Tag className="h-3.5 w-3.5" />
                        {task.tags[0]}
                      </div>
                    )}

                    <span className="text-xs text-slate-500 px-3 py-1.5 bg-slate-50 rounded-full">
                      {daysUntilDeadline(task.deadline)}
                    </span>
                  </div>

                  {/* Assignees */}
                  {task.assignedTo && task.assignedTo.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-4 w-4 text-slate-500" />
                      <div className="flex gap-1">
                        {task.assignedTo.slice(0, 3).map((user, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                            title={user.name || user}
                          >
                            {user.name ? user.name[0] : "U"}
                          </div>
                        ))}
                        {task.assignedTo.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold">
                            +{task.assignedTo.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {selectedTask === task._id && (
                    <div className="pt-2 flex gap-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-600 hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {task.status !== "Completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-600 hover:bg-emerald-50"
                          onClick={() =>
                            onTaskUpdate?.(task._id, { status: "Completed" })
                          }
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 ml-auto"
                        onClick={() => onTaskDelete?.(task._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
