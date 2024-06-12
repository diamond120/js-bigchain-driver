const { v4: uuidv4 } = require('uuid');
const { createTransaction, queryTransaction } = require('../utils/bigchaindb');
const defaultValue = require('../config/default.json');

require('../config');

exports.createAsset = async (req, res) => {
    let { object, data } = req.body;
    
    // Check Request Type
    if(typeof object != "string" || typeof data != "object")
        res.json({ message: 'Request type Failed', data: {}});

    console.log("Create Asset Request: ", object, JSON.stringify(data))

    // Define Metadata
    let metadata = {
        "object": object,
    };
    metadata['id'] = uuidv4();
    metadata['created_at'] = Math.floor(Date.now() / 1000);

    // Add Default Value
    data = { ...data, ...defaultValue[object] }

    // Send Create Request
    const tx = await createTransaction(data, metadata);
    console.log(tx.id);

    res.json({ message: 'Success', data: {
        ...tx.asset.data,
        ...tx.metadata
    }});
};

exports.updateAsset = async (req, res) => {
    let { object, where, orderBy, limit, data } = req.body;
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof limit == "string") limit = parseInt(limit);

    // Check Request Type
    if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number" || typeof data != "object")
        res.json({ message: 'Request type Failed', data: {}});

    if(orderBy == "ASC" || orderBy=="DESC")
        res.json({ message: 'Order By should be ASC or DESC', data: {}});

    console.log("Update Asset Request: ", object, JSON.stringify(where), orderBy, limit, JSON.stringify(data))

    // Filter Transactions with condition
    let list = await queryTransaction(object, where, orderBy, limit);

    for(const tx of list) {
        let metadata = {}, asset = {};

        // Define Assets & Metadata
        metadata['created_at'] = Math.floor(Date.now() / 1000);

        for(const key in tx) {
            if(key == "object" || key == "id" || key == "created_at")
                metadata[key] = tx[key];
            else
                asset[key] = tx[key];
        }

        // Update data
        for(const key in data)
            asset[key] = data[key];

        // Send Create Request
        await createTransaction(asset, metadata);
    }

    res.json({ message: 'Success' });
};

exports.getAsset = async (req, res) => {
    let { object, where, orderBy, limit } = req.query;
    // let timestamp = Date.now();
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof limit == "string") limit = parseInt(limit);
    if(typeof offset == "string") offset = parseInt(offset);

    // Check Request Type
    if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number")
        res.json({ message: 'Request type Failed', data: {}});

    if(orderBy == "ASC" || orderBy=="DESC")
        res.json({ message: 'Order By should be ASC or DESC', data: {}});

    console.log("Get Asset Request: ", object, JSON.stringify(where), orderBy, limit)

    // Send Query Request
    let list = await queryTransaction(object, where, orderBy, limit);

    // console.log(Date.now() - timestamp);
    
    res.json({ message: 'Transaction successfully fetched', data: list });
};

exports.countAsset = async (req, res) => {
    let { object, where, orderBy, limit } = req.query;
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof limit == "string") limit = parseInt(limit);

    // Check Request Type
    if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number")
        res.json({ message: 'Request type Failed', data: {}});

    if(orderBy == "ASC" || orderBy=="DESC")
        res.json({ message: 'Order By should be ASC or DESC', data: {}});

    console.log("Count Asset Request: ", object, JSON.stringify(where), orderBy, limit)

    // Send Query Request
    let list = await queryTransaction(object, where, orderBy, limit);
        
    res.json({ message: 'Transaction Count: ', data: list.length});
};

exports.sumAsset = async (req, res) => {
    let { object, where, orderBy, limit, column } = req.query;
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof limit == "string") limit = parseInt(limit);

    // Check Request Type
    if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number" || typeof column != "string")
        res.json({ message: 'Request type Failed', data: {}});

    if(orderBy == "ASC" || orderBy=="DESC")
        res.json({ message: 'Order By should be ASC or DESC', data: {}});

    console.log("Sum Asset Request: ", object, JSON.stringify(where), orderBy, limit, column)

    // Send Query Request
    let list = await queryTransaction(object, where, orderBy, limit);

    // Sum Column data
    let sum = 0;
    for(const element of list)
        sum = sum + parseInt(element[column]);
    
    res.json({ message: 'Transaction Count: ', data: sum});
};

exports.deleteAsset = async (req, res) => {
    let { object, where, orderBy, limit } = req.query;
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof limit == "string") limit = parseInt(limit);

    // Check Request Type
    if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number")
        res.json({ message: 'Request type Failed', data: {}});

    if(orderBy == "ASC" || orderBy=="DESC")
        res.json({ message: 'Order By should be ASC or DESC', data: {}});

    console.log("Delete Asset Request: ", object, JSON.stringify(where), orderBy, limit)

    // Send Query Request
    let list = await queryTransaction(object, where, orderBy, limit);

    // Delete assets
    for(const element of list) {
        let metadata = {
            "object": element.object,
            "id": element.id
        };
        metadata['created_at'] = null;
        await createTransaction(null, metadata);
    }

    res.json({ message: 'Success' });
};
