const express = require('express');
const router = express.Router();
const assetsController = require('../../controllers/api/assets');

router.get('/:query', assetsController.searchAssets);

module.exports = router;
