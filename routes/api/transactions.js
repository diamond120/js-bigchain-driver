const express = require('express');
const router = express.Router();
const transactionsController = require('../../controllers/api/transactions');

router.post('/', transactionsController.createTransaction);
router.get('/:id', transactionsController.getTransactionById);

module.exports = router;
