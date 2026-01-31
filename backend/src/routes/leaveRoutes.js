const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const leaveController = require("../controllers/leaveController");

/**
 * POST /api/leaves
 * Apply leave (Teacher only)
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  leaveController.applyLeave
);

/**
 * GET /api/leaves/pending
 * View pending leaves (HOD / DEAN / PRINCIPAL)
 */
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["HOD", "DEAN", "PRINCIPAL"]),
  leaveController.getPendingLeaves
);

/**
 * GET /api/leaves/processed
 * View processed leaves (APPROVED/REJECTED) (HOD / DEAN / PRINCIPAL)
 */
router.get(
  "/processed",
  authMiddleware,
  roleMiddleware(["HOD", "DEAN", "PRINCIPAL"]),
  leaveController.getProcessedLeaves
);

/**
 * GET /api/leaves/teacher-statistics
 * Get teacher-wise leave statistics (HOD / DEAN / PRINCIPAL)
 */
router.get(
  "/teacher-statistics",
  authMiddleware,
  roleMiddleware(["HOD", "DEAN", "PRINCIPAL"]),
  leaveController.getTeacherLeaveStatistics
);

/**
 * PUT /api/leaves/approve/:id
 * Approve leave (HOD → DEAN → PRINCIPAL)
 */
router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(["HOD", "DEAN", "PRINCIPAL"]),
  leaveController.approveLeave
);

/**
 * PUT /api/leaves/reject/:id
 * Reject leave (Any authority)
 */
router.put(
  "/reject/:id",
  authMiddleware,
  roleMiddleware(["HOD", "DEAN", "PRINCIPAL"]),
  leaveController.rejectLeave
);

/**
 * GET /api/leaves/my-leaves
 * Get teacher's leave history
 */
router.get(
  "/my-leaves",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  leaveController.getTeacherLeaves
);

/**
 * GET /api/leaves/statistics
 * Get leave statistics for teacher
 */
router.get(
  "/statistics",
  authMiddleware,
  roleMiddleware(["TEACHER"]),
  leaveController.getLeaveStatistics
);

module.exports = router;
