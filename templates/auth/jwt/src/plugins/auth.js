'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    await fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET || 'changeme-use-env-var-in-production',
    });

    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
});
