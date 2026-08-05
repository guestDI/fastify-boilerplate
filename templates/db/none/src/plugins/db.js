'use strict';

const fp = require('fastify-plugin');

// Add the `fastify` argument back once you uncomment one of the examples below.
module.exports = fp(async () => {
  // TODO: configure your database connection here.
  // Example with @fastify/postgres:
  //   await fastify.register(require('@fastify/postgres'), { connectionString: process.env.DATABASE_URL });
  //
  // Example with @fastify/mongodb:
  //   await fastify.register(require('@fastify/mongodb'), { url: process.env.DATABASE_URL });
  //
  // Once registered, decorate the fastify instance if needed:
  //   fastify.decorate('db', fastify.pg);
});
