require("dotenv").config();
const { sendEmail } = require("../utils/email.utils");
const { emailDataVerification } = require("../services/email.user");

const { phone } = require("phone");
const User = require("../models/user.model");
const {
  encryptPassword,
  comparePassword,
} = require("../utils/encryptPassword.utils");
const { generateJwt } = require("../utils/generateJwt.utils");

const {
  generateVerificationCode,
  generateExpirationDate,
} = require("../utils/expiration.utils");

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
    const phoneData = phone(userPhone, { country: "FR" });
    if (phoneData.isValid) {
      console.log(phoneData.phoneNumber);
    } else {
      console.log("Numéro de téléphone non valide");
    }

    // Test avec différents formats
    // console.log(phone("+33769666370", { country: "FR" })); // Format international
    // console.log(phone("0769666370", { country: "FR" })); // Format national sans indicatif
    // console.log("Test Invalid Phone:", phone("12345", { country: 'FR' }));

    // Vérification de l'unicité de l'email
    const isUserExist = await User.findOne({ where: { email: email } });
    if (isUserExist) {
      return res
        .status(400)
        .send({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // Securité
    const encryptedPassword = await encryptPassword(password);
    const VerificationCode = generateVerificationCode();

    const emailData = emailDataVerification(email, VerificationCode);
    const emailResult = await sendEmail(emailData);
    if (!emailResult.success) {
      return res.status(500).json({erro:true, message: emailResult.message});
    }

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

exports.VerifyEmail = async (req, res) => {
  // - Vérification des données (email, emailVerificationToken)
  // - Vérification de l'email (existe)✅
  // - Vérification du token d'activation (existe, non expiré)✅
  // - Mise à jour du champ isVerified à true
  // - Suppression du token d'activation
  const { email, emailVerificationToken } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Utilisateur introuvable");
    }
    if (
      !user.emailVerificationToken ||
      new Date() > user.emailVerificationTokenExpires
    ) {
      // if (!user.emailVerificationToken || new Date() > new Date(user.emailVerificationTokenExpires)) {
      throw new Error("Token invalide ou expiré.");
    }

    // Mise à jour de l'utilisateur comme vérifié et suppression du token
    await user.updateOne({
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    });
  } catch (error) {
    res.status(400).send(error.message);
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

// Update newsletter

// Update password
