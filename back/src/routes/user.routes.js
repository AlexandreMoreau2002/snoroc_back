const express = require("express"); // Importation d’express
const router = express.Router(); // Initialisation d’un routeur grâce à express
const { Login, SignUp, Update, Delete, 
        GetById, GetProfile, ForgotPassword, 
        ResetPassword, VerifyEmail,    
        UpdateNewsletter, UpdatePassword 
        } = require("../controllers/user.controller"); // Importation de nos fonction du fichier controller

// Cette route va permettre à l’utilisateur de s’inscrire
router.post('/signup', SignUp);

// Cette route va permettre à l’utilisateur de se connecter à son compte
router.post('/login',Login);

// route pour modifier le profil
router.patch('/update', Update);

// //route pour supprimer un user
router.delete('/delete', Delete);

// //
router.get('/:id', GetById);


router.get('/profile', GetProfile);

// // route pour le mot de passe oublié 
router.post('/forgot-password', ForgotPassword);

// // route pour ré initialiser le mdp
router.post('/reset-password', ResetPassword);

// // route pour verifier l'email
router.get('/verify-email', VerifyEmail)

// // route pour mettre a jour l'abonement a la newsletter
router.patch('/update-newsletter', UpdateNewsletter)

// //
router.patch('/update-password', UpdatePassword)

module.exports = router;


// petit test des routes de l'api
router.get('/test' , () =>  console.log('hello')) // ecrit dans le terminal
router.get('/alors', (req, res) => res.send('alors evidement, me revoila')) // renvois la res sur le port