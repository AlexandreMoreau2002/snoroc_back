const { emailDataforgotPassword } = require('../../../src/services/email/forgotPasswordEmail.service')

describe('emailDataforgotPassword', () => {
  const originalFrontendUrl = process.env.FRONTEND_URL
  const originalEmail = process.env.EMAIL

  beforeEach(() => {
    process.env.EMAIL = 'no-reply@example.com'
  })

  afterEach(() => {
    process.env.FRONTEND_URL = originalFrontendUrl
    process.env.EMAIL = originalEmail
  })

  it('construit un lien sans double slash quand FRONTEND_URL termine par /', () => {
    process.env.FRONTEND_URL = 'https://dev.snoroc.fr/'

    const mailData = emailDataforgotPassword('user@example.com', 'abc123')

    expect(mailData.html).toContain('https://dev.snoroc.fr/ForgotPassword?token=abc123')
    expect(mailData.text).toContain('https://dev.snoroc.fr/ForgotPassword?token=abc123')
  })

  it('fonctionne aussi sans slash final', () => {
    process.env.FRONTEND_URL = 'https://dev.snoroc.fr'

    const mailData = emailDataforgotPassword('user@example.com', 'token456')

    expect(mailData.html).toContain('https://dev.snoroc.fr/ForgotPassword?token=token456')
  })

  it('retombe sur un chemin relatif si FRONTEND_URL est absent', () => {
    delete process.env.FRONTEND_URL

    const mailData = emailDataforgotPassword('user@example.com', 'token789')

    expect(mailData.html).toContain('/ForgotPassword?token=token789')
    expect(mailData.text).toContain('/ForgotPassword?token=token789')
  })
})
