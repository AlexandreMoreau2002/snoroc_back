/**
 * Utilitaire pour standardiser les réponses API
 * Structure unifiée pour toutes les réponses de l'API
 */

/**
 * Réponse de succès standardisée
 * @param {Object} res - Objet response Express
 * @param {number} statusCode - Code de statut HTTP (défaut: 200)
 * @param {string} message - Message de succès
 * @param {Object|Array} data - Données à retourner (optionnel)
 * @param {Object} meta - Métadonnées (pagination, etc.) (optionnel)
 */
const successResponse = (
  res,
  statusCode = 200,
  message,
  data = null,
  meta = null,
  extra = null
) => {
  const response = {
    error: false,
    message,
  }

  if (data !== null) {
    response.data = data
  }

  if (meta !== null) {
    response.meta = meta
  }

  if (extra && typeof extra === 'object') {
    Object.assign(response, extra)
  }

  return res.status(statusCode).json(response)
}

/**
 * Réponse d'erreur standardisée
 * @param {Object} res - Objet response Express
 * @param {number} statusCode - Code de statut HTTP (défaut: 500)
 * @param {string} message - Message d'erreur
 * @param {string} errorCode - Code d'erreur spécifique (optionnel)
 * @param {Object} details - Détails supplémentaires de l'erreur (optionnel)
 */
const errorResponse = (
  res,
  statusCode = 500,
  message,
  errorCode = null,
  details = null,
  extra = null
) => {
  const response = {
    error: true,
    message,
  }

  if (errorCode) {
    response.code = errorCode
  }

  if (details !== null) {
    response.details = details
  }

  if (extra && typeof extra === 'object') {
    Object.assign(response, extra)
  }

  return res.status(statusCode).json(response)
}

/**
 * Réponse de validation d'erreur (400)
 * @param {Object} res - Objet response Express
 * @param {string} message - Message d'erreur de validation
 * @param {Object} details - Détails des erreurs de validation (optionnel)
 */
const validationErrorResponse = (res, message, details = null) => {
  return errorResponse(res, 400, message, 'VALIDATION_ERROR', details)
}

/**
 * Réponse d'authentification requise (401)
 * @param {Object} res - Objet response Express
 * @param {string} message - Message d'erreur d'authentification
 */
const unauthorizedResponse = (res, message = 'Authentification requise') => {
  return errorResponse(res, 401, message, 'UNAUTHORIZED')
}

/**
 * Réponse de ressource non trouvée (404)
 * @param {Object} res - Objet response Express
 * @param {string} message - Message d'erreur
 */
const notFoundResponse = (res, message = 'Ressource introuvable') => {
  return errorResponse(res, 404, message, 'NOT_FOUND')
}

/**
 * Réponse d'erreur interne du serveur (500)
 * @param {Object} res - Objet response Express
 * @param {string} message - Message d'erreur
 * @param {Object} details - Détails de l'erreur (optionnel)
 */
const internalErrorResponse = (res, message = 'Une erreur interne est survenue', details = null) => {
  return errorResponse(res, 500, message, 'INTERNAL_ERROR', details)
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse
}
