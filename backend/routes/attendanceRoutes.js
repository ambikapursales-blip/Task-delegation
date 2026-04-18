const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get attendance records
// @route   GET /api/attendance
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, date, employeeId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (date) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      query.date = dateObj;
    }

    if (employeeId) {
      query.employee = employeeId;
    } else if (
      req.user.role === "Sales Executive" ||
      req.user.role === "Coordinator"
    ) {
      query.employee = req.user._id;
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate("employee", "name email employeeId")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    res
      .status(200)
      .json({ success: true, total, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Mark attendance
// @route   POST /api/attendance
router.post("/", protect, async (req, res) => {
  try {
    const { date, status, remarks } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { employee: req.user._id, date: attendanceDate },
      { status, remarks, updatedAt: new Date() },
      { upsert: true, new: true },
    );

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate(
      "employee",
      "name email",
    );

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
