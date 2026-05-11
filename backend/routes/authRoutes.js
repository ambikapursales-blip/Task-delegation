const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Activity = require("../models/Activity");
const Attendance = require("../models/Attendance");
const { protect, authorize, generateToken } = require("../middleware/auth");

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    // Optimized: Single database query with lean() for better performance
    const user = await User.findOne({ email })
      .select('+password')
      .lean() // Use lean for faster queries
      .exec();
      
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Contact admin.",
      });
    }

    const isMatch = await require('bcryptjs').compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Optimized: Parallel operations for better performance
    const [token] = await Promise.all([
      Promise.resolve(generateToken(user._id)),
      // Update last login in background (non-blocking)
      User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        lastActive: new Date()
      }, { validateBeforeSave: false }).lean().exec(),
      // Create activity log in background
      Activity.create({
        user: user._id,
        type: "login",
        description: `${user.name} logged in`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).catch(err => console.error('Activity log error:', err)),
      // Mark attendance for today in background
      (async () => {
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          await Attendance.findOneAndUpdate(
            { employee: user._id, date: today },
            {
              $setOnInsert: {
                employee: user._id,
                date: today,
                loginTime: new Date(),
                status: "Present",
              },
            },
            { upsert: true, new: true }
          ).lean().exec();
        } catch (err) {
          console.error('Attendance update error:', err);
        }
      })()
    ]);

    // Get public profile without password
    const { password: _, ...publicProfile } = user;
    const userPublicProfile = {
      ...publicProfile,
      getPublicProfile: () => publicProfile
    };

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        token,
        user: publicProfile,
      });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

// @desc    Register user (Admin only)
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, phone, managerId } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Sales Executive",
      department,
      phone,
      managerId,
    });

    // Log activity
    if (req.user) {
      await Activity.create({
        user: req.user._id,
        type: "user_created",
        description: `New user ${user.name} created with role ${user.role}`,
        entityId: user._id,
        entityType: "User",
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "managerId",
      "name email role",
    );
    res.status(200).json({ success: true, user: user.getPublicProfile() });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // Update logout time in attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      { employee: req.user._id, date: today },
      { logoutTime: new Date() },
    );

    await Activity.create({
      user: req.user._id,
      type: "logout",
      description: `${req.user.name} logged out`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, avatar },
      { new: true, runValidators: true },
    );

    await Activity.create({
      user: req.user._id,
      type: "profile_updated",
      description: `${req.user.name} updated their profile`,
    });

    res.status(200).json({ success: true, user: user.getPublicProfile() });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    await Activity.create({
      user: req.user._id,
      type: "password_changed",
      description: `${req.user.name} changed their password`,
    });

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update location
// @route   POST /api/auth/location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      location: { lat, lng, address, updatedAt: new Date() },
    });

    res.status(200).json({ success: true, message: "Location updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Routes
router.post("/login", login);
router.post("/register", protect, authorize("Admin", "HR"), register);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/location", protect, updateLocation);

module.exports = router;
