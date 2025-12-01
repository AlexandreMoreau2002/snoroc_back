jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}))

jest.mock('../../../src/models/news.model', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
}))

jest.mock('../../../src/models/user.model', () => ({
  findAll: jest.fn(),
}))

jest.mock('../../../src/services/email/emailDispatcher', () => ({
  enqueueEmail: jest.fn(),
}))

jest.mock('../../../src/services/email/newNews.service', () => ({
  notifNewsletterNews: jest.fn(),
}))

const fs = require('fs')
const News = require('../../../src/models/news.model')
const User = require('../../../src/models/user.model')
const emailDispatcher = require('../../../src/services/email/emailDispatcher')
const { notifNewsletterNews } = require('../../../src/services/email/newNews.service')
const {
  Create,
  GetAll,
  GetById,
  Update,
  Delete,
} = require('../../../src/controllers/news.controller')

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
})

describe('News Controller', () => {
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

      await Create({ body: { title: '', content: '' }, file: null }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Titre, contenu, et image sont obligatoires.',
      })
    })

    it('crée une actualité sans abonnés newsletter', async () => {
      const res = createRes()
      const news = { id: 1, title: 'Hello', content: 'World', thumbnail: 'url' }
      News.create.mockResolvedValue(news)
      User.findAll.mockResolvedValue([])
      const req = {
        body: { title: 'Hello', content: 'World' },
        file: { filename: 'image.png' },
        user: { userId: 2 },
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      }

      await Create(req, res)

      expect(News.create).toHaveBeenCalledWith({
        authorId: 2,
        title: 'Hello',
        content: 'World',
        thumbnail: expect.stringContaining('uploads/image.png'),
      })
      expect(emailDispatcher.enqueueEmail).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Actualité créée avec succès',
      })
    })

    it('retourne 401 si utilisateur non authentifié', async () => {
      const res = createRes()
      const req = {
        body: { title: 'Hello', content: 'World' },
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

      it('envoie des emails aux abonnés newsletter et capture les erreurs', async () => {
        const res = createRes()
        const news = { id: 5, title: 'Titre', content: 'Corps', thumbnail: 'url' }
        News.create.mockResolvedValue(news)
        User.findAll.mockResolvedValue([{ email: 'user@example.com' }])
      notifNewsletterNews.mockReturnValue({ to: 'user@example.com' })
      emailDispatcher.enqueueEmail.mockImplementation(() => {
        throw new Error('smtp')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const req = {
        body: { title: 'Titre', content: 'Corps' },
        file: { filename: 'image.png' },
        user: { userId: 4 },
        protocol: 'https',
        get: jest.fn().mockReturnValue('snoroc.test'),
      }

      await Create(req, res)

      expect(notifNewsletterNews).toHaveBeenCalledWith('user@example.com', 5)
      expect(emailDispatcher.enqueueEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Actualité créée avec succès et notifications envoyées.',
      })
        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
      })

      it("journalise une erreur quand la mise en file d'attente échoue", async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        const res = createRes()
        const news = { id: 6, title: 'Titre', content: 'Corps', thumbnail: 'url' }
        News.create.mockResolvedValue(news)
        User.findAll.mockResolvedValue([{ email: 'user@example.com' }])
        notifNewsletterNews.mockReturnValue({ to: 'user@example.com' })
        emailDispatcher.enqueueEmail.mockReturnValue(false)
        const req = {
          body: { title: 'Titre', content: 'Corps' },
          file: { filename: 'image.png' },
          user: { userId: 4 },
          protocol: 'https',
          get: jest.fn().mockReturnValue('snoroc.test'),
        }

        await Create(req, res)

        expect(consoleSpy).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(201)
        consoleSpy.mockRestore()
      })

      it('retourne 500 si la création échoue', async () => {
        const res = createRes()
        News.create.mockRejectedValue(new Error('db issue'))
        const req = {
          body: { title: 'Titre', content: 'Corps' },
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
      it('renvoie la liste complète des actualités', async () => {
        const res = createRes()
        const newsList = [{ id: 1 }, { id: 2 }]
        News.findAll.mockResolvedValue(newsList)

      await GetAll({}, res)

      expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
          error: false,
          message: 'Les actualités ont bien été récupérés',
          data: newsList,
        })
      })

      it('renvoie 500 en cas derreur lors de la récupération', async () => {
        const res = createRes()
        News.findAll.mockRejectedValue(new Error('db'))

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

    it('retourne 404 si actualité manquante', async () => {
      const res = createRes()
      News.findOne.mockResolvedValue(null)

      await GetById({ params: { id: '7' } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: "L'actualité est introuvable.",
      })
    })

      it('retourne 200 avec la ressource', async () => {
        const res = createRes()
        const news = { id: 3 }
        News.findOne.mockResolvedValue(news)

      await GetById({ params: { id: '3' } }, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: "L'actualité a été récupérée.",
          data: news,
        })
      })

      it('renvoie 500 si une erreur inattendue survient', async () => {
        const res = createRes()
        News.findOne.mockRejectedValue(new Error('db'))

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

    it('retourne 404 si actualité introuvable', async () => {
      const res = createRes()
      News.findOne.mockResolvedValue(null)

      await Update({ params: { id: '8' }, body: {}, user: { userId: 1 } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: "L'actualité est introuvable.",
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
        News.findOne.mockResolvedValue({
          id: 12,
        title: 'Old',
        content: 'Content',
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
        thumbnail: expect.stringContaining('uploads/fresh.png'),
        updatedAt: expect.any(Date),
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Actualité mise à jour avec succès.',
        data: { id: 12, thumbnail: 'new' },
      })
    })

    it("journalise une erreur si la suppression de l'ancienne image échoue", async () => {
      const res = createRes()
      const update = jest.fn().mockResolvedValue({ id: 13 })
      News.findOne.mockResolvedValue({
        id: 13,
        title: 'Old',
        content: 'Content',
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
      News.findOne.mockResolvedValue({
        id: 14,
        title: 'Old',
        content: 'Content',
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
        News.findOne.mockRejectedValue(new Error('db error'))

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
      News.findOne.mockResolvedValue(null)

      await Delete({ params: { id: '6' } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Actualité introuvable.',
      })
    })

    it('supprime la miniature si elle existe', async () => {
        const res = createRes()
        News.findOne.mockResolvedValue({
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
        message: "L'actualité a été supprimée avec succès.",
      })
    })

    it("journalise une erreur si la suppression du fichier échoue", async () => {
      const res = createRes()
      const destroy = jest.fn().mockResolvedValue()
      News.findOne.mockResolvedValue({
        id: 5,
        thumbnail: 'http://localhost/uploads/news.png',
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
      News.findOne.mockResolvedValue({
        id: 6,
        thumbnail: 'http://localhost/uploads/news.png',
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
        News.findOne.mockResolvedValue({
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
