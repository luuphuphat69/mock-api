const Redis = require('ioredis')
require('dotenv').config();

const redis = new Redis({
    host: process.env.VALKEY_HOST || 'localhost',
    port: 6379,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
})

redis.on('error', (err) => {
    console.error('Valkey Client Error:', err);
});

redis.on('connect', () => {
    console.log('Connected to Valkey/Redis');
});

module.exports = redis