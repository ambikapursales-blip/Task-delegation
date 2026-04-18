const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

// @desc    Get notifications
// @route   GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const skip = (page - 1) * limit;

    let query = { recipient: req.user._id };
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate("sender", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({
        success: true,
        total,
        count: notifications.length,
        notifications,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Mark as read
// @route   PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true },
    );

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
