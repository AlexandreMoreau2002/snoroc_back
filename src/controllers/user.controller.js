require('dotenv').config()
const { sendEmail } = require('../../config/nodemailer.config')
const {
  emailDataVerification,
} = require('../services/email/verifyEmail.service')
const {
  emailDataforgotPassword,
} = require('../services/email/forgotPasswordEmail.service')

const { phone } = require('phone')
const User = require('../models/user.model')
const {
  encryptPassword,
  comparePassword,
} = require('../utils/encryptPassword.utils')
const { generateJwt } = require('../utils/generateJwt.utils')

const {
  generateVerificationCode,
  generateExpirationDate,
} = require('../utils/validation.utils')

exports.SignUp = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      userPhone,
      civility,
      newsletter,
    } = req.body
    if (!firstname || !lastname || !email || !password || !civility) {
      return res.status(400).json({
        value: false,
        message:
          'La requête est invalide, Tous les champs doivent être remplis.',
      })
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(email)) {
      // Si le format de l’adresse mail est incorrecte, on renvoi une erreur à l’utilisateur
      return res.status(400).json({
        value: false,
        message: "L'email n’est pas dans le bon format.",
      })
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        value: false,
        message:
          'Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre.',
      })
    }

    // normalisation de userPhone
    const phoneData = phone(userPhone, { country: 'FR' })
    if (phoneData.isValid) {
    } else {
      console.log('Numéro de téléphone non valide')
    }

    // Vérification de l'unicité de l'email
    const isUserExist = await User.findOne({ where: { email: email } })
    if (isUserExist) {
      return res
        .status(400)
        .send({ message: 'Un utilisateur avec cet email existe déjà.' })
    }

    // Securité
    const encryptedPassword = await encryptPassword(password)
    const VerificationCode = generateVerificationCode()

    // Donnée a envoyer a la db
    const userData = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      userPhone: phoneData.phoneNumber,
      civility: civility,
      password: encryptedPassword,
      newsletter: newsletter,
      emailVerificationToken: VerificationCode,
      emailVerificationTokenExpires: generateExpirationDate(15),
    }

    // envoi des données a la bdd
    const newUser = await new User(userData).save()
    // La ligne ci-dessus permet de créer une nouvelle instance d'utilisateur grâce à notre modèle et le
    // .save() permet de l'enregistrer dans la base de données.

    // Génération du token JWT pour la connexion automatique
    const accessToken = await generateJwt({
      id: newUser.id,
      firstname: newUser.firstname,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    })

    // Mise à jour du token dans la base de données
    await newUser.update({ accessToken })

    // Tentative d'envoi de l'email de vérification (non-bloquant)
    try {
      const emailData = emailDataVerification(email, VerificationCode)
      await sendEmail(emailData)
      console.log('Email de vérification envoyé avec succès')
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError.message)
      // L'erreur d'email n'empêche pas la création du compte
    }

    return res.status(200).json({
      error: false,
      message: 'Votre compte a bien été créé. Vous êtes maintenant connecté.',
      accessToken,
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      value: false,
      message: `Une erreur est survenue : ${err.message}.`,
    })
  }
}

exports.VerifyEmail = async (req, res) => {
  const { email, emailVerificationToken } = req.body
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    })
    if (!user) {
      throw new Error('Utilisateur introuvable')
    }

    if (
      !user.emailVerificationToken ||
      new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString() >
        user.emailVerificationTokenExpires.toISOString()
    ) {
      throw new Error('Code invalide ou expiré.')
    }

    // Verification du tokken
    const code = user.emailVerificationToken
    if (code !== emailVerificationToken) {
      throw new Error('Le code fourni est incorrect.')
    }

    // Mise à jour de l'utilisateur comme vérifié et suppression du token
    await user.update({
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    })
    return res.status(200).json({
      error: false,
      message: 'Email validé.',
    })
  } catch (err) {
    return res.status(500).json({
      value: false,
      message: `${err.message}.`,
    })
  }
}

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        value: false,
        message: 'La requête est invalide.',
      })
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        value: false,
        message: "Format d'email invalide.",
      })
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({
        value: false,
        message: "L'identifiant et/ou le mot de passe est incorrect.",
      })
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        value: false,
        message: "L'identifiant et/ou le mot de passe est incorrect.",
      })
    }

    const accessToken = await generateJwt({
      id: user.id,
      firstname: user.firstname,
      email: user.email,
      isAdmin: user.isAdmin,
    })

    await user.update({ accessToken })

    return res.status(200).json({
      message: 'Vous êtes désormais connecté.',
      accessToken,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    })
  } catch (err) {
    console.error('Erreur lors de la connexion :', err)
    return res.status(500).json({
      value: false,
      message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
    })
  }
}

// fonction pour l'update de données utilisateurs
exports.Update = async (req, res) => {
  try {
    const { id, firstName, lastName, email, phoneNumber } = req.body

    // Validation de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        value: false,
        message: 'Requête invalide : ID utilisateur manquant ou incorrect.',
      })
    }

    // Récupération de l'utilisateur
    const user = await User.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({
        value: false,
        message: 'Utilisateur introuvable.',
      })
    }

    // Validation des données optionnelles
    const nameRegex = /^[a-zA-Z]+$/
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/i

    if (firstName && !nameRegex.test(firstName)) {
      return res.status(400).json({
        value: false,
        message: 'Le prénom doit contenir uniquement des lettres.',
      })
    }

    if (lastName && !nameRegex.test(lastName)) {
      return res.status(400).json({
        value: false,
        message: 'Le nom doit contenir uniquement des lettres.',
      })
    }

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        value: false,
        message: "L'adresse email est invalide.",
      })
    }

    if (phoneNumber) {
      const phoneData = await phone(phoneNumber, { country: 'FR' })
      if (!phoneData.isValid) {
        return res.status(400).json({
          value: false,
          message: 'Le numéro de téléphone est incorrect.',
        })
      }
    }

    // Mise à jour des données
    const userData = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phoneNumber: phoneNumber || user.phoneNumber,
    }

    await user.update(userData)

    // Réponse
    return res.status(200).json({
      error: false,
      message: 'Le profil a bien été mis à jour.',
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      value: false,
      message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
    })
  }
}

// delete user
exports.Delete = async (req, res) => {
  try {
    const { id } = req.body

    // Vérification de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        value: false,
        message: 'Requête invalide : ID utilisateur manquant ou incorrect.',
      })
    }

    // Récupération de l'utilisateur
    const user = await User.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({
        value: false,
        message: 'Utilisateur introuvable.',
      })
    }

    // Suppression de l'utilisateur
    await user.destroy()

    return res.status(200).json({
      error: false,
      message: "L'utilisateur a été supprimé avec succès.",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      value: false,
      message: 'Une erreur interne est survenue.',
    })
  }
}

// getbyid
exports.GetById = async (req, res) => {
  try {
    const { id } = req.params

    // Validation de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        value: false,
        message: 'Requête invalide : ID utilisateur manquant ou incorrect.',
      })
    }

    // Récupération de l'utilisateur
    const user = await User.findOne({
      where: { id },
      attributes: [
        'id',
        'firstname',
        'lastname',
        'email',
        'userPhone',
        'civility',
        'newsletter',
        'isVerified',
        'isAdmin',
        'createdAt',
        'updatedAt',
      ],
    })

    if (!user) {
      return res.status(404).json({
        value: false,
        message: 'Utilisateur introuvable.',
      })
    }

    return res.status(200).json({
      error: false,
      data: user,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      value: false,
      message: 'Une erreur interne est survenue.',
    })
  }
}
// get profile
exports.GetProfile = async (req, res) => {
  try {
    const { userId } = req.user // L'utilisateur connecté (via middleware d'authentification)

    if (!userId) {
      return res.status(401).json({
        value: false,
        message: 'Utilisateur non authentifié.',
      })
    }

    // Récupérer le profil de l'utilisateur
    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ['password', 'accessToken'] }, // Exclure les données sensibles
    })

    if (!user) {
      return res.status(404).json({
        value: false,
        message: 'Profil utilisateur introuvable.',
      })
    }

    return res.status(200).json({
      error: false,
      data: user,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      value: false,
      message: 'Une erreur interne est survenue.',
    })
  }
}

// forgotpassword
exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Validation de l'email
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "L'email est requis.",
      })
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Aucun utilisateur trouvé avec cet email.',
      })
    }

    // Générer un token de réinitialisation
    const resetToken = generateVerificationCode()
    user.passwordResetToken = resetToken
    user.passwordResetTokenExpires = generateExpirationDate(15)
    await user.save()

    // Envoyer un email avec le token
    const emailData = emailDataforgotPassword(email, resetToken)
    const emailResult = await sendEmail(emailData)

    if (!emailResult.success) {
      return res.status(500).json({
        status: false,
        message: "Échec de l'envoi de l'email.",
      })
    }

    return res.status(200).json({
      status: true,
      message: 'Un email de réinitialisation de mot de passe a été envoyé.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
    })
  }
}

// resertpassword
exports.ResetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body

    // Validation des données
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        status: false,
        message:
          'Email, token de réinitialisation et nouveau mot de passe sont requis.',
      })
    }

    // Vérification du format du mot de passe
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: false,
        message:
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.',
      })
    }

    // Récupération de l'utilisateur
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Aucun utilisateur trouvé avec cet email.',
      })
    }

    // Vérification du token et de son expiration
    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== resetToken ||
      new Date() > user.passwordResetTokenExpires
    ) {
      return res.status(400).json({
        status: false,
        message: 'Token de réinitialisation invalide ou expiré.',
      })
    }

    // Mise à jour du mot de passe
    const encryptedPassword = await encryptPassword(newPassword)
    await user.update({
      password: encryptedPassword,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    })

    return res.status(200).json({
      status: true,
      message: 'Votre mot de passe a été réinitialisé avec succès.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
    })
  }
}

// Update newsletter
exports.UpdateNewsletter = async (req, res) => {
  try {
    const { id, newsletter } = req.body

    // Validation des données
    if (!id || isNaN(id)) {
      return res.status(400).json({
        value: false,
        message: 'Requête invalide : ID utilisateur manquant ou incorrect.',
      })
    }

    if (typeof newsletter !== 'boolean') {
      return res.status(400).json({
        value: false,
        message: "Le champ 'newsletter' doit être de type boolean.",
      })
    }

    // Récupérer l'utilisateur
    const user = await User.findOne({ where: { id } })

    if (!user) {
      return res.status(404).json({
        value: false,
        message: 'Utilisateur introuvable.',
      })
    }

    // Mise à jour de la newsletter
    user.newsletter = newsletter
    await user.save()

    return res.status(200).json({
      error: false,
      message: 'Abonnement à la newsletter mis à jour avec succès.',
      data: { id: user.id, newsletter: user.newsletter },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      value: false,
      message: 'Une erreur interne est survenue.',
    })
  }
}

// Update password
exports.UpdatePassword = async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body

    // Validation des données
    if (!id || isNaN(id)) {
      return res.status(400).json({
        value: false,
        message: 'Requête invalide : ID utilisateur manquant ou incorrect.',
      })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        value: false,
        message:
          'Le mot de passe actuel et le nouveau mot de passe sont requis.',
      })
    }

    // Vérification du format du nouveau mot de passe
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        value: false,
        message:
          'Le nouveau mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.',
      })
    }

    // Récupération de l'utilisateur
    const user = await User.findOne({ where: { id } })
    if (!user) {
      return res.status(404).json({
        value: false,
        message: 'Utilisateur introuvable.',
      })
    }

    // Vérification du mot de passe actuel
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    )
    if (!isPasswordValid) {
      return res.status(401).json({
        value: false,
        message: 'Le mot de passe actuel est incorrect.',
      })
    }

    // Mise à jour du mot de passe
    const encryptedPassword = await encryptPassword(newPassword)
    await user.update({ password: encryptedPassword })

    return res.status(200).json({
      error: false,
      message: 'Le mot de passe a été mis à jour avec succès.',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      value: false,
      message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
    })
  }
}

// Update user role
exports.UpdateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { isAdmin } = req.body

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({
        error: true,
        message: "Le champ 'isAdmin' doit être de type boolean.",
      })
    }

    // Récupérer l'utilisateur à mettre à jour
    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Utilisateur introuvable.',
      })
    }

    // Mise à jour du rôle
    await user.update({ isAdmin })

    return res.status(200).json({
      error: false,
      message: `Le rôle de l'utilisateur a été mis à jour avec succès.`,
      data: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: true,
      message: 'Une erreur est survenue lors de la mise à jour du rôle.',
    })
  }
}
