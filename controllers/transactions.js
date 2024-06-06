const driver = require('bigchaindb-driver');
const conn = require('../config/bigchaindb');
require('../config');

const alice = new driver.Ed25519Keypair();

exports.createTransaction = async (req, res) => {
    try {
        const tx = driver.Transaction.makeCreateTransaction(
            { city: 'Berlin, DE', temperature: 22, datetime: new Date().toString() },
            { what: 'My first BigchainDB transaction', data: 'Metadata' },
            [ driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(alice.publicKey))
            ],
            alice.publicKey
        );

        const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey);
        const retrievedTx = await conn.postTransactionCommit(txSigned);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionById = async (req, res) => {
    const { id } = req.params;
    try {
        let response = await fetch(`${process.env.BIGCHAINDB_SERVER_URL}transactions/${id}`);
        let tx = await response.json();
        res.json(tx);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createApiTransaction = async (req, res) => {
    try {
        const tx = driver.Transaction.makeCreateTransaction(
            { city: 'New York, US', temperature: 30, datetime: new Date().toString() },
            { what: 'My second BigchainDB transaction', data: 'Additional metadata' },
            [ driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(alice.publicKey))
            ],
            alice.publicKey
        );

        const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey);
        const retrievedTx = await conn.postTransactionCommit(txSigned);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
