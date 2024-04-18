require('dotenv').config();
const secretKey = process.env.JWT_SECRET; // Clé secrète stockée dans le fichier .env

const jwt = require("jsonwebtoken");

const generateJwt = async (data) => {
    try {
        const accessToken = await jwt.sign(data, secretKey, { expiresIn: '1h' });
        return accessToken;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to generate JWT');
    }
}
module.exports = { generateJwt };