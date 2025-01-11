// //back/src/middlewares/role.middlewares.js

/**
 * Middleware pour vérifier le rôle de l'utilisateur
 * @param {string} role
 * 
 */
const roleMiddleware = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        error: true,
        message: "Utilisateur non authentifié.",
      });
    }

    // Vérification du rôle
    if (role === "admin" && !req.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: "Accès réservé aux administrateurs.",
      });
    }
    next();
  };
};

module.exports = {
  roleMiddleware,
};