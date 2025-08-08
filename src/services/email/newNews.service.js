// src/services/email/newNews.service.js

/**
 * Envoie de notification aux utilisateurs lorsqu'une nouvelle actu est publiée sur le site.
 * @param {string} to - Adresse email du destinataire.
 * @param {string} id - ID de l'actualité.
 * @returns {Object} Les données de l'email.
 */

const notifNewsletterNews = (to, id) => {
  const baseUrl = process.env.BASE_URL || 'https://snoroc.com'
  const newsUrl = `${baseUrl}/news/id/${id}`

  return {
    from: process.env.EMAIL,
    to: to,
    subject: `Nouvelle actu sur Snoroc`,
    text: `Une nouvelle actu a été publiée. Consultez-la ici : ${newsUrl}`,
    html: `
      <p>Une nouvelle actu a été publiée.</p>
      <p><a href="${newsUrl}" target="_blank">Cliquez ici</a> pour voir sur le site</p>
    `,
  }
}

module.exports = { notifNewsletterNews }
