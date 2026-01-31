const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const holidayController = require("../controllers/holidayController");

/**
 * GET /api/holidays
 * Get all fixed holidays
 */
router.get("/", authMiddleware, holidayController.getHolidays);

module.exports = router;
