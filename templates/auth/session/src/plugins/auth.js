'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      'SESSION_SECRET is not set or is shorter than 32 characters',
    );
  }

  // @fastify/session needs a cookie plugin registered before it.
  await fastify.register(require('@fastify/cookie'));
  await fastify.register(require('@fastify/session'), {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  });

  fastify.decorate('authenticate', async (request, reply) => {
    if (!request.session.user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
