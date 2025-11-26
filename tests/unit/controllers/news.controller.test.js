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

jest.mock('../../../config/nodemailer.config', () => ({
  sendEmail: jest.fn(),
}))

jest.mock('../../../src/services/email/newNews.service', () => ({
  notifNewsletterNews: jest.fn(),
}))

const fs = require('fs')
const News = require('../../../src/models/news.model')
const User = require('../../../src/models/user.model')
const { sendEmail } = require('../../../config/nodemailer.config')
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
  beforeEach(() => {
    jest.clearAllMocks()
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
      expect(sendEmail).not.toHaveBeenCalled()
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
      sendEmail.mockRejectedValue(new Error('smtp'))
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
      expect(sendEmail).toHaveBeenCalledWith({ to: 'user@example.com' })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Actualité créée avec succès et notifications envoyées.',
      })
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
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
  })
})
