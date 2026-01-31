const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

/**
 * POST /api/admin/create-authorities
 * Run once to create HOD, DEAN, PRINCIPAL accounts
 */
router.post("/create-authorities", async (req, res) => {
  try {
    await adminController.createAuthorities();
    res.json({ message: "Authority accounts created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
