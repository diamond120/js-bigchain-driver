const express = require('express');
const app = express();

const transactionsRoutes = require('./routes/transactions');
const assetsRoutes = require('./routes/assets');
const metadataRoutes = require('./routes/metadata');

app.use('/transactions', transactionsRoutes);
app.use('/assets', assetsRoutes);
app.use('/metadata', metadataRoutes);

const PORT = 2466;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});