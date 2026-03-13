'use strict';

const fp = require('fastify-plugin');

const schema = {
    type: 'object',
    required: ['PORT'],
    properties: {
        PORT: { type: 'string', default: '3000' },
        DATABASE_URL: { type: 'string', default: '' },
        LOG_LEVEL: { type: 'string', default: 'info' },
    },
};

module.exports = fp(async (fastify) => {
    await fastify.register(require('@fastify/env'), {
        schema,
        dotenv: true,
    });
});
