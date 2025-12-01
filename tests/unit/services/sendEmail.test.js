jest.mock('../../../config/nodemailer.config', () => ({
  sendEmail: jest.fn(),
}))

const transport = require('../../../config/nodemailer.config')
const { sendEmail } = require('../../../src/services/email/sendEmail')

describe('sendEmail service wrapper', () => {
  let consoleErrorSpy

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('retourne la réponse du transport quand succès', async () => {
    transport.sendEmail.mockResolvedValue({ success: true, id: 'ok' })

    const response = await sendEmail({ to: 'user@example.com' })

    expect(transport.sendEmail).toHaveBeenCalledWith({ to: 'user@example.com' })
    expect(response).toEqual({ success: true, id: 'ok' })
  })

  it('capture les échecs du transport', async () => {
    transport.sendEmail.mockResolvedValue({ success: false, message: 'smtp down' })

    const response = await sendEmail({ to: 'user@example.com' })

    expect(response.success).toBe(false)
    expect(response.message).toBe('smtp down')
  })

  it('capture les exceptions inattendues', async () => {
    transport.sendEmail.mockRejectedValue(new Error('boom'))

    const response = await sendEmail({ to: 'user@example.com' })

    expect(response.success).toBe(false)
    expect(response.message).toContain('Une erreur inattendue')
  })
})
