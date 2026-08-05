'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
  await fastify.register(require('@fastify/helmet'), {
    // Disable CSP if you serve Swagger UI from the same app.
    contentSecurityPolicy: process.env.CSP_ENABLED !== 'false',
  });
});
