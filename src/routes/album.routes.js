const express = require('express');
const router = express.Router();
const {Create, Update, GetAll, GetById, DeleteById } = require('../controllers/album.controller');

// Création d'un album
router.post('/', Create);

// Mise à jour d'un album par son ID
router.put('/:id', Update);

// Récupération de tous les albums
router.get('/', GetAll);

// Récupération d'un album par son ID
router.get('/:id', GetById);

// Suppression d'un album par son ID
router.delete('/:id', DeleteById);

module.exports = router;
