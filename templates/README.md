# <project-name>

A Fastify application scaffolded with [fastify-boilerplate-cli](https://github.com/guestDI/fastify-boilerplate).

## Getting started

```bash
npm install
npm run dev
```

The server starts on `http://localhost:3000` by default.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Run in production mode |
| Dev | `npm run dev` | Run with nodemon (auto-restart on file changes) |
| Test | `npm test` | Run the Jest test suite |
| Test watch | `npm run test:watch` | Run Jest in watch mode |
| Lint | `npm run lint` | Lint `src/` with ESLint |
| Format | `npm run format` | Format `src/` with Prettier |

---

## Project structure

```
src/
├── app.js                  # Fastify instance — registers plugins and routes
├── index.js                # Server entry point
├── config/
│   └── index.js            # Reads environment variables
├── plugins/
│   ├── auth.js             # Authentication plugin (stub — implement as needed)
│   └── db.js               # Database plugin (stub — implement as needed)
├── routes/
│   └── about/
│       ├── index.js        # Route handlers
│       └── schema.js       # JSON Schema for request / response validation
├── controllers/
│   └── aboutController.js  # Calls the service layer
├── services/
│   └── aboutService.js     # Business logic
├── models/
│   └── aboutModel.js       # Data model definition
└── utils/
    ├── errorHandler.js     # Generic error handler
    └── logger.js           # Pino logger instance
tests/
└── routes/
    └── aboutRoute.test.js  # Example route test
```

---

## Environment variables

Copy `.env` and fill in the values before starting:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `DATABASE_URL` | _(empty)_ | Database connection string |
| `LOG_LEVEL` | `info` | Pino log level (`trace`, `debug`, `info`, `warn`, `error`) |

---

## Adding a new route

Use the CLI from the project root:

```bash
fastify-boilerplate-cli route <route-name>
```

This generates `src/routes/<route-name>/`, the matching controller, service, model, and a test file, then registers the route automatically in `src/app.js`.

---

## Configuring the database

Open `src/plugins/db.js`. It contains commented examples for common adapters:

```js
// PostgreSQL (@fastify/postgres)
await fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL,
});

// MongoDB (@fastify/mongodb)
await fastify.register(require('@fastify/mongodb'), {
  url: process.env.DATABASE_URL,
});
```

Install your chosen adapter, uncomment the relevant block, and set `DATABASE_URL` in `.env`.

---

## Authentication

Open `src/plugins/auth.js`. The plugin decorates the Fastify instance with an `authenticate` method you can attach as a `preHandler` hook on any protected route:

```js
fastify.get('/protected', { preHandler: fastify.authenticate }, handler);
```

Implement the verification logic inside the plugin (e.g. with `@fastify/jwt`).

---

## Running tests

Tests use Fastify's built-in `inject()` — no real port is opened, so they are fast and CI-friendly:

```bash
npm test
```

Coverage report:

```bash
npm test -- --coverage
```
