'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
  // No auth strategy selected: `authenticate` is a no-op, so any route using it
  // as a preHandler is PUBLIC. Implement the check here before relying on it.
  fastify.decorate('authenticate', async () => {});
});
