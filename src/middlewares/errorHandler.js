function errorHandler(err, req, res, next) {
  console.error('[API] Erreur non gérée :', err)

  const status = err?.status || 500
  const message =
    err?.message || 'Une erreur interne est survenue, veuillez réessayer plus tard.'

  return res.status(status).json({
    error: true,
    message,
  })
}

module.exports = errorHandler
