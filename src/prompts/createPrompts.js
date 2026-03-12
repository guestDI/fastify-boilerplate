'use strict';

const inquirer = require('inquirer').default;

async function promptCreateOptions() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'db',
      message: 'Select a database:',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'PostgreSQL  (@fastify/postgres)', value: 'postgres' },
        { name: 'MySQL       (mysql2)', value: 'mysql' },
        { name: 'MongoDB     (@fastify/mongodb)', value: 'mongodb' },
        { name: 'SQLite      (better-sqlite3)', value: 'sqlite' },
      ],
      default: 'none',
    },
    {
      type: 'list',
      name: 'auth',
      message: 'Select an auth strategy:',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'JWT        (@fastify/jwt)', value: 'jwt' },
        { name: 'Session    (@fastify/session)', value: 'session' },
        { name: 'API Key    (custom x-api-key header)', value: 'apikey' },
      ],
      default: 'none',
    },
    {
      type: 'checkbox',
      name: 'plugins',
      message: 'Select optional plugins:',
      choices: [
        { name: 'CORS                (@fastify/cors)', value: 'cors' },
        { name: 'Rate Limiting       (@fastify/rate-limit)', value: 'ratelimit' },
        { name: 'Swagger / OpenAPI   (@fastify/swagger)', value: 'swagger' },
        { name: 'Env Validation      (@fastify/env)', value: 'env' },
      ],
    },
    {
      type: 'confirm',
      name: 'createDockerfile',
      message: 'Add a Dockerfile?',
      default: false,
    },
  ]);
}

module.exports = { promptCreateOptions };
