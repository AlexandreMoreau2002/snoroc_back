const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authenticate.middlewares')
const { roleMiddleware } = require('../middlewares/role.middlewares')
const {
  Create,
  Update,
  GetAll,
  GetById,
  DeleteById,
} = require('../controllers/contact.controller')

// Public route : création d'un message via le formulaire
router.post('/', Create)

// Routes protégées : gestion par un admin
router.get('/', auth, roleMiddleware('admin'), GetAll)
router.get('/:id', auth, roleMiddleware('admin'), GetById)
router.put('/:id', auth, roleMiddleware('admin'), Update)
router.delete('/:id', auth, roleMiddleware('admin'), DeleteById)

module.exports = router
