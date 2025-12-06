jest.mock('../../../src/models/media.model', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
}))

const Media = require('../../../src/models/media.model')
const {
  Create,
  GetAll,
  GetById,
  Update,
  Delete,
} = require('../../../src/controllers/media.controller')

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
})

describe('Media Controller', () => {
  let consoleErrorSpy

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Create', () => {
    it('retourne 400 si des champs sont manquants', async () => {
      const res = createRes()

      await Create({ body: { title: '', url: '' }, user: {} }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Titre et URL YouTube sont obligatoires.',
      })
    })

    it('retourne 401 si utilisateur non authentifié', async () => {
      const res = createRes()

      await Create({ body: { title: 'Live', url: 'https://youtu.be/abc' }, user: {} }, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Utilisateur non authentifié.',
      })
    })

    it('retourne 400 si url non valide', async () => {
      const res = createRes()

      await Create(
        { body: { title: 'Live', url: 'https://vimeo.com/1' }, user: { userId: 1 } },
        res
      )

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'URL YouTube invalide.',
      })
    })

    it('crée un média avec succès', async () => {
      const res = createRes()
      Media.create.mockResolvedValue({ id: 1 })

      await Create(
        { body: { title: 'Live', url: 'https://youtu.be/abc' }, user: { userId: 1 } },
        res
      )

      expect(Media.create).toHaveBeenCalledWith({
        title: 'Live',
        description: null,
        url: 'https://youtu.be/abc',
        authorId: 1,
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Média créé avec succès.',
      })
    })

    it('retourne 500 si la création échoue', async () => {
      const res = createRes()
      Media.create.mockRejectedValue(new Error('db'))

      await Create(
        { body: { title: 'Live', url: 'https://youtu.be/abc' }, user: { userId: 1 } },
        res
      )

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Une erreur interne est survenue.',
      })
    })
  })

  describe('GetAll', () => {
    it('renvoie la liste complète des médias', async () => {
      const res = createRes()
      const medias = [{ id: 1 }, { id: 2 }]
      Media.findAll.mockResolvedValue(medias)

      await GetAll({}, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Les médias ont bien été récupérés.',
        data: medias,
      })
    })

    it('renvoie 500 en cas derreur lors de la récupération', async () => {
      const res = createRes()
      Media.findAll.mockRejectedValue(new Error('db'))

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

    it('retourne 404 si média manquant', async () => {
      const res = createRes()
      Media.findOne.mockResolvedValue(null)

      await GetById({ params: { id: '7' } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Le média est introuvable.',
      })
    })

    it('retourne 200 avec la ressource', async () => {
      const res = createRes()
      const media = { id: 3 }
      Media.findOne.mockResolvedValue(media)

      await GetById({ params: { id: '3' } }, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Le média a été récupéré.',
        data: media,
      })
    })

    it('renvoie 500 si une erreur inattendue survient', async () => {
      const res = createRes()
      Media.findOne.mockRejectedValue(new Error('db'))

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

    it('retourne 400 si id invalide', async () => {
      const res = createRes()

      await Update({ params: { id: 'abc' }, body: {}, user: { userId: 1 } }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: "Requête invalide. L'ID doit être un entier valide.",
      })
    })

    it('retourne 404 si média introuvable', async () => {
      const res = createRes()
      Media.findOne.mockResolvedValue(null)

      await Update({ params: { id: '8' }, body: {}, user: { userId: 1 } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Le média est introuvable.',
      })
    })

    it('refuse une URL non YouTube', async () => {
      const res = createRes()

      await Update(
        { params: { id: '1' }, body: { url: 'https://example.com' }, user: { userId: 2 } },
        res
      )

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'URL YouTube invalide.',
      })
    })

    it('met à jour un média avec succès', async () => {
      const res = createRes()
      const update = jest.fn().mockResolvedValue({ id: 12, url: 'https://youtu.be/updated' })
      Media.findOne.mockResolvedValue({
        id: 12,
        title: 'Old',
        description: 'Desc',
        url: 'https://youtu.be/old',
        update,
      })

      await Update(
        {
          params: { id: '12' },
          body: { title: 'New title', url: 'https://youtu.be/updated' },
          user: { userId: 9 },
        },
        res
      )

      expect(update).toHaveBeenCalledWith({
        title: 'New title',
        description: 'Desc',
        url: 'https://youtu.be/updated',
        updatedAt: expect.any(Date),
      })
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Média mis à jour avec succès.',
        data: { id: 12, url: 'https://youtu.be/updated' },
      })
    })

    it('utilise les anciennes valeurs si non fournies dans le body', async () => {
      const res = createRes()
      const update = jest.fn().mockResolvedValue({ id: 12, title: 'Old', url: 'https://youtu.be/old' })
      Media.findOne.mockResolvedValue({
        id: 12,
        title: 'Old',
        description: 'Desc',
        url: 'https://youtu.be/old',
        update,
      })

      await Update(
        {
          params: { id: '12' },
          body: {}, // Body vide
          user: { userId: 9 },
        },
        res
      )

      expect(update).toHaveBeenCalledWith({
        title: 'Old',
        description: 'Desc',
        url: 'https://youtu.be/old',
        updatedAt: expect.any(Date),
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('retourne 500 en cas derreur serveur pendant la mise à jour', async () => {
      const res = createRes()
      Media.findOne.mockRejectedValue(new Error('db error'))

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
      Media.findOne.mockResolvedValue(null)

      await Delete({ params: { id: '6' } }, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Média introuvable.',
      })
    })

    it('supprime un média avec succès', async () => {
      const res = createRes()
      const destroy = jest.fn().mockResolvedValue()
      Media.findOne.mockResolvedValue({ id: 4, destroy })

      await Delete({ params: { id: '4' } }, res)

      expect(destroy).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Le média a été supprimé avec succès.',
      })
    })

    it('retourne 500 en cas derreur lors de la suppression', async () => {
      const res = createRes()
      Media.findOne.mockResolvedValue({
        id: 4,
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
