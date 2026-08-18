require('dotenv').config();

jest.setTimeout(30000);

process.env.NODE_ENV = 'test';
process.env.APP_ENV = 'test';

// Clean up Redis connection after all tests (in case it was enabled)
afterAll(async () => {
    try {
        const redisClient = require('../cache');
        if (redisClient) {
            await redisClient.quit();
        }
    } catch (error) {
        console.error('Error closing Redis connection:', error);
    }
});