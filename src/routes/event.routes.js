const express = require('express');
const router = express.router();
const {GetAll, Create, GetById, Update, Delete} = require('../controllers/event.controller');

// Récupération de tous les évènements
router.get('/', GetAll);

// Création d'un évènement
router.post('/post', Create);

// Récupération d'un évènement par son ID
router.get('/get/:id', GetById);

// Mise à jour d'un évènement
router.patch('/update/:id', Update);

// Suppression d'un évènement
router.delete('/delete/:id', Delete);

module.exports = router;