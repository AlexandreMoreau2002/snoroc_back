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

// Routes test
router.get('/', () => console.log('hello depuis / tout cours'))
router.get('/alors', (req, res) => res.send('Alors évidemment, me revoilà'))

// Routes publiques
router.get('/getall', GetAll)
router.get('/id/:id', GetById)

// Routes protégées
router.post(
  '/create',
  auth,
  roleMiddleware('admin'),
  upload.single('thumbnail'),
  Create
)
router.patch(
  '/update/:id',
  auth,
  roleMiddleware('admin'),
  upload.single('thumbnail'),
  Update
)
router.delete('/delete/:id', auth, roleMiddleware('admin'), Delete)

module.exports = router
