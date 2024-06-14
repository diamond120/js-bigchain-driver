const driver = require('bigchaindb-driver');
const conn = require('../config/bigchaindb');
const { query } = require('express');
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
            result[key] = Buffer.from(JSON.stringify([`${object['object']}.${key}`, object[key]])).toString('base64');
    }
    return result;
}

const json_decode = (object) => {
    let result = {}
    for(const key in object) {
        if(key == 'object')
            result[key] = JSON.parse(Buffer.from(object[key], 'base64').toString('utf8'))['object'];
        else
            result[key] = JSON.parse(Buffer.from(object[key], 'base64').toString('utf8'))[1];
    }
    return result;
}

const searchAssets = async (key, value) => {
    let timestamp = Date.now();
    let query;
    if(key == 'object') {
        query = Buffer.from(JSON.stringify({ object: value })).toString('base64')
    } else {
        query = Buffer.from(JSON.stringify([key, value])).toString('base64')
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

    console.log('Search Assets: ', Date.now() - timestamp);

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
            response[key['id']] = key;
    else {
        for(const key of array1)
            response[key['id']] = true;
        for(const key of array2)
            if(response[key['id']])
                response[key['id']] = key;
    }
    return Object.values(response).filter(item => typeof item === 'object');
}

const whereHandlers = {
    '==' : operand => value => Object.keys(operand).every(key => operand[key] == value[key]),
    'like' : operand => value => Object.keys(operand).every(key => value[key]?.includes(operand[key])),
    '!=' : operand => value => !(Object.keys(operand).every(key => operand[key] == value[key])),
    'in' : operand => value => Object.keys(operand).every(key => operand[key]?.includes(value[key])),
    '!in' : operand => value => !(Object.keys(operand).every(key => operand[key]?.includes(value[key]))),
    'between' : operand => value => Object.keys(operand).every(key => value[key] >= operand[key][0] && value[key] <= operand[key][1]),
}

const complexOperators = ['like', '!=', '!in', 'between'];

const querySolver = async (resource, where) => {
    if(!where) return resource
    if(where['operator']) {
        if(typeof resource == "object")
            return resource.filter(whereHandlers[where.operator](where.operand));

        switch(where['operator']) {
            case 'in':
                const [key, values] = Object.entries(where['operand'])[0];
                return await querySolver(resource, {
                    'connector': 'or',
                    'queries': values.map(value => ({
                        operator: '==',
                        operand: { [key]: value }
                    }))
                });

            case '==':
                const entries = Object.entries(where['operand']);
                const [field, value] = entries[0];
                const asset = await searchAssets(`${resource}.${field}`, value);

                if(entries.length == 1) return asset;
                
                return await querySolver(asset, {
                    connector: 'and',
                    queries: entries.slice(1).map(([key, value]) => ({
                        operator: '==',
                        operand: { [key]: value }
                    }))
                });       

            default:
                throw new Error('non booster detected');
        }
    }
    if(where['connector']) {
        const connector = where['connector'];
        let result = []
    
        // if(connector == 'or') {
            for(const query of where['queries']) {
                const asset = await querySolver(resource, query);

                if(!result.length) result = asset;
                else result = await arrayMerge(connector, result, asset);
            }
        // } else if(connector == 'and'){
        // }

        return result;
    }
    throw new Error('Where format incorrect');
}

const queryTransaction = async (table, join, where, orderBy, page, limit) => {
    let tx_list = []
    const whereString = typeof where == "object" ? JSON.stringify(where) : where;
    console.log("Where String: ", whereString)

   if(!where || complexOperators.some(item => whereString.includes(`{"operator":"${item}","operand":{`)))
        tx_list = await querySolver(await searchAssets('object', table), where);
   else 
        tx_list = await querySolver(table, where);


    if(!tx_list.length) return {
        data: tx_list
    }        

    if(orderBy && orderBy.length)
        tx_list.sort(orderByHandler(orderBy));

    let offset = 0, count = tx_list.length;
    if(page) 
        offset = page * limit;
    if(limit)
        tx_list = tx_list.slice(offset, offset+limit);

    return {
        data: tx_list,
        total: count
    };
}

module.exports = { createTransaction, getTransaction, searchMetadata, searchAssets, queryTransaction };