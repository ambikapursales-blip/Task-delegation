const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dwrRoutes = require("./routes/dwrRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const eventRoutes = require("./routes/eventRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const teamRoutes = require("./routes/teamRoutes");
const reportRoutes = require("./routes/reportRoutes");

const { initCronJobs } = require("./utils/cronJobs");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan("dev"));

// CORS (before rate limiting to handle OPTIONS)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting (skip OPTIONS requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => req.method === "OPTIONS",
});
app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dwr", dwrRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FMS API is running",
    timestamp: new Date(),
  });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 FMS Server running on port ${PORT}`);
      // Initialize cron jobs
      initCronJobs();
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
