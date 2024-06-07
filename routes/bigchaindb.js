const express = require('express');
const router = express.Router();
const bigchaindbController = require('../controllers/bigchaindb');

router.post('/', bigchaindbController.createAsset);
router.put('/', bigchaindbController.updateAsset);
router.get('/', bigchaindbController.getAsset);
router.get('/count', bigchaindbController.countAsset);
router.delete('/', bigchaindbController.deleteAsset);

module.exports = router;
