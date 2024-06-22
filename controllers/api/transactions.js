const { createTransaction, getTransaction } = require('../../utils/bigchaindb');

exports.createTransaction = async (req, res) => {
    const { data, metadata } = req.body;

    console.log('CREATE TRANSACTION', data, metadata);

    try {
        const retrievedTx = await createTransaction(data, metadata);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        const tx = await getTransaction(id);

        res.json(tx);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};