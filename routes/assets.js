const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assets');

router.get('/:query', assetsController.searchAssets);

module.exports = router;
