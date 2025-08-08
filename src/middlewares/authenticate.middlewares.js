// src/middlewares/authenticate.middlewares.js
const jwt = require('jsonwebtoken')

/**
 * Middleware pour vérifier le token JWT
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Token manquant ou invalide.',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      userId: decoded.id,
      isAdmin: decoded.isAdmin,
    }
    next()
  } catch (error) {
    console.error(error)
    return res.status(403).json({
      error: true,
      message: 'Token invalide ou expiré.',
    })
  }
}

module.exports = auth