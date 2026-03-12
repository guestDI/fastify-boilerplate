'use strict';

const path = require('path');
const fs = require('fs-extra');

const APP_FILE_PATH = path.join(process.cwd(), 'src', 'app.js');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generateRoute(routeName, baseDir = process.cwd()) {
  const routeDir = path.join(baseDir, 'src', 'routes', routeName);
  const controllerDir = path.join(baseDir, 'src', 'controllers');
  const modelDir = path.join(baseDir, 'src', 'models');
  const serviceDir = path.join(baseDir, 'src', 'services');
  const testDir = path.join(baseDir, 'tests', 'routes');

  await Promise.all([
    fs.ensureDir(routeDir),
    fs.ensureDir(controllerDir),
    fs.ensureDir(modelDir),
    fs.ensureDir(serviceDir),
    fs.ensureDir(testDir),
  ]);

  const Name = capitalize(routeName);

  const controllerContent = `'use strict';

const ${routeName}Service = require('../services/${routeName}');

const get${Name} = async (request, reply) => {
  const result = await ${routeName}Service.getAll();
  return reply.send(result);
};

module.exports = { get${Name} };
`;

  const serviceContent = `'use strict';

const getAll = async () => {
  // TODO: implement ${routeName} service logic
  return [];
};

module.exports = { getAll };
`;

  const modelContent = `'use strict';

// TODO: define ${routeName} model schema
module.exports = {};
`;

  const routeContent = `'use strict';

const { get${Name} } = require('../../controllers/${routeName}');

async function ${routeName}Routes(fastify) {
  fastify.get('/', get${Name});
}

module.exports = ${routeName}Routes;
`;

  const testContent = `'use strict';

const app = require('../../src/app');

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /${routeName}', () => {
  it('should return 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/${routeName}' });
    expect(res.statusCode).toBe(200);
  });
});
`;

  await Promise.all([
    fs.writeFile(path.join(controllerDir, `${routeName}.js`), controllerContent),
    fs.writeFile(path.join(modelDir, `${routeName}.js`), modelContent),
    fs.writeFile(path.join(serviceDir, `${routeName}.js`), serviceContent),
    fs.writeFile(path.join(routeDir, 'index.js'), routeContent),
    fs.writeFile(path.join(testDir, `${routeName}Route.test.js`), testContent),
  ]);

  await addRouteToAppJs(routeName, baseDir);
}

async function addRouteToAppJs(routeName, baseDir = process.cwd()) {
  const appFilePath = path.join(baseDir, 'src', 'app.js');
  const importStatement = `const ${routeName}Route = require('./routes/${routeName}');`;
  const registerStatement = `app.register(${routeName}Route, { prefix: '/${routeName}' });`;

  let content = await fs.readFile(appFilePath, 'utf-8');

  if (content.includes(importStatement)) {
    console.log(`Route ${routeName} is already registered in app.js`);
    return;
  }

  const lines = content.split('\n');

  // Insert import after the first line
  lines.splice(1, 0, importStatement);

  // Insert registration after the //Routes registration comment
  const registerIndex = lines.findIndex((line) => line.includes('//Routes registration'));
  if (registerIndex !== -1) {
    lines.splice(registerIndex + 1, 0, registerStatement);
  } else {
    lines.push(registerStatement);
  }

  await fs.writeFile(appFilePath, lines.join('\n'), 'utf-8');
  console.log(`Route ${routeName} added to app.js`);
}

module.exports = { generateRoute };
