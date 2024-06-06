const express = require('express');
const router = express.Router();
const bigchaindbController = require('../controllers/bigchaindb');

router.get('/:query', bigchaindbController.searchMetadata);

module.exports = router;
