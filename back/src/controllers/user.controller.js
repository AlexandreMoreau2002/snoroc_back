require("dotenv").config();
// const nodemailer = require("nodemailer");
const { sendEmail } = require("../utils/email.utils");

const { phone } = require("phone");
const User = require("../models/user.model");
const {
  encryptPassword,
  comparePassword,
} = require("../utils/encryptPassword.utils");
const { generateJwt } = require("../utils/generateJwt.utils");

// fonction de control pour l'inscription

// Vérification des données (email, password, firstname, lastname, phone, civility, newsletter)✅
// Vérification de l'email (unique)✅
// Vérification du mot de passe (8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre)✅
// Génération du token d'activation✅
// Génération de la date d'expiration du code d'activation✅
// Envoi d'un email à l'adresse de l'utilisateur✅
// Enregistrement de l'utilisateur et du code d'activation ainsi que de la date d'expiration du code✅

exports.SignUp = async (req, res) => {
  // Le try/catch permet de gérer les erreurs sans faire planter l’API et la retourner dans le catch
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      userPhone,
      civility,
      newsletter,
    } = req.body;
    if (!firstname || !lastname || !email || !password || !civility) {
      return res.status(400).json({
        error: true,
        message:
          "La requête est invalide, Tous les champs doivent être remplis.",
      });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      // Si le format de l’adresse mail est incorrecte, on renvoi une erreur à l’utilisateur
      return res.status(400).json({
        error: true,
        message: "L'email n’est pas dans le bon format.",
      });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: true,
        message:
          "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre.",
      });
    }

    // normalisation de userPhone
    const phoneData = phone(userPhone, { country: "FR" }); // Assumez que userPhone est "+33769666370" et le pays est la France
    if (phoneData.isValid) {
      console.log(phoneData.phoneNumber); // Cela devrait imprimer un numéro normalisé
    } else {
      console.log("Numéro de téléphone non valide");
    }

    // Vérification de l'unicité de l'email
    const isUserExist = await User.findOne({ where: { email: email } });
    if (isUserExist) {
      return res
        .status(400)
        .send({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // Securité
    const encryptedPassword = await encryptPassword(password);
    const accessToken = await generateJwt({
      firstname: User.firstname,
      email: User.email,
    });

    // Mail
    const emailData = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Activation de votre compte",
      text: `Votre code d'activation est : ${accessToken}. Il est valide pour 15 minutes.`,
      html: `<p>Votre code d'activation est : </p><br><p><strong>${accessToken}</strong></p><br> <p>Il est valide pour <strong>15 minutes</strong>.</p>`,
    };

    // Appel de la fonction d'envoi d'email
    const emailResult = await sendEmail(emailData);
    if (!emailResult.success) {
      return res
        .status(500)
        .json({ error: true, message: emailResult.message });
    }

    // Donnée a envoyer
    const userData = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: userPhone,
      civility: civility,
      password: encryptedPassword,
      newsletter: newsletter,
      emailVerificationToken: accessToken,
      emailVerificationTokenExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      isActive: false,
      isVerified: false,
      isRestricted: false,
    };

    // envoi des données a la bdd
    await new User(userData).save();
    // La ligne ci-dessus permet de créer une nouvelle instance d’utilisateur grâce à notre modèle et le
    // .save() permet de l'enregistrer dans la base de données.
    return res.status(200).json({
      error: false,
      message: "Votre compte a bien été créé.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: true,
      message: `Une erreur est survenue : ${err.message}.`,
    });
  }
};

// fonction de control des connections des utilisateurs
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: true, message: "La requête est invalide." });
    }

    let user;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (emailRegex.test(email)) {
      user = await User.findOne({ where: { email: email } });
    }

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "L'identifiant et/ou le mot de passe est incorrect.",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: "L'identifiant et/ou le mot de passe est incorrect.",
      });
    }

    const accessToken = await generateJwt({
      firstname: user.firstname,
      email: user.email,
    });

    await user.update({ accessToken: accessToken });
    return res.status(200).json({
      error: false,
      message: "Vous êtes désormais connecté.",
      accessToken: accessToken,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: `Une erreur est survenue : ${err}.`,
    });
  }
};

// fonction pour l'update de données utilisateurs
exports.Update = async (req, res) => {
  try {
    const { id, firstName, lastName, email } = req.body;
    let { phoneNumber } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: "Requête invalide.",
      });
    }

    const user = await User.findOne({ where: { id: id } });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Utilisateur introuvable.",
      });
    }

    const userData = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phoneNumber: phoneNumber || user.phoneNumber,
    };

    const nameRegex = /^[a-zA-Z]+$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/i;

    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      return res.status(400).json({
        error: true,
        message:
          "Le nom et le prénom doivent contenir au moins 2 caractères et ne doivent pas contenir de chiffres.",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: true,
        message: "L'adresse email est invalide.",
      });
    }

    if (phoneNumber) {
      const phoneData = await phone(phoneNumber, { country: "FR" });
      if (!phoneData.isValid) {
        return res.status(400).json({
          error: true,
          message: "Le numéro de téléphone est incorrect.",
        });
      } else {
        phoneNumber = phoneData.phoneNumber;
      }
    }

    await user.update(userData);

    return res.status(200).json({
      error: false,
      message: "Le profil a bien été mis à jour.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Une erreur interne est survenue, veuillez réessayer plus tard.",
    });
  }
};

// delete user

// getbyid

// get profile

// forgotpassword

// resertpassword

// verify email

// Update newsletter

// Update password
