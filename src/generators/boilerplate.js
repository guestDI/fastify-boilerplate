'use strict';

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer').default;
const { initializeGitRepo } = require('../utils/git');

const TEMPLATE_DIR = path.join(__dirname, '..', '..', 'templates');

async function createBoilerplate(projectDir, projectName, spinner) {
  await fs.copy(TEMPLATE_DIR, projectDir);

  spinner.text = `Creating Fastify project in ${projectDir}...`;

  await updatePackageJson(projectDir, projectName);
  spinner.succeed('Project structure created successfully');

  await setupTesting(projectDir, spinner);
  await setupLinting(projectDir, spinner);
  await initializeGitRepo(projectDir, spinner);
  await promptForDockerfile(projectDir, spinner);
}

async function updatePackageJson(projectDir, projectName) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.name = projectName;
  packageJson.scripts = {
    ...packageJson.scripts,
    lint: 'eslint src',
    format: "prettier --write 'src/**/*.js'",
    test: 'jest',
    'test:watch': 'jest --watch',
  };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function setupTesting(projectDir, spinner) {
  spinner.start('Setting up automated testing...');

  const jestConfig = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
  };

  await fs.writeJson(path.join(projectDir, 'jest.config.json'), jestConfig, { spaces: 2 });

  const testDir = path.join(projectDir, 'tests', 'routes');
  await fs.ensureDir(testDir);

  const testContent = `'use strict';

const app = require('../../src/app');

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /about', () => {
  it('should return 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/about' });
    expect(res.statusCode).toBe(200);
  });
});
`;

  await fs.writeFile(path.join(testDir, 'aboutRoute.test.js'), testContent);
  spinner.succeed('Test configuration is ready');
}

async function setupLinting(projectDir, spinner) {
  spinner.start('Setting up linter and prettier...');

  const eslintConfigContent = `'use strict';

const js = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
    },
  },
];
`;

  const prettierConfig = {
    semi: true,
    singleQuote: true,
    printWidth: 80,
  };

  await fs.writeFile(path.join(projectDir, 'eslint.config.js'), eslintConfigContent, 'utf-8');
  await fs.writeJson(path.join(projectDir, '.prettierrc.json'), prettierConfig, { spaces: 2 });

  spinner.succeed('Linter and prettier are ready');
}

async function promptForDockerfile(projectDir, spinner) {
  const { createDockerfile } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createDockerfile',
      message: "Would you like to add a Dockerfile to your project?",
      default: false,
    },
  ]);

  if (!createDockerfile) {
    spinner.info('Dockerfile generation was skipped');
    return;
  }

  const dockerfileContent = `# Use the official Node.js image as the base image
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

  const dockerignoreContent = `node_modules
npm-debug.log
.env
.git
coverage
`;

  await fs.writeFile(path.join(projectDir, 'Dockerfile'), dockerfileContent, 'utf-8');
  await fs.writeFile(path.join(projectDir, '.dockerignore'), dockerignoreContent, 'utf-8');
  spinner.succeed('Dockerfile and .dockerignore created successfully');
}

module.exports = { createBoilerplate };
