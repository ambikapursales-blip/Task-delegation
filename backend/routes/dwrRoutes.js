const express = require("express");
const router = express.Router();
const DWR = require("../models/DWR");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get DWRs
// @route   GET /api/dwr
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== "Admin" && req.user.role !== "HR") {
      query.employee = req.user._id;
    }

    const total = await DWR.countDocuments(query);
    const dwrs = await DWR.find(query)
      .populate([
        { path: "employee", select: "name email" },
        { path: "completedTasks.task", select: "title" },
        { path: "pendingTasks.task", select: "title" },
      ])
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    res.status(200).json({ success: true, total, count: dwrs.length, dwrs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Create/Submit DWR
// @route   POST /api/dwr
router.post("/", protect, async (req, res) => {
  try {
    const {
      completedTasks,
      pendingTasks,
      workSummary,
      challenges,
      nextDayPlan,
      totalHoursWorked,
    } = req.body;

    const dwr = await DWR.create({
      employee: req.user._id,
      completedTasks,
      pendingTasks,
      workSummary,
      challenges,
      nextDayPlan,
      totalHoursWorked,
      submittedAt: new Date(),
    });

    await Activity.create({
      user: req.user._id,
      type: "dwr_submitted",
      description: `DWR submitted for ${new Date(dwr.date).toDateString()}`,
      entityId: dwr._id,
      entityType: "DWR",
    });

    res.status(201).json({ success: true, dwr });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

// @desc    Get DWRs pending review
// @route   GET /api/dwr/pending-review
router.get(
  "/pending-review",
  protect,
  authorize("Admin", "Manager", "HR"),
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      let query = { reviewStatus: "Pending Review" };

      // Managers can only see their team's DWRs
      if (req.user.role === "Manager") {
        query.employee = { $in: [] }; // Default to empty if team fetch fails
        try {
          const teamMembers = await User.find({
            managerId: req.user._id,
          }).select("_id");
          if (teamMembers && teamMembers.length > 0) {
            const teamIds = teamMembers.map((m) => m._id);
            query.employee = { $in: teamIds };
          }
        } catch (userError) {
          console.error("Error fetching team members:", userError);
        }
      }

      const total = await DWR.countDocuments(query);
      const dwrs = await DWR.find(query)
        .populate("employee", "name email employeeId role department")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.status(200).json({ success: true, total, count: dwrs.length, dwrs });
    } catch (error) {
      console.error("Error fetching pending review DWRs:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  },
);

// @desc    Get single DWR
// @route   GET /api/dwr/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const dwr = await DWR.findById(req.params.id).populate([
      { path: "employee", select: "name email" },
      { path: "completedTasks.task", select: "title" },
      { path: "pendingTasks.task", select: "title" },
    ]);

    if (!dwr) {
      return res.status(404).json({ success: false, message: "DWR not found" });
    }

    res.status(200).json({ success: true, dwr });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update DWR
// @route   PUT /api/dwr/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const {
      completedTasks,
      pendingTasks,
      workSummary,
      challenges,
      nextDayPlan,
      totalHoursWorked,
    } = req.body;

    const dwr = await DWR.findByIdAndUpdate(
      req.params.id,
      {
        completedTasks,
        pendingTasks,
        workSummary,
        challenges,
        nextDayPlan,
        totalHoursWorked,
      },
      { new: true, runValidators: true },
    ).populate("employee", "name email");

    res.status(200).json({ success: true, dwr });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Approve DWR
// @route   PUT /api/dwr/:id/approve
router.put(
  "/:id/approve",
  protect,
  authorize("Admin", "Manager", "HR"),
  async (req, res) => {
    try {
      const { reviewNote } = req.body;
      const dwr = await DWR.findById(req.params.id).populate(
        "employee",
        "name email",
      );

      if (!dwr) {
        return res
          .status(404)
          .json({ success: false, message: "DWR not found" });
      }

      if (dwr.reviewStatus === "Approved") {
        return res
          .status(400)
          .json({ success: false, message: "DWR already approved" });
      }

      dwr.reviewStatus = "Approved";
      dwr.reviewedBy = req.user._id;
      dwr.reviewNote = reviewNote;
      await dwr.save();

      // Notify employee
      await Notification.create({
        recipient: dwr?.employee?._id,
        sender: req?.user?._id,
        title: "DWR Approved",
        message: `Your DWR for ${new Date(dwr?.date).toDateString()} has been approved`,
        type: "performance_review",
        entityId: dwr._id,
        entityType: "DWR",
        actionUrl: `/dashboard/dwr/${dwr._id}`,
      });

      await Activity.create({
        user: req?.user?._id,
        type: "performance_updated",
        description: `${req?.user?.name} approved DWR for ${dwr?.employee?.name}`,
        entityId: dwr._id,
        entityType: "DWR",
      });

      res.status(200).json({ success: true, dwr });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// @desc    Reject DWR
// @route   PUT /api/dwr/:id/reject
router.put(
  "/:id/reject",
  protect,
  authorize("Admin", "Manager", "HR"),
  async (req, res) => {
    try {
      const { reviewNote } = req.body;

      if (!reviewNote) {
        return res.status(400).json({
          success: false,
          message: "Review note is required for rejection",
        });
      }

      const dwr = await DWR.findById(req.params.id).populate(
        "employee",
        "name email",
      );

      if (!dwr) {
        return res
          .status(404)
          .json({ success: false, message: "DWR not found" });
      }

      if (dwr.reviewStatus === "Rejected") {
        return res
          .status(400)
          .json({ success: false, message: "DWR already rejected" });
      }

      dwr.reviewStatus = "Rejected";
      dwr.reviewedBy = req?.user?._id;
      dwr.reviewNote = reviewNote;
      await dwr.save();

      // Notify employee
      await Notification.create({
        recipient: dwr?.employee?._id,
        sender: req?.user?._id,
        title: "DWR Rejected",
        message: `Your DWR for ${new Date(dwr.date).toDateString()} has been rejected. Reason: ${reviewNote}`,
        type: "performance_review",
        priority: "High",
        entityId: dwr._id,
        entityType: "DWR",
        actionUrl: `/dashboard/dwr/${dwr._id}`,
      });

      await Activity.create({
        user: req?.user?._id,
        type: "performance_updated",
        description: `${req?.user?.name} rejected DWR for ${dwr?.employee?.name}`,
        entityId: dwr._id,
        entityType: "DWR",
      });

      res.status(200).json({ success: true, dwr });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = router;
