const jwt = require("jsonwebtoken");
const generateJwt = async (data) => {
    try {
        const accessToken = await jwt.sign(data, 'MySuperSecretText', { expiresIn: '1h' });
        // Vous remplacerez la chaîne de caractère par un code “secret” qui servira de signature au
        token
        return accessToken;
    } catch (error) {
        console.error(error);
    }
}
module.exports = { generateJwt };