const express = require('express');
const router = express.Router();
const {Create, Update, GetAll, GetById, DeleteById } = require('../controllers/contact.controller');

// Création d'un contact
router.post('/create', Create);

// Mise à jour d'un contact par son ID
// router.patch('/update/:id', Update);

// Récupération de tous les contacts
// router.get('/', GetAll);

// Récupération d'un contact par son ID
// router.get('/:id', GetById);

// Suppression d'un contact par son ID
// router.delete('/delete/:id', DeleteById);

module.exports = router;
