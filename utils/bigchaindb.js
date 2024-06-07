const driver = require('bigchaindb-driver');
const conn = require('../config/bigchaindb');
require('../config');

const createTransaction = async (data, metadata) => {
    try {
        const tx = driver.Transaction.makeCreateTransaction(
            data,
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

        console.log(response);
        let tx_list = [];

        for(const i in response) {
            if(!response[i].metadata.deleted) {
                const id = response[i].id;
                const tx = await getTransaction(id)
                console.log(tx)
                tx_list.push({
                    "id": tx.id,
                    "asset": tx.asset,
                    "metadata": tx.metadata,
                })
            }
        }

        return tx_list;
    } catch (error) {
        console.log(error);
        return "Error in Get Transactions For Table";
    }
}

const whereHandlers = {
    'is' : operand => value => Object.keys(operand).every(key => operand[key] == value.asset.data[key]),
    'not' : operand => value => !(Object.keys(operand).every(key => operand[key] == value.asset.data[key])),
    'in' : operand => value => Object.keys(operand).every(key => operand[key].includes(value.asset.data[key])),
    'notIn' : operand => value => !(Object.keys(operand).every(key => operand[key].includes(value.asset.data[key]))),
    'between' : operand => value => Object.keys(operand).every(key => value.asset.data[key] >= operand[key][0] && value.asset.data[key] <= operand[key][1]),
}

const orderByHandler = params => (a, b) => {
    for(const param in params) {
        if(a[param.key] > b[param.key])
            return param.order === 'ASC' ? 1 : -1;
        if(a[param.key] < b[param.key])
            return param.order === 'ASC' ? -1 : 1;
    }
    return 0;
}

const queryTransaction = async (table, where, orderBy, limit) => {
    try {
        let tx_list = await getTransactionsForTable(table);

        for(let i = 0; i < where.length; i ++)
            tx_list = tx_list.filter(whereHandlers[where[i].operator](where[i].operand));

        if(orderBy)
            tx_list.sort(orderByHandler(orderBy));
        if(limit)
            tx_list = tx_list.slice(0, limit);

        console.log(tx_list);

        return tx_list;
    } catch (error) {
        console.log(error);
        return "Error in Filter Transaction";
    }
}

module.exports = { createTransaction, getTransaction, searchMetadata, searchAssets, queryTransaction };