const express = require('express');
const router = express.Router();
const {GetAll, Create, Update, Delete, GetById} = require('../controllers/news.controller');

// Récupération de toutes les actualités
router.get('/', GetAll);

// Création d'une actualité
router.post('/create', Create);

// Récupération d'une actualité par son ID
router.get('/:id', GetById);

// Mise à jour d'une actualité
router.patch('/update/:id', Update);

// Suppression d'une actualité
router.delete('/delete/:id', Delete);

module.exports = router;