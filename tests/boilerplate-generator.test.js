'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { execFileSync } = require('child_process');
const { createBoilerplate } = require('../src/generators/boilerplate');

// createBoilerplate reports progress through an ora spinner; tests only need the shape.
const noopSpinner = {
  start() {},
  succeed() {},
  fail() {},
  info() {},
  text: '',
};

const ALL_OPTIONS = {
  db: 'postgres',
  auth: 'session',
  plugins: ['helmet', 'cors', 'ratelimit', 'swagger', 'env'],
  createDockerfile: true,
};

async function scaffold(choices) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'fastify-boilerplate-'));
  await createBoilerplate(dir, 'test-app', choices, noopSpinner);
  return dir;
}

describe('template packaging', () => {
  // npm silently drops files named `.env` or `.gitignore` from the tarball, so a
  // template containing them works locally and breaks for every installed user.
  it('contains no dotfile names that npm would strip', async () => {
    const templates = path.join(__dirname, '..', 'templates');
    const offenders = [];
    const walk = async (d) => {
      for (const entry of await fs.readdir(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (entry.name === '.env' || entry.name === '.gitignore')
          offenders.push(full);
      }
    };
    await walk(templates);
    expect(offenders).toEqual([]);
  });
});

describe('createBoilerplate', () => {
  let dir;

  afterEach(async () => {
    if (dir) await fs.remove(dir);
    dir = undefined;
  });

  it('writes .env and .gitignore (renamed from the packed _env / _gitignore)', async () => {
    dir = await scaffold(ALL_OPTIONS);
    expect(await fs.pathExists(path.join(dir, '.env'))).toBe(true);
    expect(await fs.pathExists(path.join(dir, '.gitignore'))).toBe(true);
    expect(await fs.pathExists(path.join(dir, '_env'))).toBe(false);
    expect(await fs.pathExists(path.join(dir, '_gitignore'))).toBe(false);
  });

  it('.gitignore excludes .env so secrets are never committed', async () => {
    dir = await scaffold(ALL_OPTIONS);
    const gitignore = await fs.readFile(path.join(dir, '.gitignore'), 'utf-8');
    expect(gitignore).toMatch(/^\.env$/m);
  });

  it('generates real secrets, not placeholders', async () => {
    dir = await scaffold({ ...ALL_OPTIONS, auth: 'jwt' });
    const env = await fs.readFile(path.join(dir, '.env'), 'utf-8');
    const secret = env.match(/^JWT_SECRET=(.+)$/m)[1];
    expect(secret).toMatch(/^[a-f0-9]{64}$/);
  });

  it('does not pair a wildcard CORS origin with cookie auth', async () => {
    dir = await scaffold({
      ...ALL_OPTIONS,
      auth: 'session',
      plugins: ['cors'],
    });
    const env = await fs.readFile(path.join(dir, '.env'), 'utf-8');
    expect(env).not.toMatch(/^CORS_ORIGIN=\*$/m);
  });

  it('every generated JS file parses', async () => {
    dir = await scaffold(ALL_OPTIONS);
    const files = [];
    const walk = async (d) => {
      for (const entry of await fs.readdir(d, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (entry.name.endsWith('.js')) files.push(full);
      }
    };
    await walk(dir);

    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      execFileSync(process.execPath, ['--check', file]);
    }
  });

  it('app.js registers the selected plugins and the error handler', async () => {
    dir = await scaffold(ALL_OPTIONS);
    const app = await fs.readFile(path.join(dir, 'src', 'app.js'), 'utf-8');
    expect(app).toContain('fastify.register(helmetPlugin);');
    expect(app).toContain('fastify.setErrorHandler(errorHandler);');
    expect(app).toContain("require('dotenv').config({ quiet: true });");
  });

  it('adds the dependency for each selected option', async () => {
    dir = await scaffold(ALL_OPTIONS);
    const pkg = await fs.readJson(path.join(dir, 'package.json'));
    expect(pkg.name).toBe('test-app');
    expect(pkg.dependencies).toMatchObject({
      '@fastify/postgres': expect.any(String),
      '@fastify/session': expect.any(String),
      '@fastify/cookie': expect.any(String), // @fastify/session cannot boot without it
      '@fastify/helmet': expect.any(String),
    });
  });

  it('produces a non-root Dockerfile installing from the lockfile', async () => {
    dir = await scaffold(ALL_OPTIONS);
    const dockerfile = await fs.readFile(path.join(dir, 'Dockerfile'), 'utf-8');
    expect(dockerfile).toContain('USER node');
    expect(dockerfile).toContain('npm ci --omit=dev');
    expect(dockerfile).not.toContain('npm install');
  });

  it('works with every option disabled', async () => {
    dir = await scaffold({
      db: 'none',
      auth: 'none',
      plugins: [],
      createDockerfile: false,
    });
    expect(await fs.pathExists(path.join(dir, '.env'))).toBe(true);
    expect(await fs.pathExists(path.join(dir, 'Dockerfile'))).toBe(false);
  });
});
