'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    if (!process.env.DATABASE_URL) {
        fastify.log.warn('DATABASE_URL is not set — skipping PostgreSQL connection');
        return;
    }

    await fastify.register(require('@fastify/postgres'), {
        connectionString: process.env.DATABASE_URL,
    });
});
