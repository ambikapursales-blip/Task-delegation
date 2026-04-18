const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get activity logs
// @route   GET /api/activity
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, type } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) {
      query.user = userId;
    } else if (req.user.role !== "Admin" && req.user.role !== "HR") {
      query.user = req.user._id;
    }

    if (type) query.type = type;

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate("user", "name email role")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, total, count: activities.length, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get single activity
// @route   GET /api/activity/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    res.status(200).json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
