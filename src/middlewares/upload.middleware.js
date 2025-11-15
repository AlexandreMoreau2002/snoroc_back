const multer = require('multer')
const path = require('path')

const cleanFilename = (originalname) => {
  const decoded = Buffer.from(originalname || '', 'latin1').toString('utf8')
  const ext = path.extname(decoded || '').toLowerCase()
  const base = path.basename(decoded || '', ext)

  const normalized = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const safeBase = normalized
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'file'

  return `${safeBase}${ext}`
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('[upload] destination hook | field:', file?.fieldname, '| mimetype:', file?.mimetype)
    cb(null, 'public/uploads/')
  },
  filename: (req, file, cb) => {
    console.log('[upload] filename hook | original name (latin1):', file?.originalname)
    const uniqueName = `${Date.now()}-${cleanFilename(file.originalname)}`
    console.log('[upload] filename hook | stored name:', uniqueName)
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille : 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Seuls les fichiers JPEG, JPG et PNG sont autorisés.'))
    }
    cb(null, true)
  },
})

module.exports = upload
