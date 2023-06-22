const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
    try {
        const encryptedPassword = await bcrypt.hashSync(password, 10);
        // Le code du contrôleur ne continuera pas le temps que la fonction encryptPassword n’a pas renvoyé de réponse
        // grâce au await.
        return encryptedPassword;
    } catch (error) {
        console.error(error);
    }
}
module.exports = { encryptPassword };

const comparePassword = async (password, dbPassword) => {
    try {
        const isPasswordValid = await bcrypt.compareSync(password, dbPassword);
        // La ligne ci-dessus va permettre de comparer le mot de passe rentré avec celui de la
        // base de données et renvoyer un booléen : true = mot de passe valide, false = invalide
        return isPasswordValid;
    } catch (error) {
        console.error(error);
    }
}
module.exports = { encryptPassword, comparePassword };
    // Nous allons également ajouter la fonction dans la liste des modules à exporter.