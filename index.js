#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');

const program = new Command();
const TEMPLATE_DIR = path.join(__dirname, 'templates');

program
    .version('1.0.0')
    .description('CLI to create Fastify boilerplate structure');

program
    .command('create <projectName>')
    .description('Create a new Fastify project')
    .action(async (projectName) => {
        try {
            const projectDir = path.resolve(process.cwd(), projectName);
            await fs.ensureDir(projectDir);

            console.log(`Creating Fastify project in ${projectDir}`);

            await createBoilerplate(projectDir);
            console.log('Project structure created successfully!');
        } catch (error) {
            console.error('Error creating project:', error);
        }
    });

async function createBoilerplate(projectDir) {
    await fs.copy(TEMPLATE_DIR, projectDir);

    //Any additional setup
}

program.parse(process.argv);
