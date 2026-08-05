'use strict';

const crypto = require('crypto');
const fp = require('fastify-plugin');

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

module.exports = fp(async (fastify) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY is not set — refusing to start');
  }

  fastify.decorate('authenticate', async (request, reply) => {
    const provided = request.headers['x-api-key'];
    if (typeof provided !== 'string' || !safeEqual(provided, apiKey)) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
