const fs = require('fs')
const path = require('path')
const News = require('../models/news.model')
const User = require('../models/user.model')
const { sendEmail } = require('../../config/nodemailer.config')
const { notifNewsletterNews } = require('../services/email/newNews.service')

exports.Create = async (req, res) => {
  try {
    const { title, content } = req.body
    console.log('[news::create] body:', req.body)
    console.log('[news::create] file:', req.file)

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

    const thumbnailUrl = `${req.protocol}://${req.get(
      'host'
    )}/uploads/${encodeURIComponent(req.file.filename)}`
    console.log('[news::create] thumbnailUrl:', thumbnailUrl)

    const news = await News.create({
      authorId,
      title,
      content,
      thumbnail: thumbnailUrl,
    })
    console.log('[news::create] news created id:', news.id)

    const users = await User.findAll({
      attributes: ['email'],
      where: { newsletter: true },
    })

    if (users.length === 0) {
      return res.status(201).json({
        error: false,
        message:
          'Actualité créée avec succès',
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

exports.GetAll = async (req, res) => {
  try {
    const news = await News.findAll()

    return res.status(200).json({
      error: false,
      message: 'Les actualités ont bien été récupérés',
      data: news,
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
    })
  }
}

exports.GetById = async (req, res) => {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: 'Requête invalide.',
      })
    }

    const news = await News.findOne({ where: { id: id } })

    if (!news) {
      return res.status(404).json({
        error: true,
        message: "L'actualité est introuvable.",
      })
    }

    return res.status(200).json({
      error: false,
      message: "L'actualité a été récupérée.",
      data: news,
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
    })
  }
}

exports.Update = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content } = req.body
    console.log('[news::update] params.id:', id)
    console.log('[news::update] body:', req.body)
    console.log('[news::update] file:', req.file)

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: true,
        message: 'Utilisateur non authentifié.',
      })
    }

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: "Requête invalide. L'ID doit être un entier valide.",
      })
    }

    const news = await News.findOne({ where: { id: parseInt(id, 10) } })

    if (!news) {
      return res.status(404).json({
        error: true,
        message: "L'actualité est introuvable.",
      })
    }

    let newThumbnail = news.thumbnail

    if (req.file) {
      const oldThumbnailPath = path.join(
        __dirname,
        '../../public/uploads',
        path.basename(news.thumbnail)
      )

      if (fs.existsSync(oldThumbnailPath)) {
        try {
          fs.unlinkSync(oldThumbnailPath)
        } catch (err) {
          console.error(
            "Erreur lors de la suppression de l'ancienne image :",
            err
          )
        }
      } else {
        console.log('Aucune ancienne image trouvée.')
      }

      newThumbnail = `${req.protocol}://${req.get(
        'host'
      )}/uploads/${encodeURIComponent(req.file.filename)}`
      console.log('[news::update] new thumbnail:', newThumbnail)
    }

    const updatedNews = await news.update({
      title: title || news.title,
      content: content || news.content,
      thumbnail: newThumbnail,
      updatedAt: new Date(),
    })

    return res.status(200).json({
      error: false,
      message: 'Actualité mise à jour avec succès.',
      data: updatedNews,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'actualité :", error)
    return res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue.',
    })
  }
}

exports.Delete = async (req, res) => {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: "Requête invalide : ID de l'actualité manquant ou incorrect.",
      })
    }

    const news = await News.findOne({ where: { id: parseInt(id, 10) } })

    if (!news) {
      return res.status(404).json({
        error: true,
        message: 'Actualité introuvable.',
      })
    }

    if (news.thumbnail) {

      const thumbnailPath = path.join(
        __dirname,
        '../../public/uploads',
        path.basename(news.thumbnail)
      )

      if (fs.existsSync(thumbnailPath)) {
        try {
          fs.unlinkSync(thumbnailPath)
        } catch (error) {
          console.error("Erreur lors de la suppression de l'image :", error)
        }
      } else {
        console.log("Le fichier à supprimer n'existe pas.")
      }
    }

    await news.destroy()

    return res.status(200).json({
      error: false,
      message: "L'actualité a été supprimée avec succès.",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'actualité :", error)
    return res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue.',
    })
  }
}
