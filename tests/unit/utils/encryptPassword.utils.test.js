const { encryptPassword, comparePassword } = require('../../../src/utils/encryptPassword.utils')

  describe('encryptPassword.utils', () => {
  it('chiffre un mot de passe sans le retourner en clair', async () => {
    const password = 'SecurePass1!'

    const hash = await encryptPassword(password)

    expect(hash).toBeDefined()
    expect(hash).not.toEqual(password)
  })

  it('valide un mot de passe correct', async () => {
    const password = 'SecurePass1!'
    const hash = await encryptPassword(password)

    const result = await comparePassword(password, hash)

    expect(result).toBe(true)
  })

    it('rejette un mot de passe incorrect', async () => {
      const password = 'SecurePass1!'
      const hash = await encryptPassword(password)

      const result = await comparePassword('WrongPass2@', hash)

    expect(result).toBe(false)
  })

  it('journalise et renvoie undefined si le hash échoue', async () => {
      const bcrypt = require('bcrypt')
      const hashSpy = jest.spyOn(bcrypt, 'hashSync').mockImplementation(() => {
        throw new Error('hash failed')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await encryptPassword('AnyPassword1!')

      expect(consoleSpy).toHaveBeenCalled()
      expect(result).toBeUndefined()

    hashSpy.mockRestore()
    consoleSpy.mockRestore()
  })

  it('journalise et renvoie undefined si la comparaison échoue', async () => {
    const bcrypt = require('bcrypt')
    const compareSpy = jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => {
      throw new Error('compare failure')
    })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await comparePassword('Password1!', 'hash')

    expect(consoleSpy).toHaveBeenCalled()
    expect(result).toBeUndefined()

    compareSpy.mockRestore()
    consoleSpy.mockRestore()
  })
})
