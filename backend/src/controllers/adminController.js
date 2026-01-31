const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createAuthorities = async () => {
  const authorities = [
    { role: "HOD", email: "hod@college.com" },
    { role: "DEAN", email: "dean@college.com" },
    { role: "PRINCIPAL", email: "principal@college.com" }
  ];

  for (let auth of authorities) {
    const exists = await User.findOne({ role: auth.role });
    if (!exists) {
      await User.create({
        name: auth.role,
        email: auth.email,
        password: await bcrypt.hash("password123", 10),
        role: auth.role
      });
    }
  }

  console.log("Authority accounts created");
};
