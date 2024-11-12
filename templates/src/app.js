const fastify = require('fastify')({ logger: true });

fastify.register(require('./plugins/db'));
fastify.register(require('./plugins/auth'));
fastify.register(require('./routes/about'));

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Server is running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
