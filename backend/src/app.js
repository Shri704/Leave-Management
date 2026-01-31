const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Routes
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Error middleware (optional but recommended)
const errorMiddleware = require("./middleware/errorMiddleware");

// Initialize app
const app = express();

// DB connection and authority seed are done in server.js before listen

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/admin", adminRoutes);

// Health check route (for deployment)
app.get("/", (req, res) => {
  res.send("Leave Management System Backend is running 🚀");
});

// Error handling middleware (keep at end)
app.use(errorMiddleware);

module.exports = app;
