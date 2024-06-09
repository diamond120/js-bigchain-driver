const { v4: uuidv4 } = require('uuid');
const { createTransaction, queryTransaction } = require('../utils/bigchaindb');
require('../config');

exports.createAsset = async (req, res) => {
    const { object, data } = req.body;
    try {
        console.log("Create Asset Request: ", object, data)
        let metadata = {
            "object": object,
        };
        if(data['id']) {
            metadata['id'] = data['id']
            delete data['id'];
        }
        else
            metadata['id'] = uuidv4();
        
        if(data['created_at']) {
            metadata['created_at'] = data['created_at']
            delete data['created_at'];
        }
        else
            metadata['created_at'] = Math.floor(Date.now() / 1000);

        const tx = await createTransaction(data, metadata);
        console.log(tx.id);

        res.json({ message: 'Success', data: {
            ...tx.asset.data,
            ...tx.metadata
        }});
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
};

exports.updateAsset = async (req, res) => {
    const { object, where, orderBy, limit, data } = req.body;
    try {
        console.log("Update Asset Request: ", object, where, orderBy, limit, data)
        let response = await queryTransaction(object, where, orderBy, limit);

        for(const i in response) {
            let metadata = {
                "object": response[i].object,
                "id": response[i].id
            };
            let asset = {}

            for(const key in response[i])
                if(key != "object" && key != "id" && key != "created_at")
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
        console.log("Get Asset Request: ", object, where, orderBy, limit)

        if(limit) limit = parseInt(limit);
        let response = await queryTransaction(object, where, orderBy, limit);
        
        res.json({ message: 'Transaction successfully fetched', data: response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.countAsset = async (req, res) => {
    let { object, where, orderBy, limit } = req.query;
    try {
        console.log("Count Asset Request: ", object, where, orderBy, limit)

        if(limit) limit = parseInt(limit)
        let response = await queryTransaction(object, where, orderBy, limit);
        
        res.json({ message: 'Transaction Count: ', data: response.length});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sumAsset = async (req, res) => {
    let { object, where, orderBy, limit, column } = req.query;
    try {
        console.log("Sum Asset Request: ", object, where, orderBy, limit, column)

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
        console.log("Delete Asset Request: ", object, where, orderBy, limit)
        let response = await queryTransaction(object, where, orderBy, limit);

        for(const i in response) {
            let metadata = {
                "object": response[i].object,
                "id": response[i].id
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
