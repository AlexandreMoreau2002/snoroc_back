jest.mock('../../../src/models/contact.model', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
}))

jest.mock('../../../config/nodemailer.config', () => ({
  sendEmail: jest.fn(),
}))

jest.mock('../../../src/services/email/contactEmailTemplate.service', () => ({
  buildContactEmailNotification: jest.fn(),
}))

jest.mock('../../../src/utils/apiResponse.utils', () => ({
  successResponse: jest.fn((res, status, message, data, meta, extra) =>
    res.status(status).json({ error: false, message, data, meta, ...extra })
  ),
  validationErrorResponse: jest.fn((res, message, details = null) =>
    res.status(400).json({ error: true, message, details })
  ),
  notFoundResponse: jest.fn((res, message) =>
    res.status(404).json({ error: true, message })
  ),
  internalErrorResponse: jest.fn((res, message) =>
    res.status(500).json({ error: true, message })
  ),
}))

const Contact = require('../../../src/models/contact.model')
const { sendEmail } = require('../../../config/nodemailer.config')
const { buildContactEmailNotification } = require('../../../src/services/email/contactEmailTemplate.service')
const {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} = require('../../../src/utils/apiResponse.utils')
const { Create, GetAll, GetById, Update, DeleteById } = require('../../../src/controllers/contact.controller')

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
})

describe('Contact Controller', () => {
  const originalEmail = process.env.EMAIL
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EMAIL = originalEmail
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Create', () => {
    it('retourne des erreurs de validation pour des champs manquants', async () => {
      const req = { body: { name: ' ', email: 'invalid', subject: '', message: '' } }
      const res = createRes()

      await Create(req, res)

      expect(validationErrorResponse).toHaveBeenCalledTimes(1)
      const [, message, details] = validationErrorResponse.mock.calls[0]
      expect(message).toBe('Certains champs sont invalides.')
      expect(details).toEqual(
        expect.arrayContaining([
          'Le nom est obligatoire.',
          "L'email est invalide.",
          'Le sujet est obligatoire.',
          'Le message est obligatoire.',
        ])
      )
    })

    it("enregistre le message et renvoie un avertissement si l'envoi d'email échoue", async () => {
      process.env.EMAIL = 'company@example.com'
      const mockContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        subject: 'Sujet',
        message: 'Bonjour',
      }
      Contact.create.mockResolvedValue({
        get: () => mockContact,
      })
      buildContactEmailNotification.mockReturnValue({ to: 'company@example.com' })
      sendEmail.mockResolvedValue({ success: false, error: 'smtp failure' })

      const req = { body: { ...mockContact } }
      const res = createRes()

      await Create(req, res)

      expect(Contact.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        subject: 'Sujet',
        message: 'Bonjour',
      })
      expect(buildContactEmailNotification).toHaveBeenCalledWith(
        [process.env.EMAIL],
        mockContact
      )
      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(successResponse).toHaveBeenCalledWith(
        res,
        202,
        'Message enregistré. Notification email indisponible.',
        mockContact,
        null,
        { emailWarning: expect.any(String) }
      )
    })

    it("enregistre le message sans essayer d'envoyer d'email si aucune adresse d'entreprise n'est configurée", async () => {
      process.env.EMAIL = ''
      const mockContact = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0600000000',
        subject: 'Sujet',
        message: 'Bonjour',
      }
      Contact.create.mockResolvedValue({ get: () => mockContact })

      const req = { body: { ...mockContact } }
      const res = createRes()

      await Create(req, res)

      expect(sendEmail).not.toHaveBeenCalled()
      expect(successResponse).toHaveBeenCalledWith(
        res,
        201,
        'Message envoyé avec succès.',
        mockContact,
        null,
        null
      )
    })

    it('retourne une erreur interne si une exception est levée', async () => {
      Contact.create.mockRejectedValue(new Error('db down'))
      const req = { body: { name: 'Jane', email: 'jane@mail.com', subject: 'S', message: 'M' } }
      const res = createRes()

      await Create(req, res)

      expect(internalErrorResponse).toHaveBeenCalledWith(
        res,
        'Une erreur interne est survenue. Impossible de créer le message de contact.'
      )
    })
  })

  describe('GetAll', () => {
    it('retourne toutes les entrées ordonnées', async () => {
      const contacts = [{ id: 1 }, { id: 2 }]
      Contact.findAll.mockResolvedValue(contacts)
      const res = createRes()

      await GetAll({}, res)

      expect(Contact.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
        raw: true,
      })
      expect(successResponse).toHaveBeenCalledWith(
        res,
        200,
        'Liste des messages récupérée avec succès.',
        contacts
      )
    })
  })

  describe('GetById', () => {
    it("retourne une erreur de validation si l'identifiant est invalide", async () => {
      const res = createRes()

      await GetById({ params: { id: 'abc' } }, res)

      expect(validationErrorResponse).toHaveBeenCalledWith(
        res,
        "L'identifiant fourni est invalide."
      )
    })

    it("retourne 404 si le message n'existe pas", async () => {
      Contact.findByPk.mockResolvedValue(null)
      const res = createRes()

      await GetById({ params: { id: '5' } }, res)

      expect(notFoundResponse).toHaveBeenCalledWith(res, 'Message de contact introuvable.')
    })

    it('marque un message comme lu et le renvoie', async () => {
      const save = jest.fn()
      const contact = { id: 3, hasBeenRead: false, save }
      Contact.findByPk.mockResolvedValue(contact)
      const res = createRes()

      await GetById({ params: { id: '3' } }, res)

      expect(save).toHaveBeenCalledTimes(1)
      expect(successResponse).toHaveBeenCalledWith(
        res,
        200,
        'Message récupéré avec succès.',
        contact
      )
    })
  })

  describe('Update', () => {
    it('retourne une erreur de validation si hasBeenRead est absent', async () => {
      const res = createRes()

      await Update({ params: { id: '2' }, body: {} }, res)

      expect(validationErrorResponse).toHaveBeenCalledWith(
        res,
        "Le champ 'hasBeenRead' est obligatoire et doit être un booléen."
      )
    })

    it('retourne une erreur de validation si lid est incorrect', async () => {
      const res = createRes()

      await Update({ params: { id: 'NaN' }, body: { hasBeenRead: true } }, res)

      expect(validationErrorResponse).toHaveBeenCalledWith(
        res,
        "L'identifiant fourni est invalide."
      )
    })

    it('met à jour le statut de lecture', async () => {
      const save = jest.fn()
      const contact = { id: 7, hasBeenRead: false, save }
      Contact.findByPk.mockResolvedValue(contact)
      const res = createRes()

      await Update({ params: { id: '7' }, body: { hasBeenRead: true } }, res)

      expect(contact.hasBeenRead).toBe(true)
      expect(save).toHaveBeenCalledTimes(1)
      expect(successResponse).toHaveBeenCalledWith(
        res,
        200,
        'Statut de lecture mis à jour.',
        contact
      )
    })
  })

  describe('DeleteById', () => {
    it("retourne 404 si le message n'existe pas", async () => {
      Contact.findByPk.mockResolvedValue(null)
      const res = createRes()

      await DeleteById({ params: { id: '15' } }, res)

      expect(notFoundResponse).toHaveBeenCalledWith(res, 'Message de contact introuvable.')
    })

    it('supprime le message et retourne un succès', async () => {
      const destroy = jest.fn()
      Contact.findByPk.mockResolvedValue({ id: 10, destroy })
      const res = createRes()

      await DeleteById({ params: { id: '10' } }, res)

      expect(destroy).toHaveBeenCalledTimes(1)
      expect(successResponse).toHaveBeenCalledWith(
        res,
        200,
        'Message supprimé avec succès.'
      )
    })

    it("retourne une erreur de validation si l'identifiant est invalide", async () => {
      const res = createRes()

      await DeleteById({ params: { id: 'abc' } }, res)

      expect(validationErrorResponse).toHaveBeenCalledWith(
        res,
        "L'identifiant fourni est invalide."
      )
    })
  })
})
