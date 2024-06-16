const { v4: uuidv4 } = require('uuid');
const { createTransaction, queryAsset, searchAssets } = require('../utils/bigchaindb');
const defaultValue = require('../config/default.json');

require('../config');

exports.createAsset = async (req, res) => {
    let { object, data } = req.body;
    
    // Check Request Type
    // if(typeof object != "string" || typeof data != "object") {
    //     res.json({ message: 'Request type Failed', data: {}});
    //     return;
    // }

    console.log("Create Asset Request: ", object, JSON.stringify(data))

    // Define Asset
    let asset = {
        'object': object,
        'id': uuidv4(),
        'created_at': Math.floor(Date.now() / 1000)
    };

    // Add Default Value
    asset = { ...defaultValue[object], ...data, ...asset }

    // Send Create Request
    const tx = await createTransaction(asset, null);

    res.json({ message: 'Success', data: tx});
};

exports.updateAsset = async (req, res) => {
    let { object, join, where, orderBy, page, limit, data } = req.body;

    if(typeof where == "string") where = JSON.parse(where);
    if(typeof page == "string") page = parseInt(page);
    if(typeof limit == "string") limit = parseInt(limit);
    if(typeof join == "string") join = JSON.parse(join);
    if(typeof data == "string") data = JSON.parse(data);

    // Check Request Type
    // if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number" || typeof data != "object") {
    //     res.json({ message: 'Request type Failed', data: {}});
    //     return;
    // }

    // if(orderBy == "ASC" || orderBy=="DESC") {
    //     res.json({ message: 'Order By should be ASC or DESC', data: {}});
    //     return;
    // }

    console.log("Update Asset Request: ", object, JSON.stringify(where), orderBy, limit, JSON.stringify(data))

    // Filter Transactions with condition
    let list = (await queryAsset(object, join, where, orderBy, page, limit)).data;

    for(const tx of list) {
        let asset = {};

        // Define Assets

        for(const key in tx)
            asset[key] = tx[key];
        asset['created_at'] = Math.floor(Date.now() / 1000);

        // Update data
        for(const key in data)
            asset[key] = data[key];

        // Send Create Request
        await createTransaction(asset, null);
    }

    res.json({ message: 'Success' });
};

exports.getAsset = async (req, res) => {
    let { object, where, orderBy, page, limit, join } = req.query;
    let timestamp = Date.now();
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof page == "string") page = parseInt(page);
    if(typeof limit == "string") limit = parseInt(limit);
    if(typeof join == "string") join = JSON.parse(join);
    // if(typeof offset == "string") offset = parseInt(offset);

    // Check Request Type
    // if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number") {
    //     res.json({ message: 'Request type Failed', data: {}});
    //     return;
    // }

    // if(orderBy == "ASC" || orderBy=="DESC") {
    //     res.json({ message: 'Order By should be ASC or DESC', data: {}});
    //     return;
    // }

    console.log("Get Asset Request: ", object, JSON.stringify(where), orderBy, limit)

    // Send Query Request
    let list = await queryAsset(object, join, where, orderBy, page, limit);
    let response = list

    if(!page)
        response = {
            data: list.data
        }

    console.log(Date.now() - timestamp);
    
    res.json({ message: 'Transaction successfully fetched', ...response });
};

exports.countAsset = async (req, res) => {
    let { object, join, where, orderBy, page, limit } = req.query;
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof page == "string") page = parseInt(page);
    if(typeof limit == "string") limit = parseInt(limit);
    if(typeof join == "string") join = JSON.parse(join);

    // Check Request Type
    // if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number") {
    //     res.json({ message: 'Request type Failed', data: {}});
    //     return;
    // }

    // if(orderBy == "ASC" || orderBy=="DESC") {
    //     res.json({ message: 'Order By should be ASC or DESC', data: {}});
    //     return;
    // }

    console.log("Count Asset Request: ", object, JSON.stringify(where), orderBy, limit)

    // Send Query Request
    let list = await queryAsset(object, join, where, orderBy, page, limit);
        
    res.json({ message: 'Transaction Count: ', data: list.data.length});
};

exports.sumAsset = async (req, res) => {
    let { object, join, where, orderBy, page, limit, column } = req.query;
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof page == "string") page = parseInt(page);
    if(typeof limit == "string") limit = parseInt(limit);
    if(typeof join == "string") join = JSON.parse(join);

    // Check Request Type
    // if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number" || typeof column != "string") {
    //     res.json({ message: 'Request type Failed', data: {}});
    //     return;
    // }

    // if(orderBy == "ASC" || orderBy=="DESC") {
    //     res.json({ message: 'Order By should be ASC or DESC', data: {}});
    //     return;
    // }

    console.log("Sum Asset Request: ", object, JSON.stringify(where), orderBy, limit, column)

    // Send Query Request
    let list = (await queryAsset(object, join, where, orderBy, page, limit)).data;

    // Sum Column data
    let sum = 0;
    for(const element of list)
        sum = sum + parseInt(element[column]);
    
    res.json({ message: 'Transaction Sum: ', data: sum});
};

exports.deleteAsset = async (req, res) => {
    let { object, join, where, orderBy, page, limit } = req.query;
    
    if(typeof where == "string") where = JSON.parse(where);
    if(typeof page == "string") page = parseInt(page);
    if(typeof limit == "string") limit = parseInt(limit);
    if(typeof join == "string") join = JSON.parse(join);

    // Check Request Type
    // if(typeof object != "string" || typeof where != "object" || typeof orderBy != "string" || typeof limit != "number") {
    //     res.json({ message: 'Request type Failed', data: {}});
    //     return;
    // }

    // if(orderBy == "ASC" || orderBy=="DESC") {
    //     res.json({ message: 'Order By should be ASC or DESC', data: {}});
    //     return;
    // }

    console.log("Delete Asset Request: ", object, JSON.stringify(where), orderBy, limit)

    // Send Query Request
    let list = (await queryAsset(object, join, where, orderBy, page, limit)).data;
    let tx_list = [];

    // Delete assets
    for(const element of list) { 
        tx_list.push(element.id);
        element['created_at'] = null;
        await createTransaction(element, null);
    }

    res.json({ message: 'Success', data: tx_list });
};
