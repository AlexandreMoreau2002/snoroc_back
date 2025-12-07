const fs = require('fs')
const path = require('path')
const Event = require('../models/event.model')

exports.Create = async (req, res) => {
  try {
    const { title, content, address } = req.body

    if (!title || !content || !address || !req.file) {
      return res.status(400).json({
        error: true,
        message: 'Titre, contenu, adresse et image sont obligatoires.',
      })
    }

    const authorId = req.user?.userId
    if (!authorId) {
      return res.status(401).json({
        error: true,
        message: 'Utilisateur non authentifié.',
      })
    }

    const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(
      req.file.filename
    )}`

    await Event.create({
      authorId,
      title,
      content,
      address,
      thumbnail: thumbnailUrl,
    })

    return res.status(201).json({
      error: false,
      message: 'Évènement créé avec succès.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue.',
    })
  }
}

exports.GetAll = async (req, res) => {
  try {
    const events = await Event.findAll()

    return res.status(200).json({
      error: false,
      message: 'Les évènements ont bien été récupérés',
      data: events,
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

    const event = await Event.findOne({ where: { id: parseInt(id, 10) } })

    if (!event) {
      return res.status(404).json({
        error: true,
        message: "L'évènement est introuvable.",
      })
    }

    return res.status(200).json({
      error: false,
      message: "L'évènement a été récupéré.",
      data: event,
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
    const { title, content, address } = req.body

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

    const event = await Event.findOne({ where: { id: parseInt(id, 10) } })

    if (!event) {
      return res.status(404).json({
        error: true,
        message: "L'évènement est introuvable.",
      })
    }

    let newThumbnail = event.thumbnail

    if (req.file) {
      const oldThumbnailPath = path.join(
        __dirname,
        '../../public/uploads',
        path.basename(event.thumbnail)
      )

      if (fs.existsSync(oldThumbnailPath)) {
        try {
          fs.unlinkSync(oldThumbnailPath)
        } catch (err) {
          console.error("Erreur lors de la suppression de l'ancienne image :", err)
        }
      } else {
        console.log('Aucune ancienne image trouvée.')
      }

      newThumbnail = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(
        req.file.filename
      )}`
    }

    const updatedEvent = await event.update({
      title: title || event.title,
      content: content || event.content,
      address: address || event.address,
      thumbnail: newThumbnail,
      updatedAt: new Date(),
    })

    return res.status(200).json({
      error: false,
      message: 'Évènement mis à jour avec succès.',
      data: updatedEvent,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évènement :", error)
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
        message: "Requête invalide : ID de l'évènement manquant ou incorrect.",
      })
    }

    const event = await Event.findOne({ where: { id: parseInt(id, 10) } })

    if (!event) {
      return res.status(404).json({
        error: true,
        message: "L'évènement est introuvable.",
      })
    }

    if (event.thumbnail) {
      const thumbnailPath = path.join(
        __dirname,
        '../../public/uploads',
        path.basename(event.thumbnail)
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

    await event.destroy()

    return res.status(200).json({
      error: false,
      message: "L'évènement a été supprimé avec succès.",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'évènement :", error)
    return res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue.',
    })
  }
}
