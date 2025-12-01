const EmailWorker = require('../../../src/services/email/emailWorker')

describe('EmailWorker', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('traite la file et envoie un email avec succès', async () => {
    const sendFn = jest.fn().mockResolvedValue({ success: true })
    const worker = new EmailWorker({ sendFn, maxRetries: 2, baseBackoffMs: 0 })
    const queue = [{ to: 'user@example.com' }]
    worker.bindQueue(queue)

    await worker.processQueue()

    expect(sendFn).toHaveBeenCalledWith({ to: 'user@example.com' })
    expect(queue).toHaveLength(0)
  })

  it('réessaie un envoi en échec jusqu\'à la limite', async () => {
    const sendFn = jest.fn().mockResolvedValue({ success: false })
    const worker = new EmailWorker({ sendFn, maxRetries: 3, baseBackoffMs: 0 })
    const queue = [{ to: 'user@example.com' }]
    worker.bindQueue(queue)

    await worker.processQueue()

    expect(sendFn).toHaveBeenCalledTimes(3)
    expect(queue).toHaveLength(0)
  })

  it('capture les erreurs inattendues et planifie une relance', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const sendFn = jest.fn().mockRejectedValue(new Error('smtp down'))
    const worker = new EmailWorker({ sendFn, maxRetries: 1, baseBackoffMs: 0 })
    const queue = [{ to: 'user@example.com' }]
    worker.bindQueue(queue)

    await worker.processQueue()

    expect(sendFn).toHaveBeenCalledTimes(1)
    expect(queue).toHaveLength(0)
    consoleSpy.mockRestore()
  })

  it('ignore le déclenchement si un traitement est déjà en cours', async () => {
    const sendFn = jest.fn().mockResolvedValue({ success: true })
    const worker = new EmailWorker({ sendFn })
    worker.isProcessing = true
    worker.bindQueue([{ to: 'user@example.com' }])

    await worker.processQueue()

    expect(sendFn).not.toHaveBeenCalled()
  })

  it('relance le worker après une erreur de boucle', async () => {
    jest.useFakeTimers()
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
    const worker = new EmailWorker({ sendFn: jest.fn() })
    worker.bindQueue([{ to: 'user@example.com' }])
    worker.handleJob = jest.fn(() => {
      throw new Error('loop error')
    })

    await worker.processQueue()
    expect(worker.handleJob).toHaveBeenCalled()
    expect(setTimeoutSpy).toHaveBeenCalled()
    jest.useRealTimers()
    setTimeoutSpy.mockRestore()
  })
})
