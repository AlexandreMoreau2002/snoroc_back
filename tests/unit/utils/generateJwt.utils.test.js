let jwt
let generateJwt

  describe('generateJwt.utils', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' }
      jwt = require('jsonwebtoken')
      ;({ generateJwt } = require('../../../src/utils/generateJwt.utils'))
    })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('génère un token contenant les données fournies', async () => {
    const payload = { id: 42, email: 'user@example.com' }

    const token = await generateJwt(payload)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    expect(decoded.id).toBe(payload.id)
    expect(decoded.email).toBe(payload.email)
  })

    it('définit une durée de vie de 99 ans', async () => {
      const token = await generateJwt({ id: 1 })
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const expectedExpiration = Math.floor(Date.now() / 1000) + 99 * 365 * 24 * 60 * 60
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiration - 5)
    })

    it('propage une erreur si la génération de token échoue', async () => {
      const signSpy = jest.spyOn(jwt, 'sign').mockImplementation(() => {
        throw new Error('sign failure')
      })

      await expect(generateJwt({ id: 1 })).rejects.toThrow('Failed to generate JWT')

      signSpy.mockRestore()
    })
  })
