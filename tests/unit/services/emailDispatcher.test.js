const dispatcherModule = require('../../../src/services/email/emailDispatcher')
const { EmailDispatcher } = require('../../../src/services/email/emailDispatcher')

describe('EmailDispatcher', () => {
  it('attache la file au worker et programme le traitement', () => {
    const mockWorker = {
      bindQueue: jest.fn(),
      processQueue: jest.fn(),
    }

    const dispatcher = new EmailDispatcher(mockWorker)

    expect(mockWorker.bindQueue).toHaveBeenCalled()
    const job = { to: 'user@example.com' }

    jest.useFakeTimers()
    dispatcher.enqueueEmail(job)
    expect(dispatcher.getQueueLength()).toBe(1)

    jest.runAllTimers()
    expect(mockWorker.processQueue).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('ignore les jobs invalides et renvoie false', () => {
    const mockWorker = {
      bindQueue: jest.fn(),
      processQueue: jest.fn(),
    }

    const dispatcher = new EmailDispatcher(mockWorker)
    const result = dispatcher.enqueueEmail(null)

    expect(result).toBe(false)
    expect(dispatcher.getQueueLength()).toBe(0)
    expect(mockWorker.processQueue).not.toHaveBeenCalled()
  })

  it('retourne false en cas derreur inattendue', () => {
    const mockWorker = {
      bindQueue: jest.fn(),
      processQueue: jest.fn(),
    }

    const dispatcher = new EmailDispatcher(mockWorker)
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    dispatcher.queue.push = () => {
      throw new Error('queue down')
    }

    const result = dispatcher.enqueueEmail({ to: 'user@example.com' })

    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('expose une instance prête à l\'emploi', () => {
    expect(dispatcherModule).toHaveProperty('enqueueEmail')
    expect(typeof dispatcherModule.enqueueEmail).toBe('function')
  })
})
