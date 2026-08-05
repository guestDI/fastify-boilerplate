'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not set — refusing to start with an insecure default',
    );
  }

  await fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET,
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
