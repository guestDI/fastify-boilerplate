const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
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
