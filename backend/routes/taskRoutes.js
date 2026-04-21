const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const { protect, authorize } = require("../middleware/auth");
const {
  generateRecurringTasks,
  sendPendingTaskReminders,
} = require("../utils/cronJobs");
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  bulkCreateTasks,
  bulkAssignTasks,
  reassignTask,
  escalateTask,
  addComment,
} = require("../controllers/taskController");

// @desc    Create task
// @route   POST /api/tasks
router.post("/", protect, authorize("Manager", "Admin", "HR"), createTask);

// @desc    Get all tasks
// @route   GET /api/tasks
router.get("/", protect, getTasks);

// @desc    Get task stats
// @route   GET /api/tasks/stats
router.get("/stats", protect, getTaskStats);

// @desc    Bulk create tasks
// @route   POST /api/tasks/bulk
router.post(
  "/bulk",
  protect,
  authorize("Manager", "Admin", "HR"),
  bulkCreateTasks,
);

// @desc    Bulk assign tasks
// @route   POST /api/tasks/bulk-assign
router.post(
  "/bulk-assign",
  protect,
  authorize("Manager", "Admin", "HR"),
  bulkAssignTasks,
);

// @desc    Manually trigger pending task reminder emails (for testing)
// @route   POST /api/tasks/test/reminders
router.post(
  "/test/reminders",
  protect,
  authorize("Admin", "Manager"),
  async (req, res) => {
    try {
      await sendPendingTaskReminders();
      res.json({
        success: true,
        message: "Pending task reminder emails sent successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error sending reminder emails",
        error: error.message,
      });
    }
  },
);

// @desc    Get single task
// @route   GET /api/tasks/:id
router.get("/:id", protect, getTask);

// @desc    Update task
// @route   PUT /api/tasks/:id
router.put("/:id", protect, updateTask);

// @desc    Reassign task
// @route   PUT /api/tasks/:id/reassign
router.put(
  "/:id/reassign",
  protect,
  authorize("Manager", "Admin", "HR"),
  reassignTask,
);

// @desc    Escalate task
// @route   PUT /api/tasks/:id/escalate
router.put(
  "/:id/escalate",
  protect,
  authorize("Manager", "Admin", "HR"),
  escalateTask,
);

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
router.post("/:id/comments", protect, addComment);

// @desc    Delete task
// @route   DELETE /api/tasks/:id
router.delete("/:id", protect, authorize("Manager", "Admin"), deleteTask);

// @desc    Manually trigger recurring task generation (for testing)
// @route   POST /api/tasks/generate/recurring
router.post(
  "/generate/recurring",
  protect,
  authorize("Admin"),
  async (req, res) => {
    try {
      await generateRecurringTasks();
      res.json({
        success: true,
        message: "Recurring tasks generated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error generating recurring tasks",
        error: error.message,
      });
    }
  },
);

// @desc    Manually trigger pending task reminder emails (for testing)
// @route   POST /api/tasks/test/reminders
router.post(
  "/test/reminders",
  protect,
  authorize("Admin", "Manager"),
  async (req, res) => {
    try {
      await sendPendingTaskReminders();
      res.json({
        success: true,
        message: "Pending task reminder emails sent successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error sending reminder emails",
        error: error.message,
      });
    }
  },
);

module.exports = router;
