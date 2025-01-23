// src/routes/news.routes.js
const express = require('express')
const auth = require('../middlewares/authenticate.middlewares')
const { roleMiddleware } = require('../middlewares/role.middlewares')
const router = express.Router()
const upload = require('../middlewares/upload.middleware')
const {
  GetAll,
  Create,
  Update,
  Delete,
  GetById,
} = require('../controllers/news.controller')

// Récupération de toutes les actualités
// router.get('/', GetAll);

// Création d'une actualité
router.post(
  '/create',
  auth,
  roleMiddleware('admin'),
  upload.single('thumbnail'),
  Create
)

// Récupération d'une actualité par son ID
// router.get('/news=:id', GetById);

// Mise à jour d'une actualité
// router.patch('/update/news=:id', Update);

// Suppression d'une actualité
// router.delete('/delete/news=:id', Delete);

router.get('/', () => console.log('hello depuis / tout cours'))
router.get('/alors', (req, res) => res.send('Alors évidemment, me revoilà'))

module.exports = router
