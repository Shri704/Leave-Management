const Leave = require("../models/Leave");
const User = require("../models/User");
const STATUS = require("../utils/constants");
const calculateLeaveDays = require("../services/leaveCalculator");
const { sendMail, generateLeaveEmail } = require("../services/mailService");

// ================= APPLY LEAVE (TEACHER) =================
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    // Validate required fields
    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Validate dates
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return res.status(400).json({
        message: "Cannot apply leave for past dates"
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        message: "To date cannot be before from date"
      });
    }

    const { totalDays, holidaysExcluded, finalDays } =
      await calculateLeaveDays(fromDate, toDate);

    if (finalDays <= 0) {
      return res.status(400).json({
        message: "Selected dates are holidays. Leave cannot be applied on holidays."
      });
    }

    const leave = await Leave.create({
      teacherId: req.user.id,
      leaveType,
      fromDate,
      toDate,
      reason,
      status: STATUS.PENDING_HOD,
      totalDays,
      holidaysExcluded,
      finalDays
    });

    res.status(201).json(leave);

    // Notify HOD in background (don't block response – submit feels instant)
    const teacher = await User.findById(req.user.id);
    const hod = await User.findOne({ role: "HOD" });
    if (hod && teacher) {
      try {
        const { subject, html } = generateLeaveEmail("NEW_REQUEST", {
          teacherName: teacher.name,
          leaveType,
          fromDate,
          toDate,
          days: finalDays,
          reason
        });
        sendMail(hod.email, subject, html).catch((err) =>
          console.error("Apply leave – HOD mail error:", err.message)
        );
      } catch (e) {
        console.error("Apply leave – mail setup error:", e.message);
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET PENDING LEAVES (AUTHORITY) =================
exports.getPendingLeaves = async (req, res) => {
  try {
    const roleStatusMap = {
      HOD: STATUS.PENDING_HOD,
      DEAN: STATUS.PENDING_DEAN,
      PRINCIPAL: STATUS.PENDING_PRINCIPAL
    };

    const leaves = await Leave.find({
      status: roleStatusMap[req.user.role]
    }).populate("teacherId").sort({ appliedAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET PROCESSED LEAVES (AUTHORITY) =================
exports.getProcessedLeaves = async (req, res) => {
  try {
    // Get all leaves that were processed by this authority
    // This includes leaves that passed through this authority's approval stage
    const roleStatusMap = {
      HOD: STATUS.PENDING_HOD,
      DEAN: STATUS.PENDING_DEAN,
      PRINCIPAL: STATUS.PENDING_PRINCIPAL
    };

    // Get leaves that were approved/rejected by this authority
    // We check if the leave status is APPROVED or REJECTED
    // and if it was processed by checking the approval history
    // For simplicity, we'll get all APPROVED/REJECTED leaves
    // In a real system, you'd track who approved/rejected each stage
    
    const processedLeaves = await Leave.find({
      $or: [
        { status: STATUS.APPROVED },
        { status: STATUS.REJECTED }
      ]
    })
      .populate("teacherId")
      .sort({ appliedAt: -1 })
      .limit(50); // Limit to recent 50 processed leaves

    res.json(processedLeaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET TEACHER LEAVE STATISTICS (AUTHORITY) =================
exports.getTeacherLeaveStatistics = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get all leaves for the current year
    const allLeaves = await Leave.find({
      appliedAt: { $gte: yearStart, $lte: yearEnd }
    })
      .populate("teacherId", "name email department employeeId")
      .sort({ appliedAt: -1 });

    // Group by teacher
    const teacherStats = {};

    allLeaves.forEach(leave => {
      const teacherId = leave.teacherId?._id?.toString();
      if (!teacherId) return;

      if (!teacherStats[teacherId]) {
        teacherStats[teacherId] = {
          teacherId: teacherId,
          teacherName: leave.teacherId?.name || "Unknown",
          teacherEmail: leave.teacherId?.email || "N/A",
          employeeId: leave.teacherId?.employeeId || "N/A",
          department: leave.teacherId?.department || "N/A",
          totalLeaves: 0,
          approvedLeaves: 0,
          rejectedLeaves: 0,
          pendingLeaves: 0,
          totalDays: 0,
          approvedDays: 0,
          byType: {
            CL: { count: 0, days: 0 },
            EL: { count: 0, days: 0 },
            SL: { count: 0, days: 0 },
            OD: { count: 0, days: 0 }
          }
        };
      }

      const stats = teacherStats[teacherId];
      stats.totalLeaves += 1;
      stats.totalDays += leave.finalDays;

      // Count by status
      if (leave.status === STATUS.APPROVED) {
        stats.approvedLeaves += 1;
        stats.approvedDays += leave.finalDays;
      } else if (leave.status === STATUS.REJECTED) {
        stats.rejectedLeaves += 1;
      } else {
        stats.pendingLeaves += 1;
      }

      // Count by type
      if (stats.byType[leave.leaveType]) {
        stats.byType[leave.leaveType].count += 1;
        if (leave.status === STATUS.APPROVED) {
          stats.byType[leave.leaveType].days += leave.finalDays;
        }
      }
    });

    // Convert to array and sort by total leaves (descending)
    const statistics = Object.values(teacherStats).sort((a, b) => b.totalLeaves - a.totalLeaves);

    res.json({
      statistics,
      currentYear,
      totalTeachers: statistics.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= APPROVE LEAVE =================
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const teacher = await User.findById(leave.teacherId);
    let mailTo = null;
    let mailSubject = null;
    let mailHtml = null;

    if (req.user.role === "HOD") {
      leave.status = STATUS.PENDING_DEAN;
      const dean = await User.findOne({ role: "DEAN" });
      if (dean) {
        const g = generateLeaveEmail("NEW_REQUEST", {
          teacherName: teacher.name,
          leaveType: leave.leaveType,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          days: leave.finalDays,
          reason: leave.reason
        });
        mailTo = dean.email;
        mailSubject = g.subject;
        mailHtml = g.html;
      }
    } else if (req.user.role === "DEAN") {
      leave.status = STATUS.PENDING_PRINCIPAL;
      const principal = await User.findOne({ role: "PRINCIPAL" });
      if (principal) {
        const g = generateLeaveEmail("NEW_REQUEST", {
          teacherName: teacher.name,
          leaveType: leave.leaveType,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          days: leave.finalDays,
          reason: leave.reason
        });
        mailTo = principal.email;
        mailSubject = g.subject;
        mailHtml = g.html;
      }
    } else if (req.user.role === "PRINCIPAL") {
      leave.status = STATUS.APPROVED;
      const g = generateLeaveEmail("APPROVED", {
        teacherName: teacher.name,
        leaveType: leave.leaveType,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        days: leave.finalDays,
        reason: leave.reason
      });
      mailTo = teacher.email;
      mailSubject = g.subject;
      mailHtml = g.html;
    }

    await leave.save();
    res.json(leave);

    // Send email in background (don't block response)
    if (mailTo && mailSubject && mailHtml) {
      sendMail(mailTo, mailSubject, mailHtml).catch((err) =>
        console.error("Approve mail error:", err.message)
      );
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= REJECT LEAVE =================
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = STATUS.REJECTED;
    const teacher = await User.findById(leave.teacherId);

    await leave.save();
    res.json(leave);

    // Send email in background (don't block response)
    if (teacher) {
      const { subject, html } = generateLeaveEmail("REJECTED", {
        teacherName: teacher.name,
        leaveType: leave.leaveType,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        days: leave.finalDays,
        reason: leave.reason
      });
      sendMail(teacher.email, subject, html).catch((err) =>
        console.error("Reject mail error:", err.message)
      );
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET TEACHER LEAVES =================
exports.getTeacherLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ teacherId: req.user.id })
      .sort({ appliedAt: -1 })
      .populate("teacherId", "name email");
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET LEAVE STATISTICS =================
exports.getLeaveStatistics = async (req, res) => {
  try {
    const leaveLimits = { CL: 15, EL: 10 };
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const approvedLeaves = await Leave.find({
      teacherId: req.user.id,
      status: STATUS.APPROVED,
      fromDate: { $gte: yearStart, $lte: yearEnd }
    });

    const leavesTakenByType = {};
    let totalLeavesTaken = 0;
    let totalLeavesDays = 0;

    approvedLeaves.forEach(leave => {
      if (!leavesTakenByType[leave.leaveType]) {
        leavesTakenByType[leave.leaveType] = { count: 0, days: 0 };
      }
      leavesTakenByType[leave.leaveType].count += 1;
      leavesTakenByType[leave.leaveType].days += leave.finalDays;
      totalLeavesDays += leave.finalDays;
    });

    totalLeavesTaken = approvedLeaves.length;

    const allLeaveTypes = ["CL", "EL", "SL", "OD"];
    const leaveBalance = {};
    let totalLeavesRemaining = 0;

    allLeaveTypes.forEach(type => {
      const taken = leavesTakenByType[type]?.days || 0;
      const limit = leaveLimits[type];

      if (limit !== undefined) {
        const remaining = Math.max(0, limit - taken);
        leaveBalance[type] = { limit, taken, remaining, hasLimit: true };
        totalLeavesRemaining += remaining;
      } else {
        leaveBalance[type] = { limit: null, taken, remaining: null, hasLimit: false };
      }
    });

    res.json({
      summary: {
        totalLeavesTaken,
        totalLeavesDays,
        totalLeavesRemaining,
        totalLeavesLimit: Object.values(leaveLimits).reduce((a, b) => a + b, 0)
      },
      byType: leaveBalance,
      currentYear
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
