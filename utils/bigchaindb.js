const driver = require('bigchaindb-driver');
const conn = require('../config/bigchaindb');
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

const json_encode = (object) => {
    let result = {}
    for(const key in object) {
        if(key == 'object')
            result[key] = Buffer.from(JSON.stringify({ object: object['object'] })).toString('base64');
        else
            result[key] = JSON.stringify([`${object['object']}.${key}`, object[key]]);
    }
    return result;
}

const json_decode = (object) => {
    let result = {}
    for(const key in object) {
        if(key == 'object')
            result[key] = JSON.parse(Buffer.from(object[key], 'base64').toString('utf8'))['object'];
        else
            result[key] = JSON.parse(object[key])[1];
    }
    return result;
}

const searchAssets = async (key, value) => {
    let query;
    if(key == 'object') {
        query = Buffer.from(JSON.stringify({ object: value })).toString('base64')
    } else {
        query = JSON.stringify([key, value])
    }
    let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}assets/?search=${query}`);
    let list = await response.json();

    list = list.map(element => json_decode(element.data));
    
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

const orderByHandler = params => (a, b) => {
    for(const param of params) {
        if(a[param.key] > b[param.key])
            return param.order === 'ASC' ? 1 : -1;
        if(a[param.key] < b[param.key])
            return param.order === 'ASC' ? -1 : 1;
    }
    return 0;
}

const arrayMerge = async (connector, array1, array2) => {
    let response = {}
    const array = [...array1, ...array2]

    if(connector == "or")
        for(const key of array)
            response[key['id']] = array;
    else
        for(const key of array2)
            if(array1[key['id']])
                response[key['id']] = array2;
    return Object.values(response);
}

const whereHandlers = {
    '==' : operand => value => Object.keys(operand).every(key => operand[key] == value[key]),
    'like' : operand => value => Object.keys(operand).every(key => value[key]?.includes(operand[key])),
    '!=' : operand => value => !(Object.keys(operand).every(key => operand[key] == value[key])),
    'in' : operand => value => Object.keys(operand).every(key => operand[key]?.includes(value[key])),
    '!in' : operand => value => !(Object.keys(operand).every(key => operand[key]?.includes(value[key]))),
    'between' : operand => value => Object.keys(operand).every(key => value[key] >= operand[key][0] && value[key] <= operand[key][1]),
}

const querySolver = async (tx_list, where) => {
    if(where['operator'])
        return tx_list.filter(whereHandlers[where.operator](where.operand));
    else if(where['connector']) {
        const connector = where['connector'];
        let result = []
    
        for(const query of where['queries']) {
            const tx = await querySolver(tx_list, query);
    
            if(!result.length) result = tx;
            else result = await arrayMerge(connector, result, tx);
        }
        return result;
    }
    else {
        console.log('Query Solver format error');
    }
}

const queryTransaction = async (table, where, orderBy, limit) => {
    let tx_list
    // const isSpecial = JSON.stringify(where).includes('"!="') || JSON.stringify(where).includes('"!in"') || JSON.stringify(where).includes('"between"') || JSON.stringify(where).includes('"like"');
    // if(!where || isSpecial)
        tx_list = await searchAssets('object', table)

    if(!tx_list.length) return tx_list;

    if(where)
        tx_list = await querySolver(tx_list, where)

    if(orderBy && orderBy.length)
        tx_list.sort(orderByHandler(orderBy));
    if(limit)
        tx_list = tx_list.slice(0, limit);

    return tx_list;
}

module.exports = { createTransaction, getTransaction, searchMetadata, searchAssets, queryTransaction };