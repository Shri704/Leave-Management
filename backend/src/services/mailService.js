const transporter = require("../config/mailConfig");

/**
 * Send email notification with HTML template
 * @param {string} to - receiver email
 * @param {string} subject - mail subject
 * @param {string} html - mail HTML content
 * @param {string} text - mail plain text content (fallback)
 */
const sendMail = async (to, subject, html, text = "") => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.warn("⚠️ Email not configured (EMAIL and EMAIL_PASSWORD). Skipping send to", to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Leave Management System" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, "")
    });
    console.log(`✅ Mail sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Don't throw - email failure shouldn't break the app
  }
};

/**
 * Generate email template for leave notifications
 */
const generateLeaveEmail = (type, leaveData) => {
  const { teacherName, leaveType, fromDate, toDate, days, reason, status } = leaveData;
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  let html = "";
  let subject = "";

  switch (type) {
    case "NEW_REQUEST":
      subject = `New Leave Request from ${teacherName}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Leave Request</h2>
          <p>A new leave request requires your approval:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Teacher:</strong> ${teacherName}</p>
            <p><strong>Leave Type:</strong> ${leaveType}</p>
            <p><strong>From:</strong> ${formatDate(fromDate)}</p>
            <p><strong>To:</strong> ${formatDate(toDate)}</p>
            <p><strong>Days:</strong> ${days} days</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          </div>
          <p>Please log in to the Authority Portal to review and approve this request.</p>
        </div>
      `;
      break;

    case "APPROVED":
      subject = `Your Leave Request Has Been Approved`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Leave Request Approved ✅</h2>
          <p>Dear ${teacherName},</p>
          <p>Your leave request has been <strong>approved</strong>:</p>
          <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <p><strong>Leave Type:</strong> ${leaveType}</p>
            <p><strong>From:</strong> ${formatDate(fromDate)}</p>
            <p><strong>To:</strong> ${formatDate(toDate)}</p>
            <p><strong>Days:</strong> ${days} days</p>
          </div>
          <p>Enjoy your time off!</p>
        </div>
      `;
      break;

    case "REJECTED":
      subject = `Your Leave Request Has Been Rejected`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Leave Request Rejected ❌</h2>
          <p>Dear ${teacherName},</p>
          <p>Unfortunately, your leave request has been <strong>rejected</strong>:</p>
          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <p><strong>Leave Type:</strong> ${leaveType}</p>
            <p><strong>From:</strong> ${formatDate(fromDate)}</p>
            <p><strong>To:</strong> ${formatDate(toDate)}</p>
            <p><strong>Days:</strong> ${days} days</p>
          </div>
          <p>Please contact your department head for more information.</p>
        </div>
      `;
      break;

    default:
      html = `<p>${text || "You have a new notification from the Leave Management System."}</p>`;
  }

  return { subject, html };
};

module.exports = { sendMail, generateLeaveEmail };
