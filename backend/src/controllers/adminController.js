const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createAuthorities = async () => {
  const authorities = [
    { role: "HOD", email: "hod@college.com", password: "hodc@#1234" },
    { role: "DEAN", email: "dean@college.com", password: "deanc@#1234" },
    { role: "PRINCIPAL", email: "principal@college.com", password: "principalc@#1234" }
  ];

  for (let auth of authorities) {
    const exists = await User.findOne({ role: auth.role });
    if (!exists) {
      await User.create({
        name: auth.role,
        email: auth.email,
        password: await bcrypt.hash(auth.password, 10),
        role: auth.role
      });
    }
  }

  console.log("Authority accounts created");
};
