'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    fastify.decorate('authenticate', async (request, reply) => {
        const apiKey = request.headers['x-api-key'];
        if (!apiKey || apiKey !== process.env.API_KEY) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
});
