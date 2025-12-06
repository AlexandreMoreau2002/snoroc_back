const Media = require('../models/media.model')
const Album = require('../models/albums.model')

const isValidYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+/i
  return pattern.test(url)
}

exports.Create = async (req, res) => {
  try {
    const { title, description, url, albumId } = req.body

    if (!title || !url) {
      return res.status(400).json({
        error: true,
        message: 'Titre et URL YouTube sont obligatoires.',
      })
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: true,
        message: 'Utilisateur non authentifié.',
      })
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({
        error: true,
        message: 'URL YouTube invalide.',
      })
    }

    if (albumId && isNaN(albumId)) {
      return res.status(400).json({
        error: true,
        message: "Requête invalide. L'ID d'album doit être un entier valide.",
      })
    }

    if (albumId) {
      const album = await Album.findOne({ where: { id: parseInt(albumId, 10) } })
      if (!album) {
        return res.status(404).json({
          error: true,
          message: "L'album spécifié est introuvable.",
        })
      }
    }

    await Media.create({
      title,
      description: description || null,
      url,
      albumId: albumId ? parseInt(albumId, 10) : null,
      authorId: req.user.userId,
    })

    return res.status(201).json({
      error: false,
      message: 'Média créé avec succès.',
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
    const medias = await Media.findAll()

    return res.status(200).json({
      error: false,
      message: 'Les médias ont bien été récupérés.',
      data: medias,
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

    const media = await Media.findOne({ where: { id: parseInt(id, 10) } })

    if (!media) {
      return res.status(404).json({
        error: true,
        message: 'Le média est introuvable.',
      })
    }

    return res.status(200).json({
      error: false,
      message: 'Le média a été récupéré.',
      data: media,
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
    const { title, description, url, albumId } = req.body

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

    if (url && !isValidYouTubeUrl(url)) {
      return res.status(400).json({
        error: true,
        message: 'URL YouTube invalide.',
      })
    }

    if (albumId && isNaN(albumId)) {
      return res.status(400).json({
        error: true,
        message: "Requête invalide. L'ID d'album doit être un entier valide.",
      })
    }

    if (albumId) {
      const album = await Album.findOne({ where: { id: parseInt(albumId, 10) } })
      if (!album) {
        return res.status(404).json({
          error: true,
          message: "L'album spécifié est introuvable.",
        })
      }
    }

    const media = await Media.findOne({ where: { id: parseInt(id, 10) } })

    if (!media) {
      return res.status(404).json({
        error: true,
        message: 'Le média est introuvable.',
      })
    }

    const updatedMedia = await media.update({
      title: title || media.title,
      description: description || media.description,
      url: url || media.url,
      albumId: albumId ? parseInt(albumId, 10) : media.albumId,
      updatedAt: new Date(),
    })

    return res.status(200).json({
      error: false,
      message: 'Média mis à jour avec succès.',
      data: updatedMedia,
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du média :', error)
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
        message: "Requête invalide : ID du média manquant ou incorrect.",
      })
    }

    const media = await Media.findOne({ where: { id: parseInt(id, 10) } })

    if (!media) {
      return res.status(404).json({
        error: true,
        message: 'Média introuvable.',
      })
    }

    await media.destroy()

    return res.status(200).json({
      error: false,
      message: 'Le média a été supprimé avec succès.',
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du média :', error)
    return res.status(500).json({
      error: true,
      message: 'Une erreur interne est survenue.',
    })
  }
}
