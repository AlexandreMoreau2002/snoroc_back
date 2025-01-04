// back/src/services/email/verifyEmail.service.js

/**
 * Prépare les données de l'email pour l'envoi du code de vérification.
 * @param {string} to - Adresse email du destinataire.
 * @param {string} code - Code de vérification à envoyer.
 * @returns {Object} Les données de l'email.
 */

const emailDataVerification = (to, code) => {
    return {
        from: process.env.EMAIL_USERNAME,
        to: to,
        subject: `Activation de votre compte : ${code}`,
        text: `Votre code d'activation est : ${code}. Il est valide pour 15 minutes.`,
        html: `<p>Votre code d'activation est : </p><br><p><strong>${code}</strong></p><br> <p>Il est valide pour <strong>15 minutes</strong>.</p>`
    };
};

module.exports = { emailDataVerification };