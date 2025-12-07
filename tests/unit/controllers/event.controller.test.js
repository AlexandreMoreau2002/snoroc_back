jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}))

jest.mock('../../../src/models/event.model', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
}))

const fs = require('fs')
const Event = require('../../../src/models/event.model')
const { Create, GetAll, GetById, Update, Delete } = require('../../../src/controllers/event.controller')

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
})

describe('Event Controller', () => {
  let consoleErrorSpy
  let consoleLogSpy

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleLogSpy.mockRestore()
  })

  describe('Create', () => {
    it('retourne 400 si des champs sont manquants', async () => {
      const res = createRes()

      await Create({ body: { title: '', content: '', address: '' }, file: null }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Titre, contenu, adresse et image sont obligatoires.',
      })
    })

    it('retourne 401 si utilisateur non authentifié', async () => {
      const res = createRes()
      const req = {
        body: { title: 'Hello', content: 'World', address: 'Paris' },
        file: { filename: 'image.png' },
        user: {},
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      }

      await Create(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Utilisateur non authentifié.',
      })
    })

    it('crée un évènement avec succès', async () => {
      const res = createRes()
      Event.create.mockResolvedValue({})
      const req = {
        body: { title: 'Hello', content: 'World', address: 'Paris' },
        file: { filename: 'image.png' },
        user: { userId: 2 },
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      }

      await Create(req, res)

      expect(Event.create).toHaveBeenCalledWith({
        authorId: 2,
        title: 'Hello',
        content: 'World',
        address: 'Paris',
        thumbnail: expect.stringContaining('uploads/image.png'),
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Évènement créé avec succès.',
      })
    })

    it('retourne 500 si la création échoue', async () => {
      const res = createRes()
      Event.create.mockRejectedValue(new Error('db issue'))
      const req = {
        body: { title: 'Titre', content: 'Corps', address: 'Paris' },
        file: { filename: 'image.png' },
        user: { userId: 4 },
        protocol: 'https',
        get: jest.fn().mockReturnValue('snoroc.test'),
      }

      await Create(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Une erreur interne est survenue.',
      })
    })
  })

  describe('GetAll', () => {
    it('renvoie la liste complète des évènements', async () => {
      const res = createRes()
      const eventList = [{ id: 1 }, { id: 2 }]
      Event.findAll.mockResolvedValue(eventList)

      await GetAll({}, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Les évènements ont bien été récupérés',
        data: eventList,
      })
    })

    it('renvoie 500 en cas derreur lors de la récupération', async () => {
      const res = createRes()
      Event.findAll.mockRejectedValue(new Error('db'))

      await GetAll({}, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
      })
    })
  })

  describe('GetById', () => {
    it('retourne 400 si id invalide', async () => {
      const res = createRes()

      await GetById({ params: { id: 'abc' } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 404 si évènement manquant', async () => {
      const res = createRes()
      Event.findOne.mockResolvedValue(null)

      await GetById({ params: { id: '7' } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: "L'évènement est introuvable.",
      })
    })

    it('retourne 200 avec la ressource', async () => {
      const res = createRes()
      const event = { id: 3 }
      Event.findOne.mockResolvedValue(event)

      await GetById({ params: { id: '3' } }, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: "L'évènement a été récupéré.",
        data: event,
      })
    })

    it('renvoie 500 si une erreur inattendue survient', async () => {
      const res = createRes()
      Event.findOne.mockRejectedValue(new Error('db'))

      await GetById({ params: { id: '2' } }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Une erreur interne est survenue, veuillez réessayer plus tard.',
      })
    })
  })

  describe('Update', () => {
    it('refuse si utilisateur non authentifié', async () => {
      const res = createRes()

      await Update({ params: { id: '1' }, body: {} }, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retourne 404 si évènement introuvable', async () => {
      const res = createRes()
      Event.findOne.mockResolvedValue(null)

      await Update({ params: { id: '8' }, body: {}, user: { userId: 1 } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: "L'évènement est introuvable.",
      })
    })

    it('retourne 400 si lid est invalide', async () => {
      const res = createRes()

      await Update({ params: { id: 'abc' }, body: {}, user: { userId: 1 } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: "Requête invalide. L'ID doit être un entier valide.",
      })
    })

    it('met à jour la miniature et supprime l ancienne', async () => {
      const res = createRes()
      const update = jest.fn().mockResolvedValue({ id: 12, thumbnail: 'new' })
      Event.findOne.mockResolvedValue({
        id: 12,
        title: 'Old',
        content: 'Content',
        address: 'Paris',
        thumbnail: 'http://localhost/uploads/old.png',
        update,
      })
      fs.existsSync.mockReturnValue(true)
      const req = {
        params: { id: '12' },
        body: { title: 'New title' },
        user: { userId: 9 },
        file: { filename: 'fresh.png' },
        protocol: 'https',
        get: jest.fn().mockReturnValue('snoroc.dev'),
      }

      await Update(req, res)

      expect(fs.unlinkSync).toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({
        title: 'New title',
        content: 'Content',
        address: 'Paris',
        thumbnail: expect.stringContaining('uploads/fresh.png'),
        updatedAt: expect.any(Date),
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Évènement mis à jour avec succès.',
        data: { id: 12, thumbnail: 'new' },
      })
    })

    it("journalise une erreur si la suppression de l'ancienne image échoue", async () => {
      const res = createRes()
      const update = jest.fn().mockResolvedValue({ id: 13 })
      Event.findOne.mockResolvedValue({
        id: 13,
        title: 'Old',
        content: 'Content',
        address: 'Paris',
        thumbnail: 'http://localhost/uploads/old.png',
        update,
      })
      fs.existsSync.mockReturnValue(true)
      const unlinkError = new Error('fs issue')
      fs.unlinkSync.mockImplementation(() => {
        throw unlinkError
      })

      await Update(
        {
          params: { id: '13' },
          body: {},
          user: { userId: 1 },
          file: { filename: 'fresh.png' },
          protocol: 'https',
          get: jest.fn().mockReturnValue('snoroc.dev'),
        },
        res
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erreur lors de la suppression de l'ancienne image :",
        unlinkError
      )
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it("conserve l'ancienne miniature si aucun fichier précédent n'existe", async () => {
      const res = createRes()
      const update = jest.fn().mockResolvedValue({ id: 14, thumbnail: 'same' })
      Event.findOne.mockResolvedValue({
        id: 14,
        title: 'Old',
        content: 'Content',
        address: 'Paris',
        thumbnail: 'http://localhost/uploads/old.png',
        update,
      })
      fs.existsSync.mockReturnValue(false)

      await Update(
        {
          params: { id: '14' },
          body: { content: 'New' },
          user: { userId: 2 },
          file: { filename: 'fresh.png' },
          protocol: 'https',
          get: jest.fn().mockReturnValue('snoroc.dev'),
        },
        res
      )

      expect(consoleLogSpy).toHaveBeenCalledWith('Aucune ancienne image trouvée.')
      expect(update).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('retourne 500 en cas derreur serveur pendant la mise à jour', async () => {
      const res = createRes()
      Event.findOne.mockRejectedValue(new Error('db error'))

      await Update({ params: { id: '1' }, body: {}, user: { userId: 1 } }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Une erreur interne est survenue.',
      })
    })
  })

  describe('Delete', () => {
    it('retourne 400 si id manquant', async () => {
      const res = createRes()

      await Delete({ params: { id: '' } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 404 si la ressource est absente', async () => {
      const res = createRes()
      Event.findOne.mockResolvedValue(null)

      await Delete({ params: { id: '6' } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: "L'évènement est introuvable.",
      })
    })

    it('supprime la miniature si elle existe', async () => {
      const res = createRes()
      Event.findOne.mockResolvedValue({
        id: 4,
        thumbnail: 'http://localhost/uploads/old.png',
        destroy: jest.fn().mockResolvedValue(),
      })
      fs.existsSync.mockReturnValue(true)

      await Delete({ params: { id: '4' } }, res)

      expect(fs.unlinkSync).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: "L'évènement a été supprimé avec succès.",
      })
    })

    it("journalise une erreur si la suppression du fichier échoue", async () => {
      const res = createRes()
      const destroy = jest.fn().mockResolvedValue()
      Event.findOne.mockResolvedValue({
        id: 5,
        thumbnail: 'http://localhost/uploads/event.png',
        destroy,
      })
      fs.existsSync.mockReturnValue(true)
      const fileError = new Error('remove failed')
      fs.unlinkSync.mockImplementation(() => {
        throw fileError
      })

      await Delete({ params: { id: '5' } }, res)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erreur lors de la suppression de l'image :",
        fileError
      )
      expect(destroy).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it("journalise l'absence de fichier lors de la suppression", async () => {
      const res = createRes()
      const destroy = jest.fn().mockResolvedValue()
      Event.findOne.mockResolvedValue({
        id: 6,
        thumbnail: 'http://localhost/uploads/event.png',
        destroy,
      })
      fs.existsSync.mockReturnValue(false)

      await Delete({ params: { id: '6' } }, res)

      expect(consoleLogSpy).toHaveBeenCalledWith("Le fichier à supprimer n'existe pas.")
      expect(destroy).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('retourne 500 en cas derreur lors de la suppression', async () => {
      const res = createRes()
      Event.findOne.mockResolvedValue({
        id: 4,
        thumbnail: null,
        destroy: jest.fn().mockRejectedValue(new Error('destroy failed')),
      })

      await Delete({ params: { id: '4' } }, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Une erreur interne est survenue.',
      })
    })
  })
})
