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

        // console.log(object, data)

        const tx = await createTransaction(data, metadata);
        console.log(tx.id);

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

            await createTransaction(asset, metadata);
        }

        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
};

exports.getAsset = async (req, res) => {
    let { object, where, orderBy, limit } = req.query;
    try {
        limit = parseInt(limit);
        console.log(object, where, orderBy, limit);

        let response = await queryTransaction(object, where, orderBy, limit);
        
        res.json({ message: 'Transaction successfully fetched', data: response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.countAsset = async (req, res) => {
    let { object, where, orderBy, limit } = req.query;
    try {
        limit = parseInt(limit)
        let response = await queryTransaction(object, where, orderBy, limit);
        
        res.json({ message: 'Transaction Count: ', data: response.length});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sumAsset = async (req, res) => {
    let { object, where, orderBy, limit, column } = req.query;
    try {
        limit = parseInt(limit)
        let response = await queryTransaction(object, where, orderBy, limit);

        let sum = 0;
        for(const element of response)
            sum = sum + parseInt(element[column]);
        
        res.json({ message: 'Transaction Count: ', data: sum});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAsset = async (req, res) => {
    const { object, where, orderBy, limit } = req.query;
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
