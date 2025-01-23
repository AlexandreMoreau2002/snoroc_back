// src/services/email/newNews.service.js

/**
 * Envoie de notification aux utilisateurs lorsqu'une nouvelle actu est publiée sur le site.
 * @param {string} to - Adresse email du destinataire.
 * @param {string} id - ID de l'actualité.
 * @returns {Object} Les données de l'email.
 */

const notifNewsletterNews = (to, id) => {
  const baseUrl = process.env.BASE_URL || 'https://snoroc.com'
  const newsUrl = `${baseUrl}/news/${id}`

  return {
    from: process.env.EMAIL,
    to: to,
    subject: `Nouvelle actu sur Snoroc`,
    text: `Une nouvelle actu a été publiée. Consultez-la ici : ${newsUrl}`,
    html: `
      <p>Une nouvelle actu a été publiée sur le site Snoroc.</p>
      <p><a href="${newsUrl}" target="_blank">Cliquez ici pour lire l'article</a></p>
    `,
  }
}

module.exports = { notifNewsletterNews }
