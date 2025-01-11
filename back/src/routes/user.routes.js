// back/src/routes/user.routes.js
const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate.middlewares')

const {
  Login,
  SignUp,
  Update,
  Delete,
  GetById,
  GetProfile,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
  UpdateNewsletter,
  UpdatePassword,
} = require('../controllers/user.controller')

router.post('/signup', SignUp)
router.post('/login', Login)
router.patch('/update', authenticate, Update)
router.delete('/delete',authenticate,  Delete)
router.get("/:id", authenticate,  GetById)
router.get("/profile", authenticate, GetProfile)
router.post("/forgot-password", ForgotPassword)
router.post("/reset-password", ResetPassword)
router.post('/verify-email', VerifyEmail)
router.patch("/update-newsletter", UpdateNewsletter)
router.patch('/update-password', authenticate, UpdatePassword)

// Routes de test pour vérifier rapidement le fonctionnement de l'API
router.get('/test', () => console.log('hello'))
router.get('/alors', (req, res) => res.send('Alors évidemment, me revoilà'))

module.exports = router
