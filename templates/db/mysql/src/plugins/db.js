'use strict';

const fp = require('fastify-plugin');
const mysql = require('mysql2/promise');

module.exports = fp(async (fastify) => {
    if (!process.env.DATABASE_URL) {
        fastify.log.warn('DATABASE_URL is not set — skipping MySQL connection');
        return;
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    fastify.decorate('db', connection);

    fastify.addHook('onClose', async () => {
        await connection.end();
    });
});
