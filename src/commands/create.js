'use strict';

const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');
const { createBoilerplate } = require('../generators/boilerplate');

function registerCreateCommand(program) {
  program
    .command('create <projectName>')
    .description('Create a new Fastify project')
    .action(async (projectName) => {
      const spinner = ora().start('Setting up project...');
      try {
        const projectDir = path.resolve(process.cwd(), projectName);
        await fs.ensureDir(projectDir);
        await createBoilerplate(projectDir, projectName, spinner);
      } catch (error) {
        spinner.fail('Error creating project');
        console.error('Error creating project:', error);
      }
    });
}

module.exports = { registerCreateCommand };
