'use strict';

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { generateRoute } = require('../src/generators/route');

// Minimal app.js matching the buildApp pattern so addRouteToAppJs can process it
const MINIMAL_APP_JS = `'use strict';

const aboutRoute = require('./routes/about');
const healthRoute = require('./routes/health');
const dbPlugin = require('./plugins/db');
const authPlugin = require('./plugins/auth');

function buildApp(opts = {}) {
    const fastify = require('fastify')({ logger: true, ...opts });

    //Plugins registration
    fastify.register(dbPlugin);
    fastify.register(authPlugin);

    //Routes registration
    fastify.register(aboutRoute, { prefix: '/about' });
    fastify.register(healthRoute, { prefix: '/health' });

    return fastify;
}

module.exports = buildApp;
`;

describe('generateRoute', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-cli-test-'));
    await fs.ensureDir(path.join(tmpDir, 'src', 'routes'));
    await fs.ensureDir(path.join(tmpDir, 'src', 'controllers'));
    await fs.ensureDir(path.join(tmpDir, 'src', 'services'));
    await fs.ensureDir(path.join(tmpDir, 'src', 'models'));
    await fs.ensureDir(path.join(tmpDir, 'tests', 'routes'));
    await fs.writeFile(path.join(tmpDir, 'src', 'app.js'), MINIMAL_APP_JS);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('creates the controller file', async () => {
    await generateRoute('users', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src', 'controllers', 'users.js'))).toBe(true);
  });

  it('creates the service file', async () => {
    await generateRoute('users', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src', 'services', 'users.js'))).toBe(true);
  });

  it('creates the model file', async () => {
    await generateRoute('users', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src', 'models', 'users.js'))).toBe(true);
  });

  it('creates the route index file', async () => {
    await generateRoute('users', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'src', 'routes', 'users', 'index.js'))).toBe(true);
  });

  it('creates the test file', async () => {
    await generateRoute('users', tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'tests', 'routes', 'usersRoute.test.js'))).toBe(true);
  });

  it('controller references the service', async () => {
    await generateRoute('users', tmpDir);
    const content = await fs.readFile(path.join(tmpDir, 'src', 'controllers', 'users.js'), 'utf-8');
    expect(content).toContain("require('../services/users')");
    expect(content).toContain('getUsers');
  });

  it('route file references the controller', async () => {
    await generateRoute('users', tmpDir);
    const content = await fs.readFile(path.join(tmpDir, 'src', 'routes', 'users', 'index.js'), 'utf-8');
    expect(content).toContain("require('../../controllers/users')");
  });

  it('test file uses app.inject()', async () => {
    await generateRoute('users', tmpDir);
    const content = await fs.readFile(path.join(tmpDir, 'tests', 'routes', 'usersRoute.test.js'), 'utf-8');
    expect(content).toContain('app.inject');
    expect(content).toContain("url: '/users'");
  });

  it('registers the import in app.js', async () => {
    await generateRoute('users', tmpDir);
    const content = await fs.readFile(path.join(tmpDir, 'src', 'app.js'), 'utf-8');
    expect(content).toContain("const usersRoute = require('./routes/users');");
  });

  it('registers the route in app.js', async () => {
    await generateRoute('users', tmpDir);
    const content = await fs.readFile(path.join(tmpDir, 'src', 'app.js'), 'utf-8');
    expect(content).toContain("fastify.register(usersRoute, { prefix: '/users' });");
  });

  it('does not duplicate route if called twice', async () => {
    await generateRoute('users', tmpDir);
    await generateRoute('users', tmpDir);
    const content = await fs.readFile(path.join(tmpDir, 'src', 'app.js'), 'utf-8');
    const count = (content.match(/const usersRoute/g) || []).length;
    expect(count).toBe(1);
  });
});
