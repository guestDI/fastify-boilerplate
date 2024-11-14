#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const { exec } = require('child_process');
const inquirer = require('inquirer').default;

const program = new Command();
const TEMPLATE_DIR = path.join(__dirname, 'templates');
const APP_FILE_PATH = path.join(process.cwd(), 'src', 'app.js');

program
    .version('1.0.0')
    .description('CLI to create Fastify boilerplate structure');

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

async function createBoilerplate(projectDir, projectName, spinner) {
    await fs.copy(TEMPLATE_DIR, projectDir);

    spinner.text = `Creating Fastify project in ${projectDir}...`;

    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.scripts = {
        ...packageJson.scripts,
        lint: "eslint 'src/**/*.js'",
        format: "prettier --write 'src/**/*.js'",
        test: "jest",
        'test:watch': "jest --watch"
    };
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    spinner.succeed(`Project structure was created successfully`);

    spinner.text = 'Setting up automated testing...';
    await setupTesting(projectDir, spinner);

    await setupLinting(projectDir, spinner);
    await initializeGitRepo(projectDir, spinner);
    await promptForDockerfile(projectDir, spinner);
}

async function addRouteToAppJs(routeName) {
    const importStatement = `const ${routeName}Route = require('./routes/${routeName}');`;
    const registerStatement = `app.register(${routeName}Route, { prefix: '/${routeName}' });`;

    try {
        let appFileContent = await fs.readFile(APP_FILE_PATH, 'utf-8');

        // Check if the route is already imported
        if (!appFileContent.includes(importStatement)) {
            // Insert import at the top of the file
            const lines = appFileContent.split('\n');
            lines.splice(1, 0, importStatement); // Adds after first line

            // Add route registration
            const registerIndex = lines.findIndex(line => line.includes('//Routes registration'));
            if (registerIndex !== -1) {
                lines.splice(registerIndex+1, 0, registerStatement);
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

async function initializeGitRepo(projectDir, spinner) {
    return new Promise((resolve, reject) => {
        exec('git init', { cwd: projectDir }, (error, stdout, stderr) => {
            if (error) {
                spinner.fail('Failed to initialize Git repository');
                console.error('Error initializing Git:', stderr);
                reject(error);
            } else {
                spinner.succeed('Git repository initialized successfully');
                resolve();
            }
        });
    });
}

async function promptForDockerfile(projectDir, spinner) {
    const { createDockerfile } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'createDockerfile',
            message: 'Would you like to add a Dockerfile to your project? (default \'No\')',
            default: false,
        },
    ]);

    if (createDockerfile) {
        const dockerfileContent = `
# Use the official Node.js image as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port Fastify will use
EXPOSE 3000

# Command to run the Fastify server
CMD ["npm", "start"]
        `;

        await fs.writeFile(path.join(projectDir, 'Dockerfile'), dockerfileContent.trim(), 'utf-8');
        spinner.succeed('Dockerfile was created successfully');
    } else {
        spinner.info('Dockerfile generation was skipped');
    }
}

async function setupTesting(baseDir, spinner) {
    const jestConfig = {
        testEnvironment: 'node',
        coverageDirectory: 'coverage',
        coverageProvider: 'v8',
    };

    spinner.start(`Setup tests...`);
    spinner.text = 'Setup tests...';

    // Write Jest config file
    await fs.writeJson(path.join(baseDir, 'jest.config.json'), jestConfig, { spaces: 2 });

    // Create a sample test folder and example test file
    const testExamplePath = path.join(baseDir, 'tests/routes');
    await fs.ensureDir(testExamplePath);
    const exampleTestContent = `
const request = require('supertest');
const app = require('../src/app'); // Adjust path if necessary

beforeAll(async () => {
  await app.listen({ port: 3000 });
});

afterAll(async () => {
  await app.close();
});

describe('GET /about', () => {
  it('should return 200 and a message', async () => {
    const response = await request(app.server).get('/about');
    expect(response.statusCode).toBe(200);
  });
});
    `;
    await fs.writeFile(path.join(testExamplePath, 'aboutRoute.test.js'), exampleTestContent);
    spinner.succeed(`Test configuration is ready`);
    // await installTestingDependencies(baseDir, spinner);
}

async function installTestingDependencies(baseDir, spinner) {
    const { exec } = require('child_process');

    return new Promise((resolve, reject) => {
        exec('npm install jest supertest --save-dev', { cwd: baseDir }, (error, stdout, stderr) => {
            if (error) {
                spinner.fail(`Error installing Jest/Supertest dependencies:, ${stderr}`)
                reject(error);
            } else {
                spinner.succeed("Jest and Supertest installed successfully")
                resolve();
            }
        });
    });
}

async function setupLinting(baseDir, spinner) {
    spinner.start();
    spinner.text = `Setup linter and prettier...`;

    const eslintConfig = {
        env: {
            browser: true,
            commonjs: true,
            es2021: true,
            node: true,
        },
        extends: ['eslint:recommended', 'plugin:prettier/recommended'],
        parserOptions: {
            ecmaVersion: 12,
            sourceType: 'module',
        },
        rules: {},
    };

    const prettierConfig = {
        semi: true,
        singleQuote: true,
        printWidth: 80,
    };

    // Write ESLint and Prettier config files
    await fs.writeJson(path.join(baseDir, '.eslintrc.json'), eslintConfig, { spaces: 2 });
    await fs.writeJson(path.join(baseDir, '.prettierrc.json'), prettierConfig, { spaces: 2 });

    // Install ESLint and Prettier dependencies
    spinner.succeed(`Linter and prettier are ready`);
    // await installLintingDependencies(baseDir, spinner);
}

async function installLintingDependencies(baseDir, spinner) {
    const { exec } = require('child_process');

    return new Promise((resolve, reject) => {
        exec('npm install eslint prettier eslint-plugin-prettier eslint-config-prettier --save-dev', { cwd: baseDir }, (error, stdout, stderr) => {
            if (error) {
                spinner.fail(`Error installing ESLint/Prettier dependencies: ${stderr}`)
                reject(error);
            } else {
                spinner.succeed("ESLint and Prettier installed successfully")
                resolve();
            }
        });
    });
}


program.parse(process.argv);
