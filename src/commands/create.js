'use strict';

const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');
const { promptCreateOptions } = require('../prompts/createPrompts');
const { createBoilerplate } = require('../generators/boilerplate');
const { validateProjectName } = require('../utils/validateName');

function registerCreateCommand(program) {
  program
    .command('create <projectName>')
    .description('Create a new Fastify project')
    .action(async (projectName) => {
      const spinner = ora();
      try {
        validateProjectName(projectName);

        const choices = await promptCreateOptions();

        spinner.start('Setting up project...');
        const projectDir = path.resolve(process.cwd(), projectName);
        await fs.ensureDir(projectDir);
        await createBoilerplate(projectDir, projectName, choices, spinner);
      } catch (error) {
        spinner.fail('Error creating project');
        console.error('Error creating project:', error.message);
        process.exitCode = 1;
      }
    });
}

module.exports = { registerCreateCommand };
