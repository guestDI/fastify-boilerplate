const { test } = require('tap');
const buildFastify = require('../../src/app'); // assuming app.js exports a function to create Fastify instance

test('GET /about: should return about info', async (t) => {
    const fastify = buildFastify();
    await fastify.ready();

    const response = await fastify.inject({
        method: 'GET',
        url: '/about',
    });

    t.equal(response.statusCode, 200, 'returns a status code of 200');
    t.end();
});
