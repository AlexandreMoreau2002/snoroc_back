const nodemailer = require('nodemailer')

describe('nodemailer.config sendEmail', () => {
  const OLD_ENV = process.env
  let createTransportSpy
  let sendMailMock
  let sendEmail
  let consoleLogSpy
  let consoleErrorSpy

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { })
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

    const nodemailer = require('nodemailer')
    sendMailMock = jest.fn().mockResolvedValue({ response: '250 OK' })

    createTransportSpy = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    })

    const config = require('../../../config/nodemailer.config')
    sendEmail = config.sendEmail
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('utilise la configuration Gmail par défaut (Local)', async () => {
    delete process.env.SMTP_HOST
    process.env.EMAIL = 'local@gmail.com'
    process.env.EMAIL_PASSWORD = 'localpassword'

    await sendEmail({ from: 'me', to: 'you', subject: 'hi', text: 'txt', html: 'html' })

    expect(createTransportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'gmail',
        auth: {
          user: 'local@gmail.com',
          pass: 'localpassword',
        },
      })
    )
  })

  it('utilise la configuration OVH si SMTP_HOST est défini (Production)', async () => {
    process.env.SMTP_HOST = 'ssl0.ovh.net'
    process.env.SMTP_PORT = '465'
    process.env.SMTP_SECURE = 'true'
    process.env.EMAIL_USER = 'prod@ovh.com'
    process.env.EMAIL_PASS = 'prodpassword'

    await sendEmail({ from: 'me', to: 'you', subject: 'hi', text: 'txt', html: 'html' })

    expect(createTransportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'ssl0.ovh.net',
        port: 465,
        secure: true,
        auth: {
          user: 'prod@ovh.com',
          pass: 'prodpassword',
        },
      })
    )
  })

  it('utilise le port par défaut 587 si SMTP_PORT est absent (Coverage Line 22)', async () => {
    process.env.SMTP_HOST = 'ssl0.ovh.net'
    delete process.env.SMTP_PORT // Force fallback
    process.env.SMTP_SECURE = 'false'
    process.env.EMAIL_USER = 'prod@ovh.com'
    process.env.EMAIL_PASS = 'prodpassword'

    await sendEmail({ from: 'me', to: 'you', subject: 'hi', text: 'txt', html: 'html' })

    expect(createTransportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'ssl0.ovh.net',
        port: 587, // Default value
      })
    )
  })

  it('utilise EMAIL_USER ou EMAIL comme fallback pour "from" (Coverage Line 41)', async () => {
    delete process.env.SMTP_HOST
    process.env.EMAIL = 'fallback@gmail.com'
    process.env.EMAIL_PASSWORD = 'pass'
    delete process.env.EMAIL_USER

    // "from" is undefined here
    await sendEmail({ to: 'you', subject: 'hi', text: 'txt', html: 'html' })

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'fallback@gmail.com',
      })
    )
  })

  it('envoie un email avec succès', async () => {
    sendMailMock.mockResolvedValue({ response: '250 OK', messageId: '123' })

    const result = await sendEmail({
      from: 'sender@test.com',
      to: 'receiver@test.com',
      subject: 'Test Subject',
      text: 'Test Body',
    })

    expect(result.success).toBe(true)
    expect(result.info).toEqual({ response: '250 OK', messageId: '123' })
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@test.com',
        to: 'receiver@test.com',
        subject: 'Test Subject',
        text: 'Test Body',
      })
    )
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[Mailer] Email sent successfully:'), expect.anything())
  })

  it('gère les erreurs d\'envoi', async () => {
    const error = new Error('Connection refused')
    sendMailMock.mockRejectedValue(error)

    const result = await sendEmail({
      from: 'sender@test.com',
      to: 'receiver@test.com',
      subject: 'Test Subject',
      text: 'Test Body',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe(error)
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Mailer] Error sending email:', error)
  })
})

