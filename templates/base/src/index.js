'use strict';

const buildApp = require('./app');
const config = require('./config');

const start = async () => {
  const app = buildApp();

  // Containers stop with SIGTERM: drain in-flight requests before exiting.
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      app.log.info(`${signal} received, shutting down`);
      await app.close();
      process.exit(0);
    });
  }

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
