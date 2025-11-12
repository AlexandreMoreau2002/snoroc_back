// back/src/services/email/contactEmailTemplate.service.js

const escapeHtml = (text = '') =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

/**
 * Construit l'email envoyé à l'administrateur lorsque le formulaire de contact est soumis.
 * @param {string[]|string} recipients
 * @param {Object} contactPayload
 * @returns {{from:string,to:string,subject:string,text:string,html:string}}
 */
const buildContactEmailNotification = (recipients, contactPayload) => {
  const to = Array.isArray(recipients) ? recipients.join(',') : recipients
  const name = contactPayload.name || 'Inconnu'
  const subject = contactPayload.subject || 'Nouveau message de contact'

  const text = `
    Nouveau message de contact :
    - Nom : ${contactPayload.name}
    - Email : ${contactPayload.email}
    - Téléphone : ${contactPayload.phone || 'Non renseigné'}
    - Sujet : ${contactPayload.subject}
    - Message :
    ${contactPayload.message}
  `

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="color:#1b74e4;margin-bottom:16px;">Nouveau message de contact</h2>
      <p><strong>Nom :</strong> ${escapeHtml(contactPayload.name)}</p>
      <p><strong>Email :</strong> ${escapeHtml(contactPayload.email)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(
        contactPayload.phone || 'Non renseigné'
      )}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(contactPayload.subject)}</p>
      <p style="margin-top:16px;"><strong>Message :</strong></p>
      <p style="white-space:pre-line;background:#f7f7f7;padding:12px;border-radius:8px;">${escapeHtml(
        contactPayload.message
      )}</p>
    </div>
  `

  return {
    from: process.env.EMAIL,
    to,
    subject: `[Snoroc] ${subject} - ${name}`,
    text,
    html,
  }
}

module.exports = {
  buildContactEmailNotification,
}
