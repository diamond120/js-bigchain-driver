const express = require('express')
const driver = require('bigchaindb-driver')
const base58 = require('bs58');
const crypto = require('crypto');
const { Ed25519Sha256 } = require('crypto-conditions');
require('./config')

const app = express();

const API_PATH = process.env.BIGCHAINDB_SERVER_URL
const alice = new driver.Ed25519Keypair()

const conn = new driver.Connection(API_PATH)

app.post('/transactions', async (req, res) => {
    try {
        const tx = driver.Transaction.makeCreateTransaction(
            { city: 'Berlin, DE', temperature: 22, datetime: new Date().toString() },
            { what: 'My first BigchainDB transaction', data: 'Metadata' },
            [ driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(alice.publicKey))
            ],
            alice.publicKey
        )
        
        const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)
        
        // function signTransaction() {
        //     const privateKeyBuffer = Buffer.from(base58.decode(alice.privateKey))
        //     return function sign(serializedTransaction, input, index) {
        //         const transactionUniqueFulfillment = input.fulfills ? serializedTransaction
        //                 .concat(input.fulfills.transaction_id)
        //                 .concat(input.fulfills.output_index) : serializedTransaction
        //         const transactionHash = crypto.createHash('sha3-256').update(transactionUniqueFulfillment).digest()
        //         const ed25519Fulfillment = new Ed25519Sha256();
        //         ed25519Fulfillment.sign(transactionHash, privateKeyBuffer);
        //         return ed25519Fulfillment.serializeUri();
        //     };
        // }
        
        // const txdSigned = driver.Transaction.delegateSignTransaction(tx, signTransaction())

        const retrievedTx = await conn.postTransactionCommit(txSigned);

        res.json({ message: 'Transaction successfully posted', transactionId: retrievedTx.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let response = await fetch(`${API_PATH}transactions/${id}`);
        let tx = await response.json();
        res.json(tx);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Express route to search for assets
app.get('/assets/:query', async (req, res) => {
    const { query } = req.params;
    try {
        let response = await fetch(`${API_PATH}assets/?search=${query}`);
        let list = await response.json();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Express route to search for assets
app.get('/metadata/:query', async (req, res) => {
    const { query } = req.params;
    try {
        let response = await fetch(`${API_PATH}metadata/?search=${query}`);
        let list = await response.json();
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = 4000;
// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
