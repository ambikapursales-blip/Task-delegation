const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Activity = require("../models/Activity");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get all events
// @route   GET /api/events
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo.employee", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ startDate: -1 });

    res
      .status(200)
      .json({ success: true, total, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Create event
// @route   POST /api/events
router.post(
  "/",
  protect,
  authorize("Manager", "Admin", "HR"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        startDate,
        endDate,
        location,
        isVirtual,
        meetingLink,
        assignedTo,
        priority,
        tags,
      } = req.body;

      // Convert assignedTo array of IDs to proper format
      const formattedAssignedTo = (assignedTo || []).map((userId) => ({
        employee: userId,
        status: "Pending",
      }));

      const event = await Event.create({
        title,
        description,
        type,
        startDate,
        endDate,
        location,
        isVirtual,
        meetingLink,
        createdBy: req.user._id,
        assignedTo: formattedAssignedTo,
        priority: priority || "Medium",
        tags: tags || [],
      });

      await Activity.create({
        user: req.user._id,
        type: "event_created",
        description: `Event "${title}" created`,
        entityId: event._id,
        entityType: "Event",
      });

      res.status(201).json({ success: true, event });
    } catch (error) {
      console.error("Error creating event:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  },
);

// @desc    Get single event
// @route   GET /api/events/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo.employee", "name email");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
router.put(
  "/:id",
  protect,
  authorize("Manager", "Admin", "HR"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        startDate,
        endDate,
        location,
        isVirtual,
        meetingLink,
        status,
        assignedTo,
        priority,
        tags,
      } = req.body;

      // Convert assignedTo array of IDs to proper format if provided
      let formattedAssignedTo = undefined;
      if (assignedTo !== undefined) {
        formattedAssignedTo = assignedTo.map((userId) => ({
          employee: userId,
          status: "Pending",
        }));
      }

      const updateData = {
        title,
        description,
        type,
        startDate,
        endDate,
        location,
        isVirtual,
        meetingLink,
        status,
      };

      if (formattedAssignedTo !== undefined) {
        updateData.assignedTo = formattedAssignedTo;
      }
      if (priority !== undefined) {
        updateData.priority = priority;
      }
      if (tags !== undefined) {
        updateData.tags = tags;
      }

      const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("createdBy", "name email")
        .populate("assignedTo.employee", "name email");

      res.status(200).json({ success: true, event });
    } catch (error) {
      console.error("Error updating event:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  },
);

// @desc    Update RSVP status
// @route   PUT /api/events/:id/rsvp
router.put("/:id/rsvp", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const eventId = req.params.id;
    const userId = req.user._id;

    if (!["Accepted", "Declined"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check if user is assigned to this event
    const assignment = event.assignedTo.find(
      (a) => a.employee.toString() === userId.toString(),
    );

    if (!assignment) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not assigned to this event",
        });
    }

    // Update the user's RSVP status
    assignment.status = status;
    await event.save();

    await Activity.create({
      user: userId,
      type: "event_rsvp",
      description: `RSVP for event "${event.title}" updated to ${status}`,
      entityId: event._id,
      entityType: "Event",
    });

    const updatedEvent = await Event.findById(eventId)
      .populate("createdBy", "name email")
      .populate("assignedTo.employee", "name email");

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
router.delete(
  "/:id",
  protect,
  authorize("Manager", "Admin"),
  async (req, res) => {
    try {
      await Event.findByIdAndDelete(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

module.exports = router;
