const { sendEmail } = require('./sendEmail')

class EmailWorker {
  constructor({
    sendFn = sendEmail,
    maxRetries = 3,
    baseBackoffMs = 250,
  } = {}) {
    this.sendFn = sendFn
    this.maxRetries = maxRetries
    this.baseBackoffMs = baseBackoffMs
    this.queue = []
    this.isProcessing = false
  }

  bindQueue(queue) {
    this.queue = queue
  }

  async processQueue() {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      while (this.queue.length > 0) {
        const job = this.queue.shift()
        await this.handleJob(job)
      }
    } catch (error) {
      console.error('[EmailWorker] Boucle interrompue, relance programmée.', error)
      setTimeout(() => this.processQueue(), this.baseBackoffMs)
    } finally {
      this.isProcessing = false
    }
  }

  async handleJob(job) {
    let attempt = 0

    while (attempt < this.maxRetries) {
      attempt += 1

      let result
      try {
        result = await this.sendFn(job)
      } catch (error) {
        console.error('[EmailWorker] Erreur lors de l\'envoi :', error)
        result = { success: false, error }
      }
      if (result?.success) {
        return
      }

      const delay = this.baseBackoffMs * attempt
      console.error(
        `[EmailWorker] Tentative ${attempt}/${this.maxRetries} échouée. Nouvelle tentative dans ${delay}ms.`
      )

      await this.wait(delay)
    }

    console.error('[EmailWorker] Abandon après plusieurs tentatives pour le job :', job)
  }

  wait(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration))
  }
}

module.exports = EmailWorker
