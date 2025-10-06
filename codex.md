# soft-test-server Context

## Overview
- Node.js/Express API server for auth-style flows.
- Uses Sequelize ORM to talk to a Postgres database.
- Designed for local dev with shared credentials; no production hardening yet.

## Entry Point (`index.js`)
- Boots an Express app on port 3000 with JSON and URL-encoded body parsing plus CORS for `http://localhost:5173`.
- Opens a Sequelize connection on startup and logs "Database Connected" or the error message.
- Routes:
  - `GET /` returns `"Helloworld"`.
  - `POST /login` expects `email` in the body, looks up the user, and returns a welcome message and raw `Users` data; no password validation or null-guard when the user is missing.
  - `POST /register` creates a user record from the request body and responds 201 with the created record.

## Database Integration
- `config/database.js` instantiates Sequelize with static credentials (`myuser`/`mypassword`) against `mydatabase` on `localhost:5432` using the Postgres dialect.
- No env-var support or SSL settings; expects docker-compose (or a local Postgres) to provide the database.
- Connection sync (`sequelize.sync`) is commented out, so table creation relies on external migrations or prior manual sync.

## Data Model
- `model/user.js` defines the `Users` model with fields:
  - `name`: required string.
  - `email`: required unique string validated as an email.
  - `password`: required string (stored as plain text; no hashing or hooks).
- Default timestamps (`createdAt`/`updatedAt`) remain enabled because no model options override them.

## Docker & Local Services
- `docker-compose.yml` provisions:
  - `postgres`: latest Postgres image, exposing 5432 and persisting data in `postgres_data` volume.
  - `pgadmin`: pgAdmin 4 on port 5050 with default admin credentials; depends on Postgres.
- Credentials mirror the ones in `config/database.js`.

## Dependencies & Tooling
- Runtime: `express@5`, `sequelize@6`, `pg`, `cors`.
- Dev: `nodemon` (not yet wired into scripts).
- `packageManager` set to `pnpm@10.15.1`; the only npm script is the placeholder `test`.

## Notable Gaps / Follow-ups
- Secrets and connection details should move to environment variables or config management.
- `/login` lacks password verification and throws if the user is not found.
- No error handling middleware, validation, or logging strategy beyond `console.log`.
- No migrations, seed scripts, or automated tests are present.
- A CORS comment in `index.js` contains garbled non-ASCII characters and may need cleanup.
