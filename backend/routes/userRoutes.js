const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get all users
// @route   GET /api/users
router.get(
  "/",
  protect,
  authorize("Admin", "HR", "Manager"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

// @desc    Get single user
// @route   GET /api/users/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("managerId", "name email");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
router.put("/:id", protect, authorize("Admin", "HR"), async (req, res) => {
  try {
    const { name, email, role, department, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, phone, isActive },
      { new: true, runValidators: true },
    ).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
router.delete("/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get team members
// @route   GET /api/users/:id/team
router.get("/:id/team", protect, async (req, res) => {
  try {
    const teamMembers = await User.find({ managerId: req.params.id }).select(
      "-password",
    );
    res
      .status(200)
      .json({ success: true, count: teamMembers.length, teamMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
