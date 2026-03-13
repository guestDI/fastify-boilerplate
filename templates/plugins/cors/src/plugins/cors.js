'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    await fastify.register(require('@fastify/cors'), {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });
});
