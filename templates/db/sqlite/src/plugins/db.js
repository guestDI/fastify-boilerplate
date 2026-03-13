'use strict';

const fp = require('fastify-plugin');
const Database = require('better-sqlite3');

module.exports = fp(async (fastify) => {
    const dbPath = process.env.DATABASE_PATH || 'database.sqlite';

    const db = new Database(dbPath);

    fastify.decorate('db', db);

    fastify.addHook('onClose', () => {
        db.close();
    });
});
