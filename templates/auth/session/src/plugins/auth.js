'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    await fastify.register(require('@fastify/session'), {
        secret: process.env.SESSION_SECRET || 'changeme-use-at-least-32-characters',
        cookie: { secure: process.env.NODE_ENV === 'production' },
    });

    fastify.decorate('authenticate', async (request, reply) => {
        if (!request.session.user) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
});
