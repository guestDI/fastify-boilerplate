#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

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

            await createBoilerplate(projectDir, projectName);
            console.log('Project structure created successfully!');
        } catch (error) {
            console.error('Error creating project:', error);
        }
    });

async function createBoilerplate(projectDir, projectName) {
    await fs.copy(TEMPLATE_DIR, projectDir);

    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

program.parse(process.argv);
