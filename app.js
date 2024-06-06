const express = require('express');
const bodyParser = require('body-parser')

require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const transactionsRoutes = require('./routes/api/transactions');
const assetsRoutes = require('./routes/api/assets');
const metadataRoutes = require('./routes/api/metadata');
const bigchaindbRoutes = require('./routes/bigchaindb');

app.use('/api/transactions', transactionsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/metadata', metadataRoutes);

app.use('/bigchaindb', bigchaindbRoutes)

const PORT = process.env.SERVER_PORT || 2466;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});