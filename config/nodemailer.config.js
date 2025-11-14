// config/nodemailer.config.js
const nodemailer = require("nodemailer");

function createTransporter() {
  const mode_prod = process.env.ENV === "production";

  if (!mode_prod) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: Number(process.env.EMAIL_SMTP_PORT),
    secure: process.env.EMAIL_SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const transporter = createTransporter();

/**
 * Send an e-mail
 */
async function sendEmail({ from, to, subject, text, html }) {
  const mailOptions = { from, to, subject, text, html };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response || info);
    return { success: true, message: "Email sent", info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email", error };
  }
}

module.exports = { sendEmail };
