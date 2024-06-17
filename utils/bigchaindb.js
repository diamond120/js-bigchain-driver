const driver = require('bigchaindb-driver');
const conn = require('../config/bigchaindb');
const { json_decode, json_encode } = require('./basic');
require('../config');

const createTransaction = async (asset, metadata) => {
    const tx = driver.Transaction.makeCreateTransaction(
        json_encode(asset),
        metadata,
        [ driver.Transaction.makeOutput(
                driver.Transaction.makeEd25519Condition(process.env.PUBLIC_KEY))
        ],
        process.env.PUBLIC_KEY
    );

    const txSigned = driver.Transaction.signTransaction(tx, process.env.PRIVATE_KEY);
    const retrievedTx = await conn.postTransactionCommit(txSigned);

    return json_decode(retrievedTx.asset.data);
}

const getTransaction = async (id) => {
    let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}transactions/${id}`);
    let tx = await response.json();

    return tx;
}

const searchMetadata = async (query) => {
    let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}metadata/?search=${query}`);
    let list = await response.json();

    return list;
}


const searchAssets = async (key, value) => {
    // Encode Data
    let query;
    if(key == 'object') {
        query = Buffer.from(JSON.stringify({ object: value })).toString('base64')
    } else {
        query = Buffer.from(JSON.stringify([key, value])).toString('base64')
    }

    // Send Request
    let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}assets/?search=${query}`);
    let list = await response.json();

    list = list.map(element => json_decode(element.data));
    
    // Decode Data
    let result = {}, blacklist = [];

    for(const element of list)
        if(element.created_at == null)
            blacklist.push(element.id)
        
    for(const element of list) {
        if(!blacklist.includes(element.id)) {
            if(!result[element.id] || result[element.id].created_at < element.created_at)
                result[element.id] = element
        }
    }

    return Object.values(result);
}


module.exports = { createTransaction, getTransaction, searchMetadata, searchAssets };