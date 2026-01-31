const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * POST /api/auth/signup
 * Teacher signup only
 */
router.post("/signup", authController.signup);

/**
 * POST /api/auth/login
 * Login for TEACHER, HOD, DEAN, PRINCIPAL
 */
router.post("/login", authController.login);

module.exports = router;
