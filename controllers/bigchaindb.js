const { v4: uuidv4 } = require('uuid');
const { createTransaction, queryTransaction } = require('../utils/bigchaindb');
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
    const { object, where, orderBy, limit } = req.body;
    try {
        let response = await queryTransaction(object, where, orderBy, limit);
        
        res.json({ message: 'Transaction successfully fetched', data: response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.countAsset = async (req, res) => {
    const { object, where, orderBy, limit } = req.body;
    try {
        let response = await queryTransaction(object, where, orderBy, limit);
        
        res.json({ message: 'Transaction Count: ', data: response.length});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAsset = async (req, res) => {
    const { object, where, orderBy, limit } = req.body;
    try {
        let response = await queryTransaction(object, where, orderBy, limit);
        let metadata = response[i].metadata
        metadata.deleted = true;
        let tx_list = [];

        for(const i in response)
            tx_list.push(await createTransaction(response[i].data, metadata));

        res.json({ message: 'Transaction successfully posted', transactionId: tx_list });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
