/*
Signup
Vérification des données (email, password, firstname, lastname, phone, civility, newsletter)
Vérification de l'email (unique)
Vérification du mot de passe (8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre)
Génération du token d'activation
Génération de la date d'expiration du code d'activation
Envoi d'un email à l'adresse de l'utilisateur
Enregistrement de l'utilisateur et du code d'activation ainsi que de la date d'expiration du code
Update
Vérification des données (id de l'utilisateur, authentification via middleware (admin))
Mise à jour des champs uniquement rensignés sinon on garde les anciennes valeurs
Delete
Vérification des données (id de l'utilisateur, authentification via middleware (admin))
Mettre à jour le champ isRestricted à true
Get / GetById
Vérification des données (id de l'utilisateur, authentification via middleware (admin))
GetProfile
Vérification des données (id de l'utilisateur, authentification via middleware (user))
ForgotPassword
Vérification des données (email)
Vérification de l'email (existe)
Génération du token de réinitialisation
Génération de la date d'expiration du code de réinitialisation
Envoi d'un email à l'adresse de l'utilisateur
Enregistrement du code de réinitialisation ainsi que de la date d'expiration du code
ResetPassword
Vérification des données (email, password, passwordResetToken)
Vérification de l'email (existe)
Vérification du mot de passe (8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre)
Vérification du token de réinitialisation (existe, non expiré)
Mise à jour du mot de passe
Suppression du token de réinitialisation
VerifyEmail
Vérification des données (email, emailVerificationToken)
Vérification de l'email (existe)
Vérification du token d'activation (existe, non expiré)
Mise à jour du champ isVerified à true
Suppression du token d'activation
Login
Vérification des données (email, password)
Vérification de l'email (existe)
Vérification du mot de passe (correspond)
Vérification du compte (actif, vérifié)
Génération du token d'authentification
Mise à jour du champ accessToken
UpdateNewsletter
Vérification des données (id de l'utilisateur, newsletter, authentification via middleware (user))
Mise à jour du champ newsletter
UpdatePassword
Vérification des données (id de l'utilisateur, password, authentification via middleware (user))
Vérification du mot de passe (8 caractères minimum, 1 majuscule, 1 minuscule, 1 chiffre)
Mise à jour du champ password
*/


const { Op } = require("sequelize");
const { encryptPassword, comparePassword } = require("../utils/encryptPassword.utils");
const { generateJwt } = require("../utils/generateJwt.utils");

exports.SignUp = async (req, res) => {
    // Le try/catch permet de gérer les erreurs sans faire planter l’API et la retourner
    // dans le catch
    try {

        const { username, email, password } = req.body;
        // On récupère les clés requise depuis le corps de la requête
        if (!username || !email || !password) {
            // Si une des clés requise n’est pas renseignée, on envoi une erreur à l’utilisateur
            return res.status(400).json({
                error: true,
                message: "La requête est invalide."
            });
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        // Regex pour le format d’une adresse mail
        if (!emailRegex.test(email)) {
            // Si le format de l’adresse mail est incorrecte, on renvoi une erreur à l’utilisateur
            return res.status(400).json({
                error: true,
                message: "L'email n’est pas dans le bon format."
            });
        }

        const isUserExist = await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } })
        // Grâce au modèle User, nous pouvons exécuter facilement des requêtes sur notre BDD, cette requête correspond à une recherche
        // dans la base de donnée, le[Op.or] nous permet de vérifier si un des deux arguments correspond à un utilisateur dans notre base de
        // données.
        if (isUserExist) {
            let errorMessage = 'Une erreur est survenue.';
            if (isUserExist.email === email && isUserExist.username.toLowerCase() === username.toLowerCase()) {
                errorMessage = "L'email et le nom d'utilisateur sont déjà utilisés."
            } else if (isUserExist.email === email) {
                errorMessage = "L'email est déjà utilisée."
            } else if (isUserExist.username.toLowerCase() === username.toLowerCase()) {
                errorMessage = "Le nom d'utilisateur est déjà utilisé."
            }
            return res.status(400).json({ error: true, message: errorMessage })
        }

        const encryptedPassword = await encryptPassword(password);
        const userData = {
            username: username,
            email: email,
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

exports.SignIn = async (req, res) => {
    // Le try/catch va nous permettre de gérer les erreurs sans faire planter l’API et la retourner
    // dans le catch
    try {
        // Code à effectuer dans la fonction
        const { identifier, password } = req.body;
        // On récupère les clés requise depuis le corps de la requête
        if (!identifier || !password) {
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
        if (emailRegex.test(identifier)) {
            // Si l’identifiant renseigné correspond à une adresse mail, on recherchera
            // l’utilisateur par rapport à son email
            user = await User.findOne({ where: { email: identifier } });
        } else {
            user = await User.findOne({ where: { username: identifier } });
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
            username: user.username,
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


