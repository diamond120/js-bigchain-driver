const driver = require('bigchaindb-driver');

const API_PATH = 'http://172.104.249.201:9984/api/v1/';
const conn = new driver.Connection(API_PATH);

module.exports = conn;
