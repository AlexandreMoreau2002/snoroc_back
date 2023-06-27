const express = require("express"); // Importation d’express
const router = express.Router(); // Initialisation d’un routeur grâce à express
const userController = require("../controllers/user.controller"); // Importation de notre contrôleur

router.post('/signup', userController.SignUp);
// Cette route va permettre à l’utilisateur de s’inscrire
router.post('/signin', userController.SignIn);
// Cette route va permettre à l’utilisateur de se connecter à son compte
module.exports = router;


/*
Signup
Update
Delete
Get / GetById
GetProfile
ForgotPassword
ResetPassword
VerifyEmail
Login
UpdateRole
UpdateNewsletter
UpdatePassword
*/