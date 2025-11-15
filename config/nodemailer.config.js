const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
  process.env.EMAIL_USER, // API KEY
  process.env.EMAIL_PASS  // API SECRET
);

async function sendEmail({ from, to, subject, text, html }) {
  try {
    const result = await mailjet
      .post("send", { version: "v3.1" })
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
      });
    return { success: true, info: result.body };
  } catch (error) {
    console.log("Mailjet API: FAIL", error);
    return { success: false, error };
  }
}

module.exports = { sendEmail };
