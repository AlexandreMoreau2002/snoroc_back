// back/src/middlewares/authenticate.middlewares.js

const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Récupérer le token
    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Token manquant ou invalide.",
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.id }; // Ajouter l'ID utilisateur au req
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({
      error: true,
      message: "Token invalide ou expiré.",
    });
  }
};

module.exports = authenticate;