// Create
    // Vérification des données (title, content, thumbnail, authentification via middleware)
    // Mise en ligne de l'image sur le serveur et récupération de l'url
    // Envoi d'une notification aux utilisateurs inscrits à la newsletter
// Update
    // Vérification des données (title, content, thumbnail, authentification via middleware)
    // Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs
// Delete
    // Vérification des données (id de l'actualité, authentification via middleware)
// Get / GetById
    // Vérification des données (id de l'actualité)

const News = require("../models/news.model");
const User = require("../models/user.model");
const { email } = require("../utils/email.utils");

exports.Create = async (req, res) => {
    try {
        const { title, description, content, isNotified } = req.body;

        const { id: authorId } = req.decoded;

        const thumbnail = req.file.filename;

        if (!title || !thumbnail || !description || !content || !authorId) {
            return res.status(400).json({
                error: true,
                message: "Requête invalide."
            });
        }

        await new News({
            title: title,
            thumbnail: thumbnail,
            description: description,
            content: content,
            authorId: authorId
        }).save();

        if (isNotified) {
            const usersWithNotification = await User.findAll({ where: { notification: true } });

            usersWithNotification.forEach(async (user) => {
                await sendMail("newNews", {}, user.email);
            });
        }

        return res.status(201).json({
            error: false,
            message: "L'actualité a bien été créée."
        });
    } catch (error) {
        console.log("error", error);
        const errorMessage = error?.message;
        return res.status(500).json({
            error: errorMessage,
            message: "Une erreur interne est survenue, veuillez réessayer plus tard."
        })
    }
}

exports.GetAll = async (req, res) => {
    try {
        const news = await News.findAll();

        return res.status(200).json({
            error: false,
            message: "Les actualités ont bien été récupérés",
            data: news
        })
    } catch (error) {
        console.log("error");
        return res.status(500).json({
            error: true,
            message: "Une erreur interne est survenue, veuillez réessayer plus tard."
        })
    }
}

exports.GetById = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: "Requête invalide."
            });
        }

        const news = await News.findOne({ where: { id: id } });

        if (!news) {
            return res.status(404).json({
                error: true,
                message: "L'actualité est introuvable."
            });
        }

        return res.status(200).json({
            error: false,
            message: "L'actualité a été récupérée.",
            data: news
        });
    } catch (error) {
        console.log("error");
        return res.status(500).json({
            error: true,
            message: "Une erreur interne est survenue, veuillez réessayer plus tard."
        })
    }
}

exports.Update = async (req, res) => {
    try {
        const { id, title, description, content } = req.body;
        const picture = req.file;
        console.log(req.body, req.file)

        if (!id || isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: "Requête invalide."
            });
        }

        const news = await News.findOne({ where: { id: id } });

        if (!news) {
            return res.status(404).json({
                error: true,
                message: "L'article est introuvable."
            });
        }

        const newsData = {
            title: title || news.title,
            description: description || news.description,
            content: content || news.content,
            thumbnail: picture?.filename || news.thumbnail
        }

        await news.update(newsData);

        return res.status(200).json({
            error: false,
            message: "L'article a bien été mis à jour."
        });

    } catch (error) {
        console.log("error");
        return res.status(500).json({
            error: true,
            message: "Une erreur interne est survenue, veuillez réessayer plus tard."
        })
    }
}

exports.Delete = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: "Requête invalide."
            });
        }

        const news = await News.findOne({ where: { id: id } });

        if (!news) {
            return res.status(404).json({
                error: true,
                message: "L'actualité est introuvable."
            });
        }

        await news.destroy();

        return res.status(201).json({
            error: false,
            message: "L'actualité a bien été supprimée."
        });

    } catch (error) {
        console.log("error");
        return res.status(500).json({
            error: true,
            message: "Une erreur interne est survenue, veuillez réessayer plus tard."
        })
    }
}
