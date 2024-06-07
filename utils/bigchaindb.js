const driver = require('bigchaindb-driver');
const conn = require('../config/bigchaindb');
require('../config');

const createTransaction = async (asset, metadata) => {
    try {
        const tx = driver.Transaction.makeCreateTransaction(
            asset,
            metadata,
            [ driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(process.env.PUBLIC_KEY))
            ],
            process.env.PUBLIC_KEY
        );
    
        const txSigned = driver.Transaction.signTransaction(tx, process.env.PRIVATE_KEY);
        const retrievedTx = await conn.postTransactionCommit(txSigned);
    
        return retrievedTx;
    } catch (error) {
        console.log(error);
        return "Error in Create Transaction";
    }
}

const getTransaction = async (id) => {
    try {
        let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}transactions/${id}`);
        let tx = await response.json();

        return tx;
    } catch (error) {
        console.log(error);
        return "Error in Get Transaction";
    }
}

const searchMetadata = async (query) => {
    try {
        let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}metadata/?search=${query}`);
        let list = await response.json();

        return list;
    } catch (error) {
        console.log(error);
        return "Error in Search Metadata";
    }
}

const searchAssets = async (query) => {
    try {
        let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}assets/?search=${{ $text: { $search: "Berlin" } }}`);
        let list = await response.json();

        return list;
    } catch (error) {
        console.log(error);
        return "Error in Search Assets";
    }
}

const getTransactionsForTable = async (table) => {
    try {
        const response = await searchMetadata(table);

        let tx_list = {};
        let blacklist = [];

        for(const i in response)
            if(response[i].metadata.deleted)
                blacklist.push(response[i].metadata.uid);

        for(const i in response) {
            if(!response[i].metadata.deleted && !blacklist.includes(response[i].metadata.uid)) {
                const id = response[i].id;
                const tx = await getTransaction(id);

                if(!tx_list[response[i].metadata.uid] || tx_list[response[i].metadata.uid].created_at < response[i].metadata.created_at)
                    tx_list[response[i].metadata.uid] = {
                        ...tx.asset.data,
                        ...tx.metadata,
                    }
            }
        }

        let result = [];
        for(const i in tx_list)
            result.push(tx_list[i])

        return result;
    } catch (error) {
        console.log(error);
        return "Error in Get Transactions For Table";
    }
}

const whereHandlers = {
    '==' : operand => value => Object.keys(operand).every(key => operand[key] == value[key]),
    'like' : operand => value => Object.keys(operand).every(key => value[key].includes(operand[key])),
    '!=' : operand => value => !(Object.keys(operand).every(key => operand[key] == value[key])),
    'in' : operand => value => Object.keys(operand).every(key => operand[key].includes(value[key])),
    '!in' : operand => value => !(Object.keys(operand).every(key => operand[key].includes(value[key]))),
    'between' : operand => value => Object.keys(operand).every(key => value[key] >= operand[key][0] && value[key] <= operand[key][1]),
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
            response[key['uid']] = array;
    else
        for(const key of array2)
            if(array1[key['uid']])
                response[key['uid']] = array2;
    return response;
}

const querySolver = async (tx_list, where) => {
    console.log(tx_list)
    if(where['operator'])
        return tx_list.filter(whereHandlers[where.operator](where.operand));

    const connector = where['connector'];
    let result = []

    for(const query of where['queries']) {
        const tx = await querySolver(tx_list, query);

        if(!result.length) result = tx;
        else result = await arrayMerge(connector, result, tx);
    }
    return result;
}

const queryTransaction = async (table, where, orderBy, limit) => {
    try {
        let tx_list = await getTransactionsForTable(table);

        if(where)
            tx_list = await querySolver(tx_list, where);
        if(orderBy && orderBy.length)
            tx_list.sort(orderByHandler(orderBy));
        if(limit)
            tx_list = tx_list.slice(0, limit);

        return tx_list;
    } catch (error) {
        console.log(error);
        return "Error in Filter Transaction";
    }
}

module.exports = { createTransaction, getTransaction, searchMetadata, searchAssets, queryTransaction };