const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createAuthorities = async () => {
  const authorities = [
    { role: "HOD", email: "hod.collegevdit@gmail.com", password: "hodc@#1234" },
    { role: "DEAN", email: "dean.collegevdit@gmail.com", password: "deanc@#1234" },
    { role: "PRINCIPAL", email: "principal.collegevdit@gmail.com", password: "principalc@#1234" }
  ];

  for (let auth of authorities) {
    const hashedPassword = await bcrypt.hash(auth.password, 10);
    await User.findOneAndUpdate(
      { role: auth.role },
      { name: auth.role, email: auth.email, password: hashedPassword, role: auth.role },
      { upsert: true, new: true }
    );
  }

  console.log("Authority accounts created/updated");
};
