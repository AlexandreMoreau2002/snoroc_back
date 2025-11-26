const mockSendEmail = jest.fn()
const mockEncryptPassword = jest.fn()
const mockComparePassword = jest.fn()
const mockGenerateJwt = jest.fn()
const mockGenerateVerificationCode = jest.fn()
const mockGenerateExpirationDate = jest.fn()
const mockFindOne = jest.fn()
const mockFindByPk = jest.fn()
const mockSave = jest.fn()
const mockUpdate = jest.fn()
const mockDestroy = jest.fn()

jest.mock('../../../src/models/user.model', () => {
  const MockUser = function (data = {}) {
    Object.assign(this, data)
    this.save = mockSave
    this.update = mockUpdate
    this.destroy = mockDestroy
  }
  MockUser.findOne = mockFindOne
  MockUser.findByPk = mockFindByPk
  return MockUser
})

jest.mock('../../../config/nodemailer.config', () => ({ sendEmail: mockSendEmail }))

jest.mock('phone', () => ({ phone: jest.fn() }))
const phoneModule = require('phone')
const phoneMock = phoneModule.phone

jest.mock('../../../src/utils/encryptPassword.utils', () => ({
  encryptPassword: mockEncryptPassword,
  comparePassword: mockComparePassword,
}))

jest.mock('../../../src/utils/generateJwt.utils', () => ({
  generateJwt: mockGenerateJwt,
}))

jest.mock('../../../src/utils/validation.utils', () => ({
  generateVerificationCode: mockGenerateVerificationCode,
  generateExpirationDate: mockGenerateExpirationDate,
}))

const {
  SignUp,
  VerifyEmail,
  Login,
  Update,
  Delete,
  GetById,
} = require('../../../src/controllers/user.controller')

const createRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

describe('User Controller', () => {
  const baseUserData = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    password: 'Password1',
    userPhone: '0600000000',
    civility: 'Mr',
    newsletter: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSave.mockImplementation(function () {
      if (!this.id) {
        this.id = 1
      }
      return Promise.resolve(this)
    })
    mockUpdate.mockResolvedValue(true)
    mockDestroy.mockResolvedValue(true)
    mockFindOne.mockReset()
    mockFindByPk.mockReset()
    mockSendEmail.mockReset()
    mockEncryptPassword.mockResolvedValue('hashed-password')
    mockComparePassword.mockResolvedValue(true)
    mockGenerateJwt.mockResolvedValue('jwt-token')
    mockGenerateVerificationCode.mockReturnValue('123456')
    mockGenerateExpirationDate.mockReturnValue(new Date(Date.now() + 900000))
    phoneMock.mockReset()
    phoneMock.mockReturnValue({ isValid: true, phoneNumber: '+33600000000' })
  })

  describe('SignUp', () => {
    it('retourne 400 si des champs obligatoires sont manquants', async () => {
      const req = { body: { firstname: '', lastname: '', email: '', password: '', civility: '' } }
      const res = createRes()

      await SignUp(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'La requête est invalide, Tous les champs doivent être remplis.',
        })
      )
    })

    it('retourne 400 pour un email invalide', async () => {
      const req = { body: { ...baseUserData, email: 'invalid-email' } }
      const res = createRes()

      await SignUp(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "L'email n’est pas dans le bon format.",
          value: false,
        })
      )
      expect(mockFindOne).not.toHaveBeenCalled()
    })

    it('retourne 400 si un utilisateur existe déjà', async () => {
      const req = { body: baseUserData }
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 10 })

      await SignUp(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Un utilisateur avec cet email existe déjà.' })
      )
    })

    it("retourne 400 si le mot de passe n'est pas conforme", async () => {
      const req = { body: { ...baseUserData, password: 'weak' } }
      const res = createRes()

      await SignUp(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Le mot de passe doit contenir au moins 8 caractères, dont au moins une majuscule, une minuscule et un chiffre.',
        })
      )
    })

    it('journalise un numéro invalide mais poursuit le flux', async () => {
      const req = { body: baseUserData }
      const res = createRes()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      phoneMock.mockReturnValue({ isValid: false })
      mockFindOne.mockResolvedValue(null)
      mockSendEmail.mockResolvedValue({ success: true })

      await SignUp(req, res)

      expect(consoleSpy).toHaveBeenCalledWith('Numéro de téléphone non valide')
      expect(res.status).toHaveBeenCalledWith(200)
      consoleSpy.mockRestore()
    })

    it("retourne 500 en cas d'échec d'envoi d'email", async () => {
      const req = { body: baseUserData }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)
      mockSendEmail.mockResolvedValue({ success: false, message: 'Erreur mail' })

      await SignUp(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ value: false, message: 'Erreur mail' })
      )
    })

    it('retourne 500 si une erreur inattendue survient', async () => {
      const req = { body: baseUserData }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)
      mockEncryptPassword.mockRejectedValue(new Error('hash failed'))
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await SignUp(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('hash failed') })
      )
      consoleSpy.mockRestore()
    })

    it('complète un parcours de succès avec création et token', async () => {
      const req = { body: baseUserData }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)
      mockSendEmail.mockResolvedValue({ success: true })

      await SignUp(req, res)

      expect(mockEncryptPassword).toHaveBeenCalledWith(baseUserData.password)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: baseUserData.email })
      )
      expect(mockGenerateJwt).toHaveBeenCalledWith(
        expect.objectContaining({ email: baseUserData.email })
      )
      expect(mockUpdate).toHaveBeenCalledWith({ accessToken: 'jwt-token' })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'jwt-token',
          message: 'Votre compte a bien été créé.',
        })
      )
    })
  })

  describe('VerifyEmail', () => {
    it('retourne 500 si l’utilisateur est introuvable', async () => {
      const req = { body: { email: baseUserData.email, emailVerificationToken: '123456' } }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await VerifyEmail(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Utilisateur introuvable.' })
      )
    })

    it('retourne 500 si le token est expiré ou manquant', async () => {
      const expiredUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: baseUserData.email,
        isAdmin: false,
        emailVerificationToken: '123456',
        emailVerificationTokenExpires: new Date(),
        update: mockUpdate,
      }
      const req = { body: { email: baseUserData.email, emailVerificationToken: '123456' } }
      const res = createRes()
      mockFindOne.mockResolvedValue(expiredUser)

      await VerifyEmail(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Code invalide ou expiré..' })
      )
    })

    it('retourne 500 si le code ne correspond pas', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: baseUserData.email,
        isAdmin: false,
        emailVerificationToken: '654321',
        emailVerificationTokenExpires: new Date(Date.now() + 4 * 60 * 60 * 1000),
        update: mockUpdate,
      }
      const req = { body: { email: baseUserData.email, emailVerificationToken: '123456' } }
      const res = createRes()
      mockFindOne.mockResolvedValue(user)

      await VerifyEmail(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Le code fourni est incorrect..' })
      )
    })

    it('valide le compte et renvoie un token en cas de succès', async () => {
      const validUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: baseUserData.email,
        isAdmin: false,
        emailVerificationToken: '123456',
        emailVerificationTokenExpires: new Date(Date.now() + 4 * 60 * 60 * 1000),
        update: mockUpdate,
      }
      const req = { body: { email: baseUserData.email, emailVerificationToken: '123456' } }
      const res = createRes()
      mockFindOne.mockResolvedValue(validUser)
      mockGenerateJwt.mockResolvedValue('jwt-verify')

      await VerifyEmail(req, res)

      expect(mockGenerateJwt).toHaveBeenCalledWith(
        expect.objectContaining({ email: validUser.email })
      )
      expect(mockUpdate).toHaveBeenCalledWith({
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
        accessToken: 'jwt-verify',
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'jwt-verify', message: 'Email validé.' })
      )
    })
  })

  describe('Login', () => {
    it('retourne 400 si email ou mot de passe est manquant', async () => {
      const req = { body: { email: '', password: '' } }
      const res = createRes()

      await Login(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'La requête est invalide.' })
      )
    })

    it('retourne 400 pour un format email invalide', async () => {
      const req = { body: { email: 'invalid', password: 'Password1' } }
      const res = createRes()

      await Login(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Format d'email invalide." })
      )
    })

    it('retourne 401 si l’utilisateur est introuvable', async () => {
      const req = { body: { email: baseUserData.email, password: 'Password1' } }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await Login(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "L'identifiant et/ou le mot de passe est incorrect." })
      )
    })

    it('retourne 401 en cas de mot de passe incorrect', async () => {
      const req = { body: { email: baseUserData.email, password: 'Password1' } }
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 2, password: 'stored-pass' })
      mockComparePassword.mockResolvedValue(false)

      await Login(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "L'identifiant et/ou le mot de passe est incorrect." })
      )
    })

    it('retourne 200 et un token en cas de succès', async () => {
      const user = {
        id: 3,
        firstname: 'Jane',
        lastname: 'Doe',
        email: baseUserData.email,
        isAdmin: false,
        password: 'stored',
        emailVerificationToken: null,
        update: mockUpdate,
      }
      const req = { body: { email: baseUserData.email, password: 'Password1' } }
      const res = createRes()
      mockFindOne.mockResolvedValue(user)
      mockGenerateJwt.mockResolvedValue('jwt-login')

      await Login(req, res)

      expect(mockComparePassword).toHaveBeenCalledWith('Password1', 'stored')
      expect(mockUpdate).toHaveBeenCalledWith({ accessToken: 'jwt-login' })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ accessToken: 'jwt-login', message: 'Vous êtes désormais connecté.' })
      )
    })
  })

  describe('Update', () => {
    it('retourne 400 si id manquant ou invalide', async () => {
      const req = { body: { id: null } }
      const res = createRes()

      await Update(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Requête invalide : ID utilisateur manquant ou incorrect.' })
      )
    })

    it('retourne 404 si utilisateur introuvable', async () => {
      const req = { body: { id: 1, email: baseUserData.email } }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await Update(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Utilisateur introuvable.' })
      )
    })

    it('retourne 400 pour un email invalide', async () => {
      const req = { body: { id: 1, email: 'bad-email' } }
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 1 })

      await Update(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "L'adresse email est invalide." })
      )
    })

    it('retourne 400 pour un prénom invalide', async () => {
      const req = { body: { id: 1, firstName: 'John123' } }
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 1 })

      await Update(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Le prénom doit contenir uniquement des lettres.' })
      )
    })

    it('retourne 400 pour un téléphone invalide', async () => {
      const req = { body: { id: 1, phoneNumber: 'invalid' } }
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 1 })
      phoneMock.mockReturnValue({ isValid: false })

      await Update(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Le numéro de téléphone est incorrect.' })
      )
    })

    it('met à jour les données utilisateur en cas de succès', async () => {
      const user = {
        id: 1,
        firstName: 'Old',
        lastName: 'Name',
        email: baseUserData.email,
        phoneNumber: '+33600000000',
        update: mockUpdate,
      }
      const req = {
        body: {
          id: 1,
          firstName: 'New',
          lastName: 'Name',
          email: 'new@example.com',
          phoneNumber: '+33611111111',
        },
      }
      const res = createRes()
      mockFindOne.mockResolvedValue(user)
      phoneMock.mockReturnValue({ isValid: true, phoneNumber: '+33611111111' })

      await Update(req, res)

      expect(mockUpdate).toHaveBeenCalledWith({
        firstName: 'New',
        lastName: 'Name',
        email: 'new@example.com',
        phoneNumber: '+33611111111',
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('Delete', () => {
    it('retourne 400 si id manquant', async () => {
      const req = { body: { id: null } }
      const res = createRes()

      await Delete(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Requête invalide : ID utilisateur manquant ou incorrect.' })
      )
    })

    it('retourne 404 si utilisateur introuvable', async () => {
      const req = { body: { id: 2 } }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await Delete(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Utilisateur introuvable.' })
      )
    })

    it('supprime un utilisateur en cas de succès', async () => {
      const req = { body: { id: 3 } }
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 3, destroy: mockDestroy })

      await Delete(req, res)

      expect(mockDestroy).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "L'utilisateur a été supprimé avec succès." })
      )
    })
  })

  describe('GetById', () => {
    it('retourne 400 pour un id invalide', async () => {
      const req = { params: { id: 'abc' } }
      const res = createRes()

      await GetById(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Requête invalide : ID utilisateur manquant ou incorrect.' })
      )
    })

    it('retourne 404 si utilisateur inexistant', async () => {
      const req = { params: { id: 5 } }
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await GetById(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Utilisateur introuvable.' })
      )
    })

    it('retourne les données utilisateur quand elles sont trouvées', async () => {
      const req = { params: { id: 6 } }
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 6, firstname: 'Jane' })

      await GetById(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ id: 6 }) })
      )
    })
  })

  describe('GetProfile', () => {
    it('retourne 401 si userId est absent', async () => {
      const res = createRes()

      await require('../../../src/controllers/user.controller').GetProfile(
        { user: {} },
        res
      )

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Utilisateur non authentifié.' })
      )
    })

    it('retourne 404 si le profil est introuvable', async () => {
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await require('../../../src/controllers/user.controller').GetProfile(
        { user: { userId: 7 } },
        res
      )

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Profil utilisateur introuvable.' })
      )
    })

    it('retourne le profil quand il existe', async () => {
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 7, firstname: 'Profile' })

      await require('../../../src/controllers/user.controller').GetProfile(
        { user: { userId: 7 } },
        res
      )

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ id: 7 }) })
      )
    })
  })

  describe('ForgotPassword', () => {
    const ForgotPassword = require('../../../src/controllers/user.controller').ForgotPassword

    it('retourne 400 si email manquant', async () => {
      const res = createRes()

      await ForgotPassword({ body: {} }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "L'email est requis." })
      )
    })

    it('retourne 404 si aucun utilisateur', async () => {
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await ForgotPassword({ body: { email: baseUserData.email } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('déclenche un email de réinitialisation', async () => {
      const res = createRes()
      const user = { save: mockSave }
      mockFindOne.mockResolvedValue(user)
      mockSendEmail.mockResolvedValue({ success: true })

      await ForgotPassword({ body: { email: baseUserData.email } }, res)

      expect(mockGenerateVerificationCode).toHaveBeenCalled()
      expect(user.passwordResetToken).toBeDefined()
      expect(mockSendEmail).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it("retourne 500 si l'envoi d'email échoue", async () => {
      const res = createRes()
      const user = { save: mockSave }
      mockFindOne.mockResolvedValue(user)
      mockSendEmail.mockResolvedValue({ success: false })

      await ForgotPassword({ body: { email: baseUserData.email } }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Échec de l'envoi de l'email." })
      )
    })
  })

  describe('ResetPassword', () => {
    const ResetPassword = require('../../../src/controllers/user.controller').ResetPassword

    it('retourne 400 si des champs sont manquants', async () => {
      const res = createRes()

      await ResetPassword({ body: {} }, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 404 si aucun utilisateur', async () => {
      const res = createRes()
      mockFindOne.mockResolvedValue(null)

      await ResetPassword({ body: { email: baseUserData.email, resetToken: 't', newPassword: 'Password1' } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('retourne 400 si le token est invalide ou expiré', async () => {
      const res = createRes()
      const user = {
        passwordResetToken: 'token',
        passwordResetTokenExpires: new Date(Date.now() - 1000),
      }
      mockFindOne.mockResolvedValue(user)

      await ResetPassword({ body: { email: baseUserData.email, resetToken: 'bad', newPassword: 'Password1A' } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Token de réinitialisation invalide ou expiré.' })
      )
    })

    it('met à jour le mot de passe quand le token est valide', async () => {
      const res = createRes()
      const user = {
        passwordResetToken: 'token',
        passwordResetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
        password: 'old',
        update: mockUpdate,
      }
      mockFindOne.mockResolvedValue(user)
      mockEncryptPassword.mockResolvedValue('new-hash')

      await ResetPassword({ body: { email: baseUserData.email, resetToken: 'token', newPassword: 'Password1A' } }, res)

      expect(mockEncryptPassword).toHaveBeenCalledWith('Password1A')
      expect(mockUpdate).toHaveBeenCalledWith({
        password: 'new-hash',
        passwordResetToken: null,
        passwordResetTokenExpires: null,
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('UpdateNewsletter', () => {
    const UpdateNewsletter = require('../../../src/controllers/user.controller').UpdateNewsletter

    it('retourne 400 si id est invalide', async () => {
      const res = createRes()

      await UpdateNewsletter({ body: { id: null, newsletter: true } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 400 si newsletter n’est pas booléen', async () => {
      const res = createRes()

      await UpdateNewsletter({ body: { id: 1, newsletter: 'yes' } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('met à jour le flag newsletter', async () => {
      const res = createRes()
      const user = { id: 1, save: mockSave, newsletter: false }
      mockFindOne.mockResolvedValue(user)

      await UpdateNewsletter({ body: { id: 1, newsletter: true } }, res)

      expect(mockSave).toHaveBeenCalled()
      expect(user.newsletter).toBe(true)
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('UpdatePassword', () => {
    const UpdatePassword = require('../../../src/controllers/user.controller').UpdatePassword

    it('retourne 401 si le mot de passe actuel est incorrect', async () => {
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 1, password: 'hashed' })
      mockComparePassword.mockResolvedValue(false)

      await UpdatePassword({ body: { id: 1, currentPassword: 'old', newPassword: 'Password1A' } }, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retourne 400 si le nouveau mot de passe est invalide', async () => {
      const res = createRes()

      await UpdatePassword({ body: { id: 1, currentPassword: 'old', newPassword: 'weak' } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'Le nouveau mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.',
        })
      )
    })

    it('met à jour le mot de passe quand la vérification réussit', async () => {
      const res = createRes()
      mockFindOne.mockResolvedValue({ id: 1, password: 'hashed', update: mockUpdate })
      mockComparePassword.mockResolvedValue(true)
      mockEncryptPassword.mockResolvedValue('new-hash')

      await UpdatePassword({ body: { id: 1, currentPassword: 'old', newPassword: 'Password1A' } }, res)

      expect(mockEncryptPassword).toHaveBeenCalledWith('Password1A')
      expect(mockUpdate).toHaveBeenCalledWith({ password: 'new-hash' })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('UpdateUserRole', () => {
    const UpdateUserRole = require('../../../src/controllers/user.controller').UpdateUserRole

    it('retourne 400 si isAdmin est invalide', async () => {
      const res = createRes()

      await UpdateUserRole({ params: { id: 1 }, body: { isAdmin: 'yes' } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 404 si l’utilisateur est absent', async () => {
      const res = createRes()
      mockFindByPk.mockResolvedValue(null)

      await UpdateUserRole({ params: { id: 2 }, body: { isAdmin: true } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('met à jour le rôle administrateur', async () => {
      const res = createRes()
      mockFindByPk.mockResolvedValue({ id: 3, isAdmin: false, update: mockUpdate })

      await UpdateUserRole({ params: { id: 3 }, body: { isAdmin: true } }, res)

      expect(mockUpdate).toHaveBeenCalledWith({ isAdmin: true })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
