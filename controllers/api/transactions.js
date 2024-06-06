const driver = require('bigchaindb-driver');
const conn = require('../../config/bigchaindb');
require('../../config');

exports.createTransaction = async (req, res) => {
    const { data, metadata } = req.params;
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