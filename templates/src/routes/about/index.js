async function aboutRoutes(fastify) {
    const { getAbout } = require('../../controllers/aboutController');
    fastify.get('/', getAbout);
    fastify.get('/about', getAbout);
}

module.exports = aboutRoutes;
