const User = require("../models/User");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const DWR = require("../models/DWR");

// @desc    Get all team members
// @route   GET /api/team/members
exports.getTeamMembers = async (req, res) => {
  try {
    let query = { isActive: true };

    // Managers can only see their team members
    if (req.user.role === "Manager") {
      query.managerId = req.user._id;
    }

    const users = await User.find(query)
      .select("name email role department employeeId lastLogin lastActive isActive performanceScore grade")
      .sort({ name: 1 });

    // Get task counts for each user
    const userIds = users.map((u) => u._id);
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: { $in: userIds } } },
      {
        $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$deadline", new Date()] },
                    { $nin: ["$status", ["Completed", "Cancelled"]] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Merge task stats with users
    const usersWithStats = users.map((user) => {
      const stats = taskStats.find((s) => 
        s._id.some((id) => id.toString() === user._id.toString())
      ) || { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 };
      
      return {
        ...user.toObject(),
        taskStats: stats,
      };
    });

    res.status(200).json({ success: true, members: usersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee's tasks
// @route   GET /api/team/:userId/tasks
exports.getEmployeeTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, priority, page = 1, limit = 20 } = req.query;

    // Verify user exists and is accessible
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check authorization
    if (req.user.role === "Manager") {
      const teamMembers = await User.find({ managerId: req.user._id }).select("_id");
      const teamIds = teamMembers.map((m) => m._id);
      if (!teamIds.some((id) => id.toString() === userId)) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    let query = { assignedTo: { $in: [userId] } };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;
    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role avatar")
      .populate("assignedBy", "name email")
      .populate("assigneeProgress.user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee's activity log
// @route   GET /api/team/:userId/activity
exports.getEmployeeActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user exists and is accessible
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check authorization
    if (req.user.role === "Manager") {
      const teamMembers = await User.find({ managerId: req.user._id }).select("_id");
      const teamIds = teamMembers.map((m) => m._id);
      if (!teamIds.some((id) => id.toString() === userId)) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    const skip = (page - 1) * limit;
    const total = await Activity.countDocuments({ user: userId });
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, count: activities.length, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee's DWRs
// @route   GET /api/team/:userId/dwr
exports.getEmployeeDWRs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Verify user exists and is accessible
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check authorization
    if (req.user.role === "Manager") {
      const teamMembers = await User.find({ managerId: req.user._id }).select("_id");
      const teamIds = teamMembers.map((m) => m._id);
      if (!teamIds.some((id) => id.toString() === userId)) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    let query = { employee: userId };
    if (status) query.reviewStatus = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await DWR.countDocuments(query);
    const dwrs = await DWR.find(query)
      .populate("employee", "name email employeeId")
      .populate("reviewedBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, count: dwrs.length, dwrs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team overview stats
// @route   GET /api/team/stats
exports.getTeamStats = async (req, res) => {
  try {
    let matchQuery = { isActive: true };

    // Managers can only see their team stats
    if (req.user.role === "Manager") {
      matchQuery.managerId = req.user._id;
    }

    const teamMembers = await User.find(matchQuery).select("_id name role department");
    const teamIds = teamMembers.map((m) => m._id);

    // Task stats
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: { $in: teamIds } } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$deadline", new Date()] },
                    { $nin: ["$status", ["Completed", "Cancelled"]] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // DWR stats
    const dwrStats = await DWR.aggregate([
      { $match: { employee: { $in: teamIds } } },
      {
        $group: {
          _id: null,
          totalDWRs: { $sum: 1 },
          approvedDWRs: {
            $sum: { $cond: [{ $eq: ["$reviewStatus", "Approved"] }, 1, 0] },
          },
          pendingDWRs: {
            $sum: { $cond: [{ $eq: ["$reviewStatus", "Pending Review"] }, 1, 0] },
          },
          rejectedDWRs: {
            $sum: { $cond: [{ $eq: ["$reviewStatus", "Rejected"] }, 1, 0] },
          },
        },
      },
    ]);

    // Active users (last 24 hours)
    const activeUsers = await User.countDocuments({
      _id: { $in: teamIds },
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const stats = {
      totalMembers: teamMembers.length,
      activeUsers,
      tasks: taskStats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
      },
      dwrs: dwrStats[0] || {
        totalDWRs: 0,
        approvedDWRs: 0,
        pendingDWRs: 0,
        rejectedDWRs: 0,
      },
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee performance summary
// @route   GET /api/team/:userId/performance
exports.getEmployeePerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = "month" } = req.query;

    // Verify user exists and is accessible
    const user = await User.findById(userId).select(
      "name email role department performanceScore grade employeeId"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check authorization
    if (req.user.role === "Manager") {
      const teamMembers = await User.find({ managerId: req.user._id }).select("_id");
      const teamIds = teamMembers.map((m) => m._id);
      if (!teamIds.some((id) => id.toString() === userId)) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    if (period === "week") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === "month") {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    // Task completion rate
    const totalTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      createdAt: { $gte: startDate },
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      status: "Completed",
      createdAt: { $gte: startDate },
    });

    // DWR submission rate
    const totalDWRs = await DWR.countDocuments({
      employee: userId,
      date: { $gte: startDate },
    });
    const approvedDWRs = await DWR.countDocuments({
      employee: userId,
      reviewStatus: "Approved",
      date: { $gte: startDate },
    });

    // Average completion time (in hours)
    const tasksWithTime = await Task.find({
      assignedTo: { $in: [userId] },
      status: "Completed",
      completedAt: { $exists: true },
      createdAt: { $gte: startDate },
    }).select("createdAt completedAt");

    const avgCompletionTime = tasksWithTime.length > 0
      ? tasksWithTime.reduce((acc, task) => {
          const hours = (task.completedAt - task.createdAt) / (1000 * 60 * 60);
          return acc + hours;
        }, 0) / tasksWithTime.length
      : 0;

    const performance = {
      user: user.toObject(),
      period,
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      dwrApprovalRate: totalDWRs > 0 ? (approvedDWRs / totalDWRs) * 100 : 0,
      totalTasks,
      completedTasks,
      totalDWRs,
      approvedDWRs,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
    };

    res.status(200).json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
