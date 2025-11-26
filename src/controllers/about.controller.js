const About = require('../models/about.model');
const fs = require('fs');
const path = require('path');

exports.getAbout = async (req, res) => {
    try {
        // On récupère le premier enregistrement (il n'y en a qu'un pour la page About)
        let about = await About.findOne();

        // Si pas encore de contenu, on renvoie un objet vide ou par défaut
        if (!about) {
            return res.status(200).json({
                title: 'Titre par défaut',
                description: 'Description par défaut',
                image: null
            });
        }

        res.status(200).json(about);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Erreur lors de la récupération du contenu About." });
    }
};

exports.updateAbout = async (req, res) => {
    try {
        const { title, description } = req.body;
        let image = null;

        let about = await About.findOne();

        if (about) {
            // Mise à jour
            const updateData = { title, description };
            if (req.file) {
                // Supprimer l'ancienne image si elle existe
                if (about.image) {
                    const oldImagePath = path.join(__dirname, '../../public/uploads', path.basename(about.image));
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                // Construire l'URL complète comme pour les news
                updateData.image = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(req.file.filename)}`;
            }
            await about.update(updateData);
        } else {
            // Création si n'existe pas
            if (req.file) {
                image = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(req.file.filename)}`;
            }
            about = await About.create({
                title,
                description,
                image
            });
        }

        res.status(200).json({ message: "Contenu About mis à jour avec succès.", about });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Erreur lors de la mise à jour du contenu About." });
    }
};
