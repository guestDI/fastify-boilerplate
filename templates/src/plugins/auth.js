const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    fastify.decorate('authenticate', async (request, reply) => {
        // User auth
    });
});
