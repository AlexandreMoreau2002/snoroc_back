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
  let transporter

  // En production (ou si SMTP_HOST est défini), on utilise le SMTP OVH
  if (process.env.SMTP_HOST) {
    console.log('[Mailer] Using OVH SMTP configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.EMAIL_USER,
    })
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  } else {
    console.log('[Mailer] Using Gmail configuration (Fallback)')
    // Fallback pour le développement local (Gmail)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  const mailOptions = {
    from: from || process.env.EMAIL_USER || process.env.EMAIL, // Fallback sur l'email configuré en local
    to,
    subject,
    text,
    html,
  }

  try {
    console.log(`[Mailer] Attempting to send email to: ${to}`)
    const info = await transporter.sendMail(mailOptions)
    console.log('[Mailer] Email sent successfully:', info.response)
    return { success: true, message: 'Email sent', info: info }
  } catch (error) {
    console.error('[Mailer] Error sending email:', error)
    return { success: false, message: 'Failed to send email', error: error }
  }
}

module.exports = { sendEmail }
