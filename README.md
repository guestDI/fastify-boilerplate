# Fastify Boilerplate CLI

A CLI to scaffold production-ready [Fastify](https://fastify.dev) projects with a pre-configured structure, tooling, and sensible defaults.

## Requirements

- Node.js 20 or higher
- npm 8 or higher

## Installation

```bash
npm install -g fastify-boilerplate-cli
```

## Commands

### `create` — scaffold a new project

```bash
fastify-boilerplate-cli create <project-name>
```

Creates a new directory named `<project-name>` and generates the full project structure inside it. Project names may contain letters, digits, `.`, `-` and `_`.

During setup the CLI asks for a database (PostgreSQL, MySQL, MongoDB, SQLite, none), an auth strategy (JWT, session, API key, none), optional plugins (**Helmet** security headers, CORS, rate limiting, Swagger, env validation), and whether to add a **Dockerfile**. Only the dependencies you pick are added to `package.json`.

**What gets generated:**

- Complete Fastify project structure (routes, controllers, services, models, plugins, utils)
- `package.json` pre-configured with project name, scripts, and the deps for your choices
- Jest configuration and an example test using `app.inject()`
- ESLint v9 flat config + Prettier
- `.env` with your settings — auth secrets are **generated**, not placeholders
- `.gitignore` covering `node_modules`, `.env`, `coverage`, `dist`, logs, and OS files
- Git repository initialized automatically
- Optional `Dockerfile` + `.dockerignore` (Node.js 22 Alpine, non-root, `npm ci --omit=dev`)

**Generated project structure:**

```
<project-name>/
├── src/
│   ├── app.js                  # Fastify instance, plugin and route registration
│   ├── index.js                # Server entry point
│   ├── config/
│   │   └── index.js            # Environment-based configuration
│   ├── plugins/
│   │   ├── auth.js             # Authentication plugin stub
│   │   └── db.js               # Database plugin stub
│   ├── routes/
│   │   └── about/
│   │       ├── index.js        # Route definitions
│   │       └── schema.js       # Request / response schemas
│   ├── controllers/
│   │   └── aboutController.js
│   ├── services/
│   │   └── aboutService.js
│   ├── models/
│   │   └── aboutModel.js
│   └── utils/
│       ├── errorHandler.js
│       └── logger.js
├── tests/
│   └── routes/
│       └── aboutRoute.test.js
├── .env
├── .gitignore
├── eslint.config.js
├── .prettierrc.json
├── jest.config.json
├── package.json
├── README.md
└── Dockerfile          # optional
```

**Then:**

```bash
cd <project-name>
npm install
npm run dev
```

---

### `route` — generate a new route

Run this inside an existing project created by this CLI:

```bash
fastify-boilerplate-cli route <route-name>
```

Generates a complete MVC slice for the given route name and automatically registers it in `src/app.js`. The route name becomes a JavaScript identifier in the generated files, so it must start with a letter and contain only letters, digits and underscores.

**Files created:**

| File | Description |
|------|-------------|
| `src/routes/<route-name>/index.js` | Route handler registered with Fastify |
| `src/controllers/<route-name>.js` | Controller calling the service layer |
| `src/services/<route-name>.js` | Business logic stub |
| `src/models/<route-name>.js` | Model / schema stub |
| `tests/routes/<route-name>Route.test.js` | Jest test using `app.inject()` |

**Example:**

```bash
fastify-boilerplate-cli route users
```

Creates `src/routes/users/`, `src/controllers/users.js`, `src/services/users.js`, `src/models/users.js`, and `tests/routes/usersRoute.test.js`. The route is automatically added to `src/app.js` with the prefix `/users`.

---

## Generated project scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Run in production mode |
| Dev | `npm run dev` | Run with nodemon (auto-restart) |
| Test | `npm test` | Run Jest test suite |
| Test watch | `npm run test:watch` | Run Jest in watch mode |
| Lint | `npm run lint` | Lint `src/` with ESLint |
| Format | `npm run format` | Format `src/` with Prettier |

---

## Project structure explained

| Directory | Purpose |
|-----------|---------|
| `src/app.js` | Creates the Fastify instance, registers plugins and routes |
| `src/index.js` | Starts the HTTP server, reads port from config |
| `src/config/` | Centralizes environment variable access |
| `src/plugins/` | Fastify plugins (auth, database) — extend these as needed |
| `src/routes/` | One subdirectory per resource; each exports an `async function` accepted by `fastify.register` |
| `src/controllers/` | Handle request/reply, delegate logic to services |
| `src/services/` | Business logic, decoupled from HTTP |
| `src/models/` | Data shape definitions |
| `src/utils/` | Shared helpers: logger (Pino) and error handler |
| `tests/` | Jest tests using Fastify's built-in `app.inject()` — no real port needed |

---

## License

MIT
