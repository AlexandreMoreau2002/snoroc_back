const { generateVerificationCode, generateExpirationDate } = require('../../../src/utils/validation.utils')

describe('validation.utils', () => {
  it('génère un code à 6 chiffres', () => {
    const code = generateVerificationCode()

    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[0-9]{6}$/)
  })

  it('crée une date expirant au moins 15 minutes plus tard avec le décalage', () => {
    const now = Date.now()
    const expiration = generateExpirationDate(15)

    expect(expiration.getTime()).toBeGreaterThan(now + 15 * 60 * 1000)
  })

  it('respecte la durée personnalisée', () => {
    const expiration = generateExpirationDate(30)
    const now = Date.now()

    expect(expiration.getTime()).toBeGreaterThanOrEqual(now + 30 * 60 * 1000)
  })
})
