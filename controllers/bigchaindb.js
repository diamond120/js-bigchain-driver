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
        metadata['created_at'] = Math.floor(Date.now() / 1000);

        await createTransaction(data, metadata);

        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
};

exports.updateAsset = async (req, res) => {
    const { object, where, orderBy, limit, data } = req.body;
    try {
        let response = await queryTransaction(object, where, orderBy, limit);

        for(const i in response) {
            let metadata = {
                "object": response[i].object,
                "uid": response[i].uid
            };
            let asset = {}

            for(const key in response[i])
                if(key != "object" && key != "uid" && key != "created_at")
                    asset[key] = response[i][key];

            metadata['created_at'] = Math.floor(Date.now() / 1000);

            for(const key in data)
                asset[key] = data[key];
            // Add Update logic here

            tx = await createTransaction(asset, metadata);
            tx_list.push(tx);
        }

        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
};

exports.getAsset = async (req, res) => {
    const { object, where, orderBy, limit } = req.body;
    try {
        console.log(req.body);
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

        for(const i in response) {
            let metadata = {
                "object": response[i].object,
                "uid": response[i].uid
            };
            metadata["deleted"] = true;
            metadata['created_at'] = Math.floor(Date.now() / 1000);
            await createTransaction(null, metadata);
        }

        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
