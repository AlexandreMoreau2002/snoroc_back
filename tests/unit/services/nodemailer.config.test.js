jest.mock('node-mailjet', () => ({ apiConnect: jest.fn() }))

describe('nodemailer.config sendEmail', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('retourne une erreur si le service mail est absent', async () => {
    delete process.env.EMAIL_USER
    delete process.env.EMAIL_PASS
    const Mailjet = require('node-mailjet')
    Mailjet.apiConnect.mockReset()

    const { sendEmail } = require('../../../config/nodemailer.config')
    const response = await sendEmail({ from: 'a', to: 'b', subject: 's', text: 't', html: '<p>t</p>' })

    expect(response.success).toBe(false)
    expect(response.error).toEqual(new Error('Service mail non configuré'))
  })

  it('envoie les données attendues quand Mailjet est configuré', async () => {
    process.env.EMAIL_USER = 'user'
    process.env.EMAIL_PASS = 'pass'
    const Mailjet = require('node-mailjet')
    Mailjet.apiConnect.mockReset()

    const requestMock = jest.fn().mockResolvedValue({ body: { Messages: ['ok'] } })
    const postMock = jest.fn(() => ({ request: requestMock }))
    Mailjet.apiConnect.mockReturnValue({ post: postMock })

    let response
    jest.isolateModules(() => {
      const { sendEmail } = require('../../../config/nodemailer.config')
      response = sendEmail({
        from: 'from@example.com',
        to: 'to@example.com',
        subject: 'Sujet',
        text: 'Texte',
        html: '<p>HTML</p>',
      })
    })

    const result = await response

    expect(postMock).toHaveBeenCalledWith('send', { version: 'v3.1' })
    expect(requestMock).toHaveBeenCalledWith({
      Messages: [
        {
          From: { Email: 'from@example.com' },
          To: [{ Email: 'to@example.com' }],
          Subject: 'Sujet',
          TextPart: 'Texte',
          HTMLPart: '<p>HTML</p>',
        },
      ],
    })
    expect(result.success).toBe(true)
    expect(result.info).toEqual({ Messages: ['ok'] })
  })

  it('propage les erreurs renvoyées par Mailjet', async () => {
    process.env.EMAIL_USER = 'user'
    process.env.EMAIL_PASS = 'pass'
    const Mailjet = require('node-mailjet')
    Mailjet.apiConnect.mockReset()

    const requestMock = jest.fn().mockRejectedValue(new Error('boom'))
    const postMock = jest.fn(() => ({ request: requestMock }))
    Mailjet.apiConnect.mockReturnValue({ post: postMock })

    let response
    jest.isolateModules(() => {
      const { sendEmail } = require('../../../config/nodemailer.config')
      response = sendEmail({
        from: 'from@example.com',
        to: 'to@example.com',
        subject: 'Sujet',
        text: 'Texte',
        html: '<p>HTML</p>',
      })
    })

    const result = await response

    expect(result.success).toBe(false)
    expect(result.error).toEqual(new Error('boom'))
  })
})
