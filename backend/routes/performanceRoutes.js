const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");
const DWR = require("../models/DWR");
const Activity = require("../models/Activity");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get performance data
// @route   GET /api/performance
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== "Admin" && req.user.role !== "HR") {
      query._id = req.user._id;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("name email role performanceScore grade email")
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update performance
// @route   PUT /api/performance/:userId
router.put(
  "/:userId",
  protect,
  authorize("Manager", "Admin", "HR"),
  async (req, res) => {
    try {
      const { performanceScore, grade, remarks } = req.body;

      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { performanceScore, grade },
        { new: true, runValidators: true },
      ).select("-password");

      await Activity.create({
        user: req.user._id,
        type: "performance_updated",
        description: `Performance updated for ${user.name}`,
        entityId: user._id,
        entityType: "User",
      });

      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

// @desc    Get performance leaderboard
// @route   GET /api/performance/leaderboard
router.get(
  "/leaderboard",
  protect,
  authorize("Admin", "Manager", "HR"),
  async (req, res) => {
    try {
      const { period = "month", department, limit = 20 } = req.query;

      let query = { isActive: true };
      if (department) query.department = department;

      // Managers can only see their team
      if (req.user.role === "Manager") {
        const teamMembers = await User.find({ managerId: req.user._id }).select(
          "_id",
        );
        const teamIds = teamMembers.map((m) => m._id);
        query._id = { $in: teamIds };
      }

      // Calculate date range
      const now = new Date();
      let startDate;
      if (period === "week") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (period === "month") {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }

      const users = await User.find(query)
        .select(
          "name email role department performanceScore grade employeeId avatar",
        )
        .sort({ performanceScore: -1 })
        .limit(parseInt(limit));

      // Calculate performance metrics for each user
      const leaderboard = await Promise.all(
        users.map(async (user) => {
          const userId = user._id;

          // Task completion rate - use array query for assignedTo
          const totalTasks = await Task.countDocuments({
            assignedTo: userId,
            createdAt: { $gte: startDate },
          });
          const completedTasks = await Task.countDocuments({
            assignedTo: userId,
            status: "Completed",
            createdAt: { $gte: startDate },
          });

          // DWR approval rate
          const totalDWRs = await DWR.countDocuments({
            employee: userId,
            date: { $gte: startDate },
          });
          const approvedDWRs = await DWR.countDocuments({
            employee: userId,
            reviewStatus: "Approved",
            date: { $gte: startDate },
          });

          // Overdue tasks
          const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            deadline: { $lt: new Date() },
            status: { $nin: ["Completed", "Cancelled"] },
          });

          return {
            user: user.toObject(),
            metrics: {
              taskCompletionRate:
                totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
              dwrApprovalRate:
                totalDWRs > 0 ? (approvedDWRs / totalDWRs) * 100 : 0,
              totalTasks,
              completedTasks,
              totalDWRs,
              approvedDWRs,
              overdueTasks,
            },
          };
        }),
      );

      // Sort by calculated performance score
      leaderboard.sort((a, b) => {
        const scoreA =
          a.metrics.taskCompletionRate * 0.4 +
          a.metrics.dwrApprovalRate * 0.3 +
          a.performanceScore * 0.3;
        const scoreB =
          b.metrics.taskCompletionRate * 0.4 +
          b.metrics.dwrApprovalRate * 0.3 +
          b.performanceScore * 0.3;
        return scoreB - scoreA;
      });

      res.status(200).json({ success: true, leaderboard, period });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// @desc    Compare performance between users
// @route   GET /api/performance/compare
router.get(
  "/compare",
  protect,
  authorize("Admin", "Manager", "HR"),
  async (req, res) => {
    try {
      const { userIds, period = "month" } = req.query;

      if (!userIds) {
        return res.status(400).json({
          success: false,
          message: "userIds query parameter is required",
        });
      }

      const ids = Array.isArray(userIds) ? userIds : userIds.split(",");

      // Calculate date range
      const now = new Date();
      let startDate;
      if (period === "week") {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (period === "month") {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }

      const comparisons = await Promise.all(
        ids.map(async (userId) => {
          const user = await User.findById(userId).select(
            "name email role department performanceScore grade employeeId avatar",
          );

          if (!user) return null;

          // Task metrics - use direct userId query for assignedTo array
          const totalTasks = await Task.countDocuments({
            assignedTo: userId,
            createdAt: { $gte: startDate },
          });
          const completedTasks = await Task.countDocuments({
            assignedTo: userId,
            status: "Completed",
            createdAt: { $gte: startDate },
          });
          const inProgressTasks = await Task.countDocuments({
            assignedTo: userId,
            status: "In Progress",
            createdAt: { $gte: startDate },
          });

          // DWR metrics
          const totalDWRs = await DWR.countDocuments({
            employee: userId,
            date: { $gte: startDate },
          });
          const approvedDWRs = await DWR.countDocuments({
            employee: userId,
            reviewStatus: "Approved",
            date: { $gte: startDate },
          });

          // Average task completion time
          const tasksWithTime = await Task.find({
            assignedTo: { $in: [userId] },
            status: "Completed",
            completedAt: { $exists: true },
            createdAt: { $gte: startDate },
          }).select("createdAt completedAt");

          const avgCompletionTime =
            tasksWithTime.length > 0
              ? tasksWithTime.reduce((acc, task) => {
                  const hours =
                    (task.completedAt - task.createdAt) / (1000 * 60 * 60);
                  return acc + hours;
                }, 0) / tasksWithTime.length
              : 0;

          return {
            user: user.toObject(),
            metrics: {
              taskCompletionRate:
                totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
              dwrApprovalRate:
                totalDWRs > 0 ? (approvedDWRs / totalDWRs) * 100 : 0,
              totalTasks,
              completedTasks,
              inProgressTasks,
              totalDWRs,
              approvedDWRs,
              avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
            },
          };
        }),
      );

      const validComparisons = comparisons.filter((c) => c !== null);

      res
        .status(200)
        .json({ success: true, comparisons: validComparisons, period });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// @desc    Get performance trends for a user
// @route   GET /api/performance/:userId/trends
router.get(
  "/:userId/trends",
  protect,
  authorize("Admin", "Manager", "HR"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { period = "month" } = req.query;

      // Verify user exists and is accessible
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Check authorization
      if (req.user.role === "Manager") {
        const teamMembers = await User.find({ managerId: req.user._id }).select(
          "_id",
        );
        const teamIds = teamMembers.map((m) => m._id);
        if (!teamIds.some((id) => id.toString() === userId)) {
          return res
            .status(403)
            .json({ success: false, message: "Not authorized" });
        }
      }

      // Calculate date range and intervals
      const now = new Date();
      let startDate;
      let intervalDays;

      if (period === "week") {
        startDate = new Date(now.setDate(now.getDate() - 7));
        intervalDays = 1;
      } else if (period === "month") {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        intervalDays = 7;
      } else {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        intervalDays = 30;
      }

      // Generate trend data points
      const trends = [];
      let currentDate = new Date(startDate);

      while (currentDate <= now) {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + intervalDays);

        const tasksCompleted = await Task.countDocuments({
          assignedTo: userId,
          status: "Completed",
          completedAt: { $gte: currentDate, $lt: nextDate },
        });

        const dwrSubmitted = await DWR.countDocuments({
          employee: userId,
          date: { $gte: currentDate, $lt: nextDate },
        });

        trends.push({
          date: currentDate.toISOString().split("T")[0],
          tasksCompleted,
          dwrSubmitted,
        });

        currentDate = nextDate;
      }

      res.status(200).json({ success: true, trends, period });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = router;
