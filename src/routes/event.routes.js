const express = require('express')
const auth = require('../middlewares/authenticate.middlewares')
const { roleMiddleware } = require('../middlewares/role.middlewares')
const upload = require('../middlewares/upload.middleware')
const { GetAll, Create, GetById, Update, Delete } = require('../controllers/event.controller')

const router = express.Router()

router.get('/getall', GetAll)
router.get('/id/:id', GetById)
router.post('/create', auth, roleMiddleware('admin'), upload.single('thumbnail'), Create)
router.patch('/update/:id', auth, roleMiddleware('admin'), upload.single('thumbnail'), Update)
router.delete('/delete/:id', auth, roleMiddleware('admin'), Delete)

module.exports = router
