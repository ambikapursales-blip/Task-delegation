const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const DWR = require("../models/DWR");
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/auth");

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
router.get("/stats", protect, async (req, res) => {
  try {
    const { userId, status, period } = req.query;
    let taskStats = {};
    let userStats = {};

    // Build base query for tasks
    let taskQuery = {};
    let dateFilter = {};

    // Apply user filter
    if (userId) {
      taskQuery.assignedTo = userId;
    } else if (
      req.user.role !== "Admin" &&
      req.user.role !== "Manager" &&
      req.user.role !== "HR"
    ) {
      taskQuery.assignedTo = req.user._id;
    }

    // Apply status filter
    if (status) {
      if (status === "completed") {
        taskQuery.status = "Completed";
      } else if (status === "inprogress") {
        taskQuery.status = "In Progress";
      } else if (status === "pending") {
        taskQuery.status = "Pending";
      } else if (status === "overdue") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskQuery.deadline = { $lt: today };
        taskQuery.status = { $ne: "Completed" };
      }
    }

    // Apply period filter
    if (period) {
      const now = new Date();
      let startDate;

      if (period === "week") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (period === "month") {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === "quarter") {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
      } else if (period === "year") {
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
      }

      if (startDate) {
        taskQuery.createdAt = { $gte: startDate };
      }
    }

    // Count tasks based on query
    const allTasksQuery = { ...taskQuery };
    delete allTasksQuery.status; // For total count, remove status filter

    taskStats.total = await Task.countDocuments(
      taskQuery.status ? taskQuery : allTasksQuery,
    );
    taskStats.pending = await Task.countDocuments({
      ...taskQuery,
      status: "Pending",
    });
    taskStats.inProgress = await Task.countDocuments({
      ...taskQuery,
      status: "In Progress",
    });
    taskStats.completed = await Task.countDocuments({
      ...taskQuery,
      status: "Completed",
    });

    // User stats (only for Admin/Manager/HR)
    if (
      req.user.role === "Admin" ||
      req.user.role === "Manager" ||
      req.user.role === "HR"
    ) {
      userStats.total = await User.countDocuments({ role: { $ne: "Admin" } });
      userStats.active = await User.countDocuments({
        isActive: true,
        role: { $ne: "Admin" },
      });
      userStats.inactive = await User.countDocuments({
        isActive: false,
        role: { $ne: "Admin" },
      });
    } else {
      userStats.total = 1;
      userStats.active = 1;
      userStats.inactive = 0;
    }

    res.status(200).json({
      success: true,
      stats: { tasks: taskStats, users: userStats },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get user stats
// @route   GET /api/dashboard/user/:userId
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const tasksCompleted = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });
    const tasksPending = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });
    const tasksInProgress = await Task.countDocuments({
      assignedTo: userId,
      status: "In Progress",
    });

    const user = await User.findById(userId).select(
      "performanceScore grade name email",
    );

    res.status(200).json({
      success: true,
      userStats: {
        user,
        tasksCompleted,
        tasksPending,
        tasksInProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
