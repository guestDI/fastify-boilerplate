async function aboutRoutes(fastify) {
    const { getAbout } = require('../../controllers/aboutController');
    fastify.get('/', getAbout);
}

module.exports = aboutRoutes;
