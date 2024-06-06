const driver = require('bigchaindb-driver');
require('../config');

const conn = new driver.Connection(process.env.BIGCHAINDB_SERVER_URL);

module.exports = conn;
