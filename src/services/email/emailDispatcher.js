const EmailWorker = require('./emailWorker')

class EmailDispatcher {
  constructor(worker = new EmailWorker()) {
    this.queue = []
    this.worker = worker
    this.worker.bindQueue(this.queue)
  }

  enqueueEmail(job) {
    try {
      if (!job) {
        console.error('[EmailDispatcher] Job invalide, ignoré.')
        return false
      }

      this.queue.push({ ...job })
      setImmediate(() => this.worker.processQueue())
      return true
    } catch (error) {
      console.error('[EmailDispatcher] Impossible d\'ajouter le job à la file.', error)
      return false
    }
  }

  getQueueLength() {
    return this.queue.length
  }
}

const dispatcher = new EmailDispatcher()

module.exports = dispatcher
module.exports.EmailDispatcher = EmailDispatcher
