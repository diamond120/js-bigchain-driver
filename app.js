const express = require('express');

require('./config');

const app = express();

const transactionsRoutes = require('./routes/transactions');
const assetsRoutes = require('./routes/assets');
const metadataRoutes = require('./routes/metadata');

app.use('api/transactions', transactionsRoutes);
app.use('api/assets', assetsRoutes);
app.use('api/metadata', metadataRoutes);

const PORT = process.env.SERVER_PORT || 2466;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});