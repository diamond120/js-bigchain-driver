const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadata');

router.get('/:query', metadataController.searchMetadata);

module.exports = router;
