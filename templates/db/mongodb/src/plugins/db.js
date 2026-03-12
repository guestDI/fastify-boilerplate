'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    if (!process.env.DATABASE_URL) {
        fastify.log.warn('DATABASE_URL is not set — skipping MongoDB connection');
        return;
    }

    await fastify.register(require('@fastify/mongodb'), {
        url: process.env.DATABASE_URL,
    });
});
