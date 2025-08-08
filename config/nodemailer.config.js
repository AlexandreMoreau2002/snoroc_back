// config/nodemailer.config.js
const nodemailer = require('nodemailer')

/**
 * Asynchronously sends an email using predefined SMTP settings.
 *
 * @param {Object} mailData - Object containing email parameters.
 * @param {string} mailData.from - The email address of the sender.
 * @param {string} mailData.to - The email address(es) of the recipient(s).
 * @param {string} mailData.subject - The subject line of the email.
 * @param {string} mailData.text - The plain text body of the email.
 * @param {string} mailData.html - The HTML body of the email (optional).
 * @returns {Promise<Object>} - A promise that resolves to an object indicating the result of the email sending operation.
 */

async function sendEmail({ from, to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent: ' + info.response)
    return { success: true, message: 'Email sent', info: info }
  } catch (error) {
    console.error('Error sending email: ', error)
    return { success: false, message: 'Failed to send email', error: error }
  }
}

module.exports = { sendEmail }
