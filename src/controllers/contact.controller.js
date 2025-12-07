// back/src/controllers/contact.controller.js
const Contact = require('../models/contact.model')
const emailDispatcher = require('../services/email/emailDispatcher')
const { cleanInput, isValidEmail } = require('../utils/common.utils')
const { buildContactEmailNotification } = require('../services/email/contactEmailTemplate.service')
const {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} = require('../utils/apiResponse.utils')

exports.Create = async (req, res) => {
  try {
    const name = cleanInput(req.body?.name)
    const email = cleanInput(req.body?.email)
    const phone = cleanInput(req.body?.phone)
    const subject = cleanInput(req.body?.subject)
    const message = cleanInput(req.body?.message)

    const errors = []
    if (!name) errors.push('Le nom est obligatoire.')
    if (!email || !isValidEmail(email)) errors.push("L'email est invalide.")
    if (!subject) errors.push('Le sujet est obligatoire.')
    if (!message) errors.push('Le message est obligatoire.')

    if (errors.length > 0) {
      return validationErrorResponse(
        res,
        'Certains champs sont invalides.',
        errors
      )
    }

    const contactPayload = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
    }

    const createdContactInstance = await Contact.create(contactPayload)
    const createdContact = createdContactInstance.get({ plain: true })

    let emailWarning = null
    const companyEmail = process.env.EMAIL

    if (companyEmail) {
      try {
        const emailData = buildContactEmailNotification(
          [companyEmail],
          createdContact
        )
        const queued = emailDispatcher.enqueueEmail(emailData)
        if (!queued) {
          emailWarning =
            "Message enregistré, mais l'envoi de l'email a échoué. Consultez les logs pour plus de détails."
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi du mail de contact :", error)
        emailWarning =
          "Message enregistré, mais l'envoi de l'email a échoué. Consultez les logs pour plus de détails."
      }
    }

    const messageText = emailWarning
      ? 'Message enregistré. Notification email indisponible.'
      : 'Message envoyé avec succès.'

    return successResponse(
      res,
      emailWarning ? 202 : 201,
      messageText,
      createdContact,
      null,
      emailWarning ? { emailWarning } : null
    )
  } catch (error) {
    console.error('Erreur lors de la création du message de contact :', error)
    return internalErrorResponse(
      res,
      'Une erreur interne est survenue. Impossible de créer le message de contact.'
    )
  }
}

exports.GetAll = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']],
      raw: true,
    })

    return successResponse(
      res,
      200,
      'Liste des messages récupérée avec succès.',
      contacts
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des messages :', error)
    return internalErrorResponse(
      res,
      'Une erreur interne est survenue. Impossible de récupérer les messages.'
    )
  }
}

exports.GetById = async (req, res) => {
  try {
    const id = Number.parseInt(cleanInput(req.params?.id), 10)

    if (Number.isNaN(id)) {
      return validationErrorResponse(res, "L'identifiant fourni est invalide.")
    }

    const contact = await Contact.findByPk(id)

    if (!contact) {
      return notFoundResponse(res, 'Message de contact introuvable.')
    }

    if (!contact.hasBeenRead) {
      contact.hasBeenRead = true
      await contact.save()
    }

    return successResponse(res, 200, 'Message récupéré avec succès.', contact)
  } catch (error) {
    console.error('Erreur lors de la lecture du message de contact :', error)
    return internalErrorResponse(
      res,
      'Une erreur interne est survenue. Impossible de récupérer le message.'
    )
  }
}

exports.Update = async (req, res) => {
  try {
    const id = Number.parseInt(cleanInput(req.params?.id), 10)

    if (Number.isNaN(id)) {
      return validationErrorResponse(res, "L'identifiant fourni est invalide.")
    }

    const hasBeenRead =
      typeof req.body?.hasBeenRead === 'boolean' ? req.body.hasBeenRead : null

    if (hasBeenRead === null) {
      return validationErrorResponse(
        res,
        "Le champ 'hasBeenRead' est obligatoire et doit être un booléen."
      )
    }

    const contact = await Contact.findByPk(id)

    if (!contact) {
      return notFoundResponse(res, 'Message de contact introuvable.')
    }

    contact.hasBeenRead = hasBeenRead
    await contact.save()

    return successResponse(
      res,
      200,
      'Statut de lecture mis à jour.',
      contact
    )
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour du statut du message de contact :',
      error
    )
    return internalErrorResponse(
      res,
      'Une erreur interne est survenue. Impossible de mettre à jour le message.'
    )
  }
}

exports.DeleteById = async (req, res) => {
  try {
    const id = Number.parseInt(cleanInput(req.params?.id), 10)

    if (Number.isNaN(id)) {
      return validationErrorResponse(res, "L'identifiant fourni est invalide.")
    }

    const contact = await Contact.findByPk(id)

    if (!contact) {
      return notFoundResponse(res, 'Message de contact introuvable.')
    }

    await contact.destroy()

    return successResponse(res, 200, 'Message supprimé avec succès.')
  } catch (error) {
    console.error('Erreur lors de la suppression du message de contact :', error)
    return internalErrorResponse(
      res,
      'Une erreur interne est survenue. Impossible de supprimer le message.'
    )
  }
}
