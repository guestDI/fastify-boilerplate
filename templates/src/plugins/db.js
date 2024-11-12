const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
    fastify.decorate('db', {
        // DB setup (Sequelize, TypeORM и т.д.)
    });
});
