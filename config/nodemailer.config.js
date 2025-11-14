// config/nodemailer.config.js
const nodemailer = require("nodemailer");

function createTransporter() {
  const mode_prod = process.env.ENV === "production";

  console.log("Mail mode:", mode_prod ? "production" : "dev");

  if (!mode_prod) {
    console.log("Transporter: Gmail (dev)");
    console.log("EMAIL =", process.env.EMAIL);
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  console.log("Transporter: Mailjet (prod)");
  console.log("SMTP_HOST =", process.env.EMAIL_SMTP_HOST);
  console.log("SMTP_PORT =", process.env.EMAIL_SMTP_PORT);
  console.log("SMTP_USER =", process.env.EMAIL_USER ? "OK" : "MISSING");
  console.log("SMTP_PASS =", process.env.EMAIL_PASS ? "OK" : "MISSING");

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
  console.log("SendEmail: START");
  console.log("From:", from);
  console.log("To:", to);
  console.log("Subject:", subject);

  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log("SendEmail: SUCCESS");
    console.log("Response:", info.response || info);
    return { success: true, message: "Email sent", info };
  } catch (error) {
    console.log("SendEmail: FAIL");
    console.log("Error name:", error.name);
    console.log("Error code:", error.code);
    console.log("Error command:", error.command);
    console.log("Message:", error.message);
    return { success: false, message: "Failed to send email", error };
  }
}

module.exports = { sendEmail };
