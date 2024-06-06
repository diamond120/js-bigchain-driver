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
        let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}assets/?search=${query}`);
        let list = await response.json();

        return list;
    } catch (error) {
        console.log(error);
        return "Error in Search Assets";
    }
}

module.exports = { createTransaction, getTransaction, searchMetadata, searchAssets };