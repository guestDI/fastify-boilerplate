const buildFastify = require('../src/app');

let fastify;

async function setup() {
    fastify = buildFastify();
    await fastify.ready();
}

async function teardown() {
    await fastify.close();
}

module.exports = { setup, teardown };
