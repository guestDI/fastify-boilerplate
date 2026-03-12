'use strict';

const path = require('path');
const fs = require('fs-extra');
const { initializeGitRepo } = require('../utils/git');

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');
const BASE_TEMPLATE_DIR = path.join(TEMPLATES_DIR, 'base');
const DB_TEMPLATE_DIR = path.join(TEMPLATES_DIR, 'db');
const AUTH_TEMPLATE_DIR = path.join(TEMPLATES_DIR, 'auth');
const PLUGINS_TEMPLATE_DIR = path.join(TEMPLATES_DIR, 'plugins');

// All versions below are the minimum that declare Fastify v5 peer dependency support.
const DB_DEPS = {
  postgres: { '@fastify/postgres': '^6.0.0' },   // v6 → Fastify v5
  mysql: { mysql2: '^3.0.0' },                    // native driver, no Fastify peer dep
  mongodb: { '@fastify/mongodb': '^9.0.0' },      // v9 → Fastify v5 (v8 was v4-only)
  sqlite: { 'better-sqlite3': '^9.0.0' },         // native driver, no Fastify peer dep
  none: {},
};

const AUTH_DEPS = {
  jwt: { '@fastify/jwt': '^9.0.0' },              // v9 → Fastify v5
  session: { '@fastify/session': '^11.0.0' },     // v11 → Fastify v5 (v10 was v4-only)
  apikey: {},
  none: {},
};

const PLUGIN_DEPS = {
  cors: { '@fastify/cors': '^10.0.0' },                                           // v10 → Fastify v5
  ratelimit: { '@fastify/rate-limit': '^10.0.0' },                               // v10 → Fastify v5
  swagger: { '@fastify/swagger': '^9.0.0', '@fastify/swagger-ui': '^5.0.0' },   // v9/v5 → Fastify v5
  env: { '@fastify/env': '^5.0.0' },                                             // v5 → Fastify v5
};

async function createBoilerplate(projectDir, projectName, choices, spinner) {
  spinner.text = `Creating Fastify project in ${projectDir}...`;

  await fs.copy(BASE_TEMPLATE_DIR, projectDir);
  await fs.ensureDir(path.join(projectDir, 'src', 'plugins'));

  await fs.copy(
    path.join(DB_TEMPLATE_DIR, choices.db, 'src', 'plugins', 'db.js'),
    path.join(projectDir, 'src', 'plugins', 'db.js'),
  );

  await fs.copy(
    path.join(AUTH_TEMPLATE_DIR, choices.auth, 'src', 'plugins', 'auth.js'),
    path.join(projectDir, 'src', 'plugins', 'auth.js'),
  );

  for (const plugin of choices.plugins) {
    await fs.copy(
      path.join(PLUGINS_TEMPLATE_DIR, plugin, 'src', 'plugins'),
      path.join(projectDir, 'src', 'plugins'),
    );
  }

  await fs.writeFile(path.join(projectDir, 'src', 'app.js'), generateAppJs(choices), 'utf-8');
  await updatePackageJson(projectDir, projectName, choices);
  await appendEnvVars(projectDir, choices);

  spinner.succeed('Project structure created successfully');

  await setupTesting(projectDir, spinner);
  await setupLinting(projectDir, spinner);
  await initializeGitRepo(projectDir, spinner);

  if (choices.createDockerfile) {
    await createDockerfile(projectDir, spinner);
  } else {
    spinner.info('Dockerfile generation was skipped');
  }
}

function generateAppJs(choices) {
  const { plugins } = choices;

  const imports = [
    "'use strict';",
    '',
    "const aboutRoute = require('./routes/about');",
    "const healthRoute = require('./routes/health');",
    "const dbPlugin = require('./plugins/db');",
    "const authPlugin = require('./plugins/auth');",
  ];

  const optionalImports = {
    env: "const envPlugin = require('./plugins/env');",
    swagger: "const swaggerPlugin = require('./plugins/swagger');",
    cors: "const corsPlugin = require('./plugins/cors');",
    ratelimit: "const rateLimitPlugin = require('./plugins/ratelimit');",
  };

  for (const [key, line] of Object.entries(optionalImports)) {
    if (plugins.includes(key)) imports.push(line);
  }

  const pluginRegistrations = ['    //Plugins registration'];

  if (plugins.includes('env')) pluginRegistrations.push('    fastify.register(envPlugin);');
  if (plugins.includes('swagger')) pluginRegistrations.push('    fastify.register(swaggerPlugin);');
  pluginRegistrations.push('    fastify.register(dbPlugin);');
  pluginRegistrations.push('    fastify.register(authPlugin);');
  if (plugins.includes('cors')) pluginRegistrations.push('    fastify.register(corsPlugin);');
  if (plugins.includes('ratelimit')) pluginRegistrations.push('    fastify.register(rateLimitPlugin);');

  const routeRegistrations = [
    '    //Routes registration',
    "    fastify.register(aboutRoute, { prefix: '/about' });",
    "    fastify.register(healthRoute, { prefix: '/health' });",
  ];

  const body = [
    'function buildApp(opts = {}) {',
    "    const fastify = require('fastify')({ logger: true, ...opts });",
    '',
    ...pluginRegistrations,
    '',
    ...routeRegistrations,
    '',
    '    return fastify;',
    '}',
    '',
    'module.exports = buildApp;',
    '',
  ];

  return [...imports, '', ...body].join('\n');
}

async function updatePackageJson(projectDir, projectName, choices) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const pkg = await fs.readJson(packageJsonPath);

  pkg.name = projectName;
  pkg.scripts = {
    ...pkg.scripts,
    lint: 'eslint src',
    format: "prettier --write 'src/**/*.js'",
    test: 'jest',
    'test:watch': 'jest --watch',
  };

  const extraDeps = {
    ...DB_DEPS[choices.db],
    ...AUTH_DEPS[choices.auth],
    ...choices.plugins.reduce((acc, p) => ({ ...acc, ...PLUGIN_DEPS[p] }), {}),
  };

  pkg.dependencies = { ...pkg.dependencies, ...extraDeps };

  await fs.writeJson(packageJsonPath, pkg, { spaces: 2 });
}

async function appendEnvVars(projectDir, choices) {
  const envPath = path.join(projectDir, '.env');
  const extras = [];

  if (choices.auth === 'jwt') extras.push('JWT_SECRET=your-secret-here');
  if (choices.auth === 'session') extras.push('SESSION_SECRET=changeme-use-at-least-32-characters');
  if (choices.auth === 'apikey') extras.push('API_KEY=your-api-key-here');
  if (choices.plugins.includes('cors')) extras.push('CORS_ORIGIN=*');
  if (choices.plugins.includes('ratelimit')) {
    extras.push('RATE_LIMIT_MAX=100');
    extras.push('RATE_LIMIT_WINDOW=1 minute');
  }
  if (choices.db === 'sqlite') extras.push('DATABASE_PATH=database.sqlite');

  if (extras.length === 0) return;

  const current = await fs.readFile(envPath, 'utf-8');
  await fs.writeFile(envPath, current.trimEnd() + '\n\n' + extras.join('\n') + '\n', 'utf-8');
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

const buildApp = require('../../src/app');

let app;

beforeAll(async () => {
  app = buildApp({ logger: false });
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

  const prettierConfig = { semi: true, singleQuote: true, printWidth: 80 };

  await fs.writeFile(path.join(projectDir, 'eslint.config.js'), eslintConfigContent, 'utf-8');
  await fs.writeJson(path.join(projectDir, '.prettierrc.json'), prettierConfig, { spaces: 2 });

  spinner.succeed('Linter and prettier are ready');
}

async function createDockerfile(projectDir, spinner) {
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

  await Promise.all([
    fs.writeFile(path.join(projectDir, 'Dockerfile'), dockerfileContent, 'utf-8'),
    fs.writeFile(path.join(projectDir, '.dockerignore'), dockerignoreContent, 'utf-8'),
  ]);

  spinner.succeed('Dockerfile and .dockerignore created successfully');
}

module.exports = { createBoilerplate };
