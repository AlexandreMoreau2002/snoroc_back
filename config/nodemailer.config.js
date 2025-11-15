const Mailjet = require('node-mailjet')

const apiKey = process.env.EMAIL_USER
const apiSecret = process.env.EMAIL_PASS

let mailjet = null
if (apiKey && apiSecret) {
  mailjet = Mailjet.apiConnect(apiKey, apiSecret)
}

async function sendEmail({ from, to, subject, text, html }) {
  if (!mailjet) {
    return { success: false, error: new Error('Service mail non configuré') }
  }

  try {
    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: { Email: from },
            To: [{ Email: to }],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
          },
        ],
      })
    return { success: true, info: result.body }
  } catch (error) {
    return { success: false, error }
  }
}

module.exports = { sendEmail }
