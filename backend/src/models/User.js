const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  employeeId: { type: String, unique: true, sparse: true }, // sparse allows null values but enforces uniqueness
  role: {
    type: String,
    enum: ["TEACHER", "HOD", "DEAN", "PRINCIPAL"]
  },
  department: String
});

module.exports = mongoose.model("User", userSchema);
