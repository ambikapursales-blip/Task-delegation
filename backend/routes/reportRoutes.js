const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getTaskReport,
  getDWRReport,
  getAttendanceReport,
  getPerformanceReport,
  getActivityReport,
  getDashboardAnalytics,
} = require("../controllers/reportController");

// @desc    Get task report
// @route   GET /api/reports/tasks
router.get("/tasks", protect, getTaskReport);

// @desc    Get DWR report
// @route   GET /api/reports/dwr
router.get("/dwr", protect, getDWRReport);

// @desc    Get attendance report
// @route   GET /api/reports/attendance
router.get("/attendance", protect, authorize("Admin", "Manager", "HR"), getAttendanceReport);

// @desc    Get performance report
// @route   GET /api/reports/performance
router.get("/performance", protect, authorize("Admin", "Manager", "HR"), getPerformanceReport);

// @desc    Get activity report
// @route   GET /api/reports/activity
router.get("/activity", protect, getActivityReport);

// @desc    Get dashboard analytics
// @route   GET /api/reports/dashboard-analytics
router.get("/dashboard-analytics", protect, getDashboardAnalytics);

module.exports = router;
