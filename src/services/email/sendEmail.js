const { sendEmail: sendEmailThroughTransport } = require('../../../config/nodemailer.config')

async function sendEmail(mailData) {
  try {
    const response = await sendEmailThroughTransport(mailData)

    if (!response || response.success === false) {
      const errorMessage = response?.message || 'Échec de l\'envoi de l\'email.'
      console.error('[EmailService] Envoi échoué :', errorMessage)

      return {
        success: false,
        message: errorMessage,
        error: response?.error,
      }
    }

    return response
  } catch (error) {
    console.error('[EmailService] Erreur inattendue lors de l\'envoi :', error)

    return {
      success: false,
      message: 'Une erreur inattendue est survenue lors de l\'envoi.',
      error,
    }
  }
}

module.exports = { sendEmail }
