const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  leaveType: String,
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: String,
  totalDays: Number,
  holidaysExcluded: Number,
  finalDays: Number,
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Leave", leaveSchema);
