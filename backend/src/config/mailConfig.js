const nodemailer = require("nodemailer");

function getTransporter() {
  const user = process.env.EMAIL;
  const pass = process.env.EMAIL_PASSWORD;
  if (!user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass
    },
    // Gmail often needs explicit secure options
    secure: true,
    port: 465
  });
}

// Lazy transporter so env vars are read when first used (after dotenv has loaded)
let _transporter = null;
function transporter() {
  if (!_transporter) {
    _transporter = getTransporter();
  }
  return _transporter;
}

module.exports = transporter;
module.exports.getTransporter = getTransporter;
