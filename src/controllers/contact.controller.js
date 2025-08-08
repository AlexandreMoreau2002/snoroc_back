// Create
// Vérification des données (name, email, phone, subject, message)
// Envoi d'un email à l'adresse de contact
// Update
// Vérification des données (id du message, authentification via middleware)
// Mise à jour du champ hasBeenRead
// Get / GetById
// Vérification des données (id du message, authentification via middleware)
// Delete
// Vérification des données (id du message, authentification via middleware)

// Create, Update, GetAll, GetById, DeleteById

const { sendEmail } = require('../../config/nodemailer.config')

exports.Create = async (req, res) => {
    const { name, email, phone, subject, message} = req.body


}

exports.Create = async (req, res) => {
  try {
    const { title, content } = req.body

    if (!title || !content || !req.file) {
      return res.status(400).json({
        error: true,
        message: 'Titre, contenu, et image sont obligatoires.',
      })
    }

    const authorId = req.user.userId
    if (!authorId) {
      return res.status(401).json({
        error: true,
        message: 'Utilisateur non authentifié.',
      })
    }

    const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/${
      req.file.filename
    }`

    const news = await News.create({
      authorId,
      title,
      content,
      thumbnail: thumbnailUrl,
    })

    const users = await User.findAll({
      attributes: ['email'],
      where: { newsletter: true },
    })

    if (users.length === 0) {
      return res.status(201).json({
        error: false,
        message: 'Actualité créée avec succès',
      })
    }

    for (const user of users) {
      const emailData = notifNewsletterNews(user.email, news.id)

      try {
        const emailResponse = await sendEmail(emailData)
        if (!emailResponse.success) {
          console.error(
            `Erreur lors de l'envoi à ${user.email} :`,
            emailResponse.error
          )
        }
      } catch (error) {
        console.error(`Erreur lors de l'envoi à ${user.email} :`, error)
      }
    }

    res.status(201).json({
      error: false,
      message: 'Actualité créée avec succès et notifications envoyées.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue.',
    })
  }
}