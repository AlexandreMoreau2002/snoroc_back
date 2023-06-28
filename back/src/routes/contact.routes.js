// POST /contact
// PUT /contact/:id
// GET /contact
// GET /contact/:id
// DELETE /contact/:id


const express = require('express');
const router = express.Router();
const contactController = require("../controllers/contact.controller")

// POST /contact 
router.post('/', (req, res) => {
  // Logique pour créer un nouveau contact
});

// PUT /contact/:id
router.put('/:id', (req, res) => {
  // Logique pour mettre à jour un contact existant
});

// GET /contact
router.get('/', (req, res) => {
  // Logique pour récupérer tous les contacts
});

// GET /contact/:id
router.get('/:id', (req, res) => {
  // Logique pour récupérer un contact spécifique par son ID
});

// DELETE /contact/:id
router.delete('/:id', (req, res) => {
  // Logique pour supprimer un contact par son ID
});

module.exports = router;
