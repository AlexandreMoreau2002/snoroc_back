const { Op } = require("sequelize");
const { encryptPassword, comparePassword } = require("../utils/encryptPassword.utils");
const { generateJwt } = require("../utils/generateJwt.utils");
const User = require("../models/user.model")
const { phone } = require('phone')


// fonction de control pour l'inscription 
exports.SignUp = async (req, res) => {
    // Le try/catch permet de gérer les erreurs sans faire planter l’API et la retourner
    // dans le catch
    try {

        const { firstname, lastname, email, password, userPhone, civility } = req.body;
        // On récupère les clés requise depuis le corps de la requête
        if (!firstname || !lastname || !email || !password || !civility) {
            // Si une des clés requise n’est pas renseignée, on envoi une erreur à l’utilisateur
            return res.status(400).json({
                error: true,
                message: "La requête est invalide."
            });
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        const nameRegex = /^[A-Z][a-zA-Z]*$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/

        // on verifie que firstname est conforme au regex
        if (!nameRegex.test(firstname)) {
            return res.status(400).json({
                error: true,
                message: "Le prénom doit commencer par une majuscule."
            });
        }

        if (!nameRegex.test(lastname)) {
            return res.status(400).json({
                error: true,
                message: "Le nom doit commencer par une majuscule."
            });
        }

        if (!emailRegex.test(email)) {
            // Si le format de l’adresse mail est incorrecte, on renvoi une erreur à l’utilisateur
            return res.status(400).json({
                error: true,
                message: "L'email n’est pas dans le bon format."
            });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: true,
                message: "Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre."
            });
        }

        if (userPhone) {
            const phoneData = await phone(userPhone, { country: 'FR' })
            if (!phoneData.isValid) {
                return res.status(400).json({
                    error: true,
                    message: 'Le numéro de téléphone est incorrect.'
                })
            } else {
                userPhone = phoneData.userPhone
            }
        }

        const isUserExist = await User.findOne({ where: { [Op.or]: [{ phone: userPhone }, { email: email }] } })
        // Grâce au modèle User, nous pouvons exécuter facilement des requêtes sur notre BDD, cette requête correspond à une recherche
        // dans la base de donnée, le[Op.or] nous permet de vérifier si un des deux arguments correspond à un utilisateur dans notre base de
        // données.
        if (isUserExist) {
            let errorMessage = 'Une erreur est survenue.';
            if (isUserExist.email === email && isUserExist.phone === userPhone) {
                errorMessage = "L'email et le numero de téléphone sont déjà utilisés."
            } else if (isUserExist.email === email) {
                errorMessage = "L'email est déjà utilisée."
            } else if (isUserExist.phone === userPhone) {
                errorMessage = "Le numero de téléphone est déjà utilisé."
                return res.status(400).json({ error: true, message: errorMessage })
            }

        }
        const encryptedPassword = await encryptPassword(password);
        const userData = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: userPhone,
            password: encryptedPassword
        }

        await new User(userData).save();
        // La ligne ci-dessus permet de créer une nouvelle instance d’utilisateur grâce à notre modèle et le
        // .save() permet de l'enregistrer dans la base de données.
        return res.status(200).json({
            error: false,
            message: "Votre compte a bien été créé."
        });


    } catch (err) {
        return res.status(500).json({
            error: true,
            message: `Une erreur est survenue : ${err}.`
        });
    }
}


exports.Update = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.Delete = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.GetById = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.GetProfile = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.ForgotPassword = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.ResetPassword = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.VerifyEmail = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.Login = async (req, res) => {
    // Le try/catch va nous permettre de gérer les erreurs sans faire planter l’API et la retourner
    // dans le catch
    try {
        // Code à effectuer dans la fonction
        const { email, password } = req.body;
        // On récupère les clés requise depuis le corps de la requête
        if (!email || !password) {
            // Si une des clés requise n’est pas renseignée, on envoi une erreur à l’utilisateur
            return res.status(400).json({
                error: true,
                message: "La requête est invalide."
            });
        }

        let user;
        // On initialise une variable pour plus tard
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        // Regex pour vérifier le format d’une adresse mail
        if (emailRegex.test(email)) {
            // Si l’identifiant renseigné correspond à une adresse mail, on recherchera
            // l’utilisateur par rapport à son email
            user = await User.findOne({ where: { email: email } });
        } 

        if (!user) {
            return res.status(401).json({
                error: true,
                message: "L'identifiant et/ou le mot de passe est incorrect."
            });
        }
        // Si l’utilisateur est introuvable, par mesure de sécurité, nous n’allons pas donner cette information à
        // l’utilisateur, il ne saura donc pas si un utilisateur existe avec cet identifiant.

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: true,
                message: "L'identifiant et/ou le mot de passe est incorrect."
            });
        }
        // Encore une fois, par mesure de sécurité, nous n’allons pas spécifier à l’utilisateur la provenance de
        // l’erreur.

        const accessToken = await generateJwt({
            firstname: user.firstname,
            email: user.email
        });
        await user.update({ accessToken: accessToken });
        // La ligne ci-dessus va venir mettre à jour l’utilisateur dans notre base de donnée et y ajouter notre
        accessToken
        return res.status(200).json({
            error: false,
            message: "Vous êtes désormais connecté.",
            accessToken: accessToken
        });


    } catch (err) {
        return res.status(500).json({
            error: true,
            message: `Une erreur est survenue : ${err}.`
        });
    }
}

exports.UpdateNewsletter = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}

exports.UpdatePassword = async (req, res) => {
    try {
        // Code à effectuer dans la fonction

    } catch (err) {

    }
}