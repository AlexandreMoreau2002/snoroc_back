// back/src/utils/generateJwt.utils.js

require('dotenv').config();
const secretKey = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const ninetyNineYearsInSeconds = 99 * 365 * 24 * 60 * 60

const generateJwt = async (data) => {
    try {
        const accessToken = await jwt.sign(data, secretKey, {
          expiresIn: ninetyNineYearsInSeconds,
        })
        return accessToken;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to generate JWT');
    }
}
module.exports = { generateJwt };