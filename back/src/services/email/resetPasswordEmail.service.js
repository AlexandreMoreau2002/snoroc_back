// back/src/services/email/resetPasswordEmail.service.js

/**
 * Prépare les données de l'email pour l'envoi du lien de réinitialisation de mot de passe.
 * @param {string} to - Adresse email du destinataire.
 * @param {string} resetToken - Token de réinitialisation du mot de passe.
 * @returns {Object} Les données de l'email.
 */

const emailDataResetPassword = (to, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  return {
    from: process.env.EMAIL_USERNAME,
    to: to,
    subject: `Réinitialisation de votre mot de passe`,
    text: `Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}. Ce lien est valide pour 15 minutes.`,
    html: `
            <p>Vous avez demandé une réinitialisation de mot de passe.</p>
            <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
            <a href="${resetLink}" target="_blank"><strong>Réinitialiser mon mot de passe</strong></a>
            <p>Ce lien est valide pour <strong>15 minutes</strong>.</p>
        `,
  }
}

module.exports = { emailDataResetPassword }
