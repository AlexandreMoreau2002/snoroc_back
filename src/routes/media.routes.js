const express = require('express')
const router = express.Router()
const {Create, Update, GetAll, GetById, Delete } = require('../controllers/media.controller')

// Création d'un média
router.post('/create', Create);

// Mise à jour d'un média par son ID
router.patch('/update/:id', Update);

// Récupération de tous les médias
router.get('/', GetAll);

// Récupération d'un média par son ID
router.get('/:id', GetById);

// Suppression d'un média par son ID
router.delete('/delete/:id', Delete);

module.exports = router;