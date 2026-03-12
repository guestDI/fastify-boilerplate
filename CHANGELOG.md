# Changelog

## [2.0.0](https://github.com/guestDI/fastify-boilerplate/compare/v1.1.0...v2.0.0) (2025-03-12)

### ⚠ BREAKING CHANGES

* `create` command now prompts interactively before scaffolding — no silent defaults
* Generated `app.js` exports `buildApp(opts)` instead of a pre-instantiated Fastify instance; any code doing `require('./app').listen(...)` must be updated to `buildApp().listen(...)`
* Template structure completely reorganised (`templates/base/`, `db/`, `auth/`, `plugins/`); manual template customisations from v1 are not forward-compatible
* Fastify upgraded from v4 to **v5** in generated projects
* `supertest` removed from generated project devDependencies — tests now use `app.inject()`
* ESLint config changed from `.eslintrc.json` (legacy) to `eslint.config.js` (flat config, ESLint v9)

### Features

* Interactive `create` prompts: database (None / PostgreSQL / MySQL / MongoDB / SQLite), auth strategy (None / JWT / Session / API Key), optional plugins (CORS, Rate Limiting, Swagger/OpenAPI, Env Validation), and Dockerfile
* Dynamic `app.js` generation — only selected plugins are imported and registered; plugin load order enforced (env → swagger → db → auth → cors → ratelimit)
* Conditional dependency injection — generated `package.json` receives only the `@fastify/*` packages matching the user's choices
* Fastify v5 upgrade in generated projects (`fastify ^5.0.0`, `pino ^9.0.0`, `nodemon ^3.0.0`)
* `buildApp(opts)` pattern — enables `app.inject()` in tests without opening a real port
* Health check route always generated at `GET /health` returning `{ status, timestamp }`
* Working JWT auth plugin (`@fastify/jwt`) with `fastify.authenticate` preHandler decorator
* Working Session auth plugin (`@fastify/session`)
* API Key auth plugin (custom `x-api-key` header decorator)
* Swagger / OpenAPI docs plugin (`@fastify/swagger` + `@fastify/swagger-ui`) served at `/docs`
* CORS plugin (`@fastify/cors`) with `CORS_ORIGIN` env var
* Rate limiting plugin (`@fastify/rate-limit`) with `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` env vars
* Env validation plugin (`@fastify/env`)
* `route` command generates a test file alongside controller / service / model / route files
* Generated tests use `app.inject()` (no real port, no supertest)
* GitHub Actions workflow for automatic npm publish on push to `main`
* Vitest integration tests for the CLI's own route generator (11 tests)

### Bug Fixes

* Removed `tap` from generated project runtime `dependencies` (tests use Jest)
* Fixed MongoDB / PostgreSQL config inconsistency — `DATABASE_URL` now defaults to empty; `config/index.js` no longer hardcodes a MongoDB URL
* Fixed ESLint v9 flat config — was writing `.eslintrc.json` (unsupported in ESLint v9 default mode)
* Fixed `.dockerignore` not being created alongside `Dockerfile`
* Fixed hardcoded port `3000` in generated `src/index.js` — now reads from `config.port`
* Fixed duplicate `GET /about/about` route registration in the example about route
* Fixed CLI `--version` reporting `1.0.0` regardless of `package.json` version
* Fixed `@fastify/mongodb ^8` / `@fastify/postgres ^5` / `@fastify/session ^10` version mismatches with Fastify v5
* Database plugins now skip connection gracefully when `DATABASE_URL` is not set, so the app starts without a configured database

## [1.1.0](https://github.com/guestDI/fastify-boilerplate/compare/v1.0.0...v1.1.0) (2024-11-14)


### Features

* Add optional dockerfile generation ([b0ecedb](https://github.com/guestDI/fastify-boilerplate/commit/b0ecedb28c69ea641f10cd682789718f17f1bcf1))
* Add optional dockerfile generation ([5585ff8](https://github.com/guestDI/fastify-boilerplate/commit/5585ff8a3978f3e780e71965c85db46120750183))

## 1.0.0 (2024-11-13)


### Features

* add route command ([2703185](https://github.com/guestDI/fastify-boilerplate/commit/270318530483552fcd45aed14e944567700c0d25))
* added git initialization ([e2ea811](https://github.com/guestDI/fastify-boilerplate/commit/e2ea81144a42ea6e3b5a49e44856c257a00ae94f))
* update build_and_publish.yaml ([e9e4d7a](https://github.com/guestDI/fastify-boilerplate/commit/e9e4d7a4c2e6681164dac43927f1eb90353d8a45))

### Bug Fixes

* add github action ([7084cdb](https://github.com/guestDI/fastify-boilerplate/commit/7084cdbb081f610af8b8812c27e9ce45273ac2da))
