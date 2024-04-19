
/**
 * Génère un code de vérification à 6 chiffres.
 */

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Génère une date d'expiration pour le code de vérification.
 * @param {number} durationInMinutes - Durée en minutes avant que le code expire.
 */

const generateExpirationDate = (durationInMinutes = 15) => {
    const offsetInHours = 2;  // Décalage fixe de +2 heures
    const now = new Date();
    return new Date(now.getTime() + durationInMinutes * 60000 + offsetInHours *3600000);
};

module.exports = {
    generateVerificationCode,
    generateExpirationDate
};