#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();
const TEMPLATE_DIR = path.join(__dirname, 'templates');
const APP_FILE_PATH = path.join(process.cwd(), 'src', 'app.js');

program
    .version('0.0.1')
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

program
    .command('route <routeName>')
    .description('Generate controller, route, model, and service for a new route')
    .action(async (routeName) => {
        try {
            const baseDir = process.cwd();

            // Define paths, creating a dedicated folder for the new route
            const routeDir = path.join(baseDir, 'src', 'routes', routeName);
            const controllerDir = path.join(baseDir, 'src', 'controllers');
            const modelDir = path.join(baseDir, 'src', 'models');
            const serviceDir = path.join(baseDir, 'src', 'services');

            // Ensure each directory exists
            await fs.ensureDir(routeDir);
            await fs.ensureDir(controllerDir);
            await fs.ensureDir(modelDir);
            await fs.ensureDir(serviceDir);

            // Define file paths and content
            const controllerPath = path.join(controllerDir, `${routeName}.js`);
            const modelPath = path.join(modelDir, `${routeName}.js`);
            const servicePath = path.join(serviceDir, `${routeName}.js`);
            const routePath = path.join(routeDir, 'index.js');

            const controllerContent = `// ${routeName} controller\nmodule.exports = { /* controller methods */ };`;
            const modelContent = `// ${routeName} model\nmodule.exports = { /* model schema */ };`;
            const serviceContent = `// ${routeName} service\nmodule.exports = { /* service methods */ };`;
            const routeContent = `// ${routeName} route\nmodule.exports = (fastify, options) => { /* route handler */ };`;

            // Write each file
            await fs.writeFile(controllerPath, controllerContent);
            await fs.writeFile(modelPath, modelContent);
            await fs.writeFile(servicePath, serviceContent);
            await fs.writeFile(routePath, routeContent);

            console.log(`Generated files for route: ${routeName}`);

            // Add route import and registration to app.js
            await addRouteToAppJs(routeName);

        } catch (error) {
            console.error('Error generating route files:', error);
        }
    });

async function createBoilerplate(projectDir, projectName) {
    await fs.copy(TEMPLATE_DIR, projectDir);

    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function addRouteToAppJs(routeName) {
    const importStatement = `const ${routeName}Route = require('./routes/${routeName}');\n`;
    const registerStatement = `  fastify.register(${routeName}Route, { prefix: '/${routeName}' });\n`;

    try {
        let appFileContent = await fs.readFile(APP_FILE_PATH, 'utf-8');

        // Check if the route is already imported
        if (!appFileContent.includes(importStatement)) {
            // Insert import at the top of the file
            const lines = appFileContent.split('\n');
            lines.splice(1, 0, importStatement); // Adds after first line

            // Add route registration
            const registerIndex = lines.findIndex(line => line.includes('fastify.register'));
            if (registerIndex !== -1) {
                lines.splice(registerIndex, 0, registerStatement);
            } else {
                // If no other routes registered, add at the end of app setup
                lines.push(registerStatement);
            }

            appFileContent = lines.join('\n');
            await fs.writeFile(APP_FILE_PATH, appFileContent, 'utf-8');

            console.log(`Route ${routeName} successfully added to app.js`);
        } else {
            console.log(`Route ${routeName} is already registered in app.js`);
        }
    } catch (error) {
        console.error('Error adding route to app.js:', error);
    }
}

program.parse(process.argv);
