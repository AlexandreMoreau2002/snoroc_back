const express = require('express')
const auth = require('../middlewares/authenticate.middlewares')
const { roleMiddleware } = require('../middlewares/role.middlewares')
const upload = require('../middlewares/upload.middleware')
const router = express.Router()
const { Create, Update, GetAll, GetById, Delete } = require('../controllers/media.controller')

// Routes publiques
router.get('/getall', GetAll)
router.get('/id/:id', GetById)

// Routes protégées
router.post('/create', auth, roleMiddleware('admin'), upload.single('thumbnail'), Create)
router.patch('/update/:id', auth, roleMiddleware('admin'), upload.single('thumbnail'), Update)
router.delete('/delete/:id', auth, roleMiddleware('admin'), Delete)

module.exports = router
