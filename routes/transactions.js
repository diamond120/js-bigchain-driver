const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions');

router.post('/', transactionsController.createTransaction);
router.get('/:id', transactionsController.getTransactionById);
router.post('/api', transactionsController.createApiTransaction);

module.exports = router;
