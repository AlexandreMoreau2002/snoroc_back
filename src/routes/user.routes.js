// back/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authenticate.middlewares');
const { roleMiddleware } = require('../middlewares/role.middlewares');

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
  UpdateUserRole
} = require('../controllers/user.controller')

// Routes explicites
router.get('/', () => console.log('hello depuis / tout cours'))
router.get('/test', () => console.log('hello depuis /test'))
router.get('/alors', (req, res) => res.send('Alors évidemment, me revoilà'));

// Routes publiques
router.post('/login', Login);
router.post('/signup', SignUp);
router.post('/verify-email', VerifyEmail);
router.post('/reset-password', ResetPassword);
router.post('/forgot-password', ForgotPassword);

// Routes protégées
router.patch('/update', auth, Update);
router.delete('/delete', auth, Delete);
router.get('/profile', auth, GetProfile);
router.patch('/update-password', auth, UpdatePassword);
router.patch('/update-newsletter', auth, UpdateNewsletter);
router.get('/id=:id', auth, GetById)
router.get('/admin-only', auth, roleMiddleware('admin'), (req, res) => {
  res.status(200).json({ message: 'Bienvenue Admin.' });
});

// Route pour mettre à jour le rôle d'un utilisateur
router.patch('/update-role/:id', auth, roleMiddleware('admin'), UpdateUserRole);

module.exports = router;