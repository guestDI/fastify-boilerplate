'use strict';

async function healthRoutes(fastify) {
    fastify.get('/', async () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
    }));
}

module.exports = healthRoutes;
