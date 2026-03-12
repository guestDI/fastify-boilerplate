#!/usr/bin/env node

'use strict';

const { Command } = require('commander');
const { version } = require('./package.json');
const { registerCreateCommand } = require('./src/commands/create');
const { registerRouteCommand } = require('./src/commands/route');

const program = new Command();

program
  .version(version)
  .description('CLI to create Fastify boilerplate structure');

registerCreateCommand(program);
registerRouteCommand(program);

program.parse(process.argv);
