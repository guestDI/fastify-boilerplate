const fp = require('fastify-plugin');
// const pgp = require('pg-promise')();

module.exports = fp(async (fastify, opts) => {
    // Set up database connection options

    /*
        const dbConfig = {
             host: process.env.DB_HOST || 'localhost',
             port: process.env.DB_PORT || 5432,
             database: process.env.DB_NAME || 'mydatabase',
             user: process.env.DB_USER || 'user',
             password: process.env.DB_PASSWORD || 'password',
         };

     */

    // Initialize the connection
    /* const db = pgp(dbConfig); */

    // Add the db connection to Fastify instance
    /* fastify.decorate('db', db); */

    // Test the connection on startup
    /*
        try {
            await db.connect();
            fastify.log.info('Database connected successfully');
        } catch (error) {
            fastify.log.error('Failed to connect to the database:', error);
            throw error;
        }
    */

    // Close the connection when the Fastify server stops
    /*
        fastify.addHook('onClose', (fastifyInstance, done) => {
            pgp.end(); // Closes all active connections
            done();
        });
     */
});
