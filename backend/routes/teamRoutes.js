const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getTeamMembers,
  getEmployeeTasks,
  getEmployeeActivity,
  getEmployeeDWRs,
  getTeamStats,
  getEmployeePerformance,
} = require("../controllers/teamController");

// @desc    Get team members
// @route   GET /api/team/members
router.get("/members", protect, authorize("Admin", "Manager", "HR"), getTeamMembers);

// @desc    Get team stats
// @route   GET /api/team/stats
router.get("/stats", protect, authorize("Admin", "Manager", "HR"), getTeamStats);

// @desc    Get employee's tasks
// @route   GET /api/team/:userId/tasks
router.get("/:userId/tasks", protect, authorize("Admin", "Manager", "HR"), getEmployeeTasks);

// @desc    Get employee's activity
// @route   GET /api/team/:userId/activity
router.get("/:userId/activity", protect, authorize("Admin", "Manager", "HR"), getEmployeeActivity);

// @desc    Get employee's DWRs
// @route   GET /api/team/:userId/dwr
router.get("/:userId/dwr", protect, authorize("Admin", "Manager", "HR"), getEmployeeDWRs);

// @desc    Get employee performance
// @route   GET /api/team/:userId/performance
router.get("/:userId/performance", protect, authorize("Admin", "Manager", "HR"), getEmployeePerformance);

module.exports = router;
