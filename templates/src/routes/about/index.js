async function aboutRoutes(fastify) {
    const { getUsers, createUser } = require('../../controllers/userController');
    fastify.get('/about', getAbout);
}

module.exports = aboutRoutes;
