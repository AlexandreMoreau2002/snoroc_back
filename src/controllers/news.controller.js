// Create
// // Vérification des données (title, content, thumbnail, authentification via middleware) ✅
// // Mise en ligne de l'image sur le serveur et récupération de l'url ✅
// // Envoi d'une notification aux utilisateurs inscrits à la newsletter

// Update
// // Vérification des données (title, content, thumbnail, authentification via middleware)
// // Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs

// Delete
// // Vérification des données (id de l'actualité, authentification via middleware)

// Get / GetById
// // Vérification des données (id de l'actualité)

const News = require('../models/news.model')
const User = require('../models/user.model')
const { notifNewsletterNews } = require('../services/email/newNews.service')
const nodemailer = require('nodemailer')

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

    // Générer l'URL publique de l'image
    const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/${
      req.file.filename
    }`

    // Sauvegarder dans la base de données
    const news = await News.create({
      authorId,
      title,
      content,
      thumbnail: thumbnailUrl,
    })

    // Récupérer tous les utilisateurs abonnés à la newsletter
    const users = await User.findAll({
      where: { newsletter: true },
    })

    if (users.length === 0) {
      return res.status(201).json({
        error: false,
        message:
          'Actualité créée avec succès, mais aucun utilisateur abonné à la newsletter.',
      })
    }

    // Configuration de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Envoi de l'email à chaque utilisateur
    for (const user of users) {
        console.log(user.email)
      const emailData = notifNewsletterNews(user.email, news.id)

      try {
        await transporter.sendMail(emailData)
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

// exports.GetAll = async (req, res) => {
//     try {
//         const news = await News.findAll();

//         return res.status(200).json({
//             error: false,
//             message: "Les actualités ont bien été récupérés",
//             data: news
//         })
//     } catch (error) {
//         console.log("error");
//         return res.status(500).json({
//             error: true,
//             message: "Une erreur interne est survenue, veuillez réessayer plus tard."
//         })
//     }
// }

// exports.GetById = async (req, res) => {
//     try {
//         const { id } = req.body;

//         if (!id || isNaN(id)) {
//             return res.status(400).json({
//                 error: true,
//                 message: "Requête invalide."
//             });
//         }

//         const news = await News.findOne({ where: { id: id } });

//         if (!news) {
//             return res.status(404).json({
//                 error: true,
//                 message: "L'actualité est introuvable."
//             });
//         }

//         return res.status(200).json({
//             error: false,
//             message: "L'actualité a été récupérée.",
//             data: news
//         });
//     } catch (error) {
//         console.log("error");
//         return res.status(500).json({
//             error: true,
//             message: "Une erreur interne est survenue, veuillez réessayer plus tard."
//         })
//     }
// }

// exports.Update = async (req, res) => {
//     try {
//         const { id, title, description, content } = req.body;
//         const picture = req.file;
//         console.log(req.body, req.file)

//         if (!id || isNaN(id)) {
//             return res.status(400).json({
//                 error: true,
//                 message: "Requête invalide."
//             });
//         }

//         const news = await News.findOne({ where: { id: id } });

//         if (!news) {
//             return res.status(404).json({
//                 error: true,
//                 message: "L'article est introuvable."
//             });
//         }

//         const newsData = {
//             title: title || news.title,
//             description: description || news.description,
//             content: content || news.content,
//             thumbnail: picture?.filename || news.thumbnail
//         }

//         await news.update(newsData);

//         return res.status(200).json({
//             error: false,
//             message: "L'article a bien été mis à jour."
//         });

//     } catch (error) {
//         console.log("error");
//         return res.status(500).json({
//             error: true,
//             message: "Une erreur interne est survenue, veuillez réessayer plus tard."
//         })
//     }
// }

// exports.Delete = async (req, res) => {
//     try {
//         const { id } = req.body;

//         if (!id || isNaN(id)) {
//             return res.status(400).json({
//                 error: true,
//                 message: "Requête invalide."
//             });
//         }

//         const news = await News.findOne({ where: { id: id } });

//         if (!news) {
//             return res.status(404).json({
//                 error: true,
//                 message: "L'actualité est introuvable."
//             });
//         }

//         await news.destroy();

//         return res.status(201).json({
//             error: false,
//             message: "L'actualité a bien été supprimée."
//         });

//     } catch (error) {
//         console.log("error");
//         return res.status(500).json({
//             error: true,
//             message: "Une erreur interne est survenue, veuillez réessayer plus tard."
//         })
//     }
// }
