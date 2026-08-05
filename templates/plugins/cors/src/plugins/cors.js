'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
  const origin = process.env.CORS_ORIGIN || '*';

  await fastify.register(require('@fastify/cors'), {
    origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Credentials cannot be combined with a wildcard origin.
    credentials: origin !== '*',
  });

  if (origin === '*') {
    fastify.log.warn(
      'CORS_ORIGIN is "*" — set an explicit origin before going to production',
    );
  }
});
