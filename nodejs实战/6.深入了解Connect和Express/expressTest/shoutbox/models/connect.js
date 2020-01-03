const redis = require('redis');
const db = redis.createClient();

module.exports = db;