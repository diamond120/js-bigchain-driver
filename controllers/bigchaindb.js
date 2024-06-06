const { v4: uuidv4 } = require('uuid');
const { createTransaction } = require('../utils/bigchaindb');
require('../config');

exports.createAsset = async (req, res) => {
    const { object, data } = req.body;
    try {
        let metadata = {
            "object": object,
        };
        metadata['uid'] = uuidv4();
        metadata['timestamp'] = Math.floor(Date.now() / 1000);

        const retrievedTx = await createTransaction(data, metadata);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
};

exports.updateAsset = async (req, res) => {
    const { object, data } = req.body;
    try {
        let metadata = {
            "object": object,
        };
        metadata['uid'] = uuidv4();
        metadata['timestamp'] = Math.floor(Date.now() / 1000);

        const retrievedTx = await createTransaction(data, metadata);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
};

exports.getAsset = async (req, res) => {
    const { object, data } = req.body;
    try {
        let metadata = {
            "object": object,
        };
        metadata['uid'] = uuidv4();
        metadata['timestamp'] = Math.floor(Date.now() / 1000);

        const retrievedTx = await createTransaction(data, metadata);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAsset = async (req, res) => {
    const { object, data } = req.body;
    try {
        let metadata = {
            "object": object,
        };
        metadata['uid'] = uuidv4();
        metadata['timestamp'] = Math.floor(Date.now() / 1000);

        const retrievedTx = await createTransaction(data, metadata);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
