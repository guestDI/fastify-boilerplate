'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    await fastify.register(require('@fastify/rate-limit'), {
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
    });
});
