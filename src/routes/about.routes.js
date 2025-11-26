const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');
const auth = require('../middlewares/authenticate.middlewares');
const upload = require('../middlewares/upload.middleware');

// Route publique pour récupérer le contenu
router.get('/', aboutController.getAbout);

// Route protégée pour modifier le contenu (Admin)
router.put('/', auth, upload.single('image'), aboutController.updateAbout);

module.exports = router;
