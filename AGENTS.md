# AGENTS

## What matters here

- This is a single-package NestJS backend (`server`), not a monorepo.
- Real runtime wiring is in `src/main.ts` and `src/app.module.ts`; `README.md` is mostly Nest starter boilerplate.
- Global API prefix is `api`, so controllers like `@Controller('auth')` are served under `/api/auth`.

## Local setup and runtime

- Use `npm` (lockfile is `package-lock.json`).
- Create `.env` from `.env.example` before running app/tests.
- DB is expected on Postgres port `5433` (see `docker-compose.yaml` and `.env.example`).
- Start DB with `docker-compose up -d` from repo root.

## Commands (verified from `package.json`)

- `npm run start:dev` - main dev loop.
- `npm run build` - production compile to `dist/`.
- `npm run lint` - runs ESLint with `--fix` (it modifies files).
- `npm run test` - Jest unit config (`rootDir: src`, `*.spec.ts`).
- `npm run test:e2e` - uses `test/jest-e2e.json`.

## Fast, focused verification

- Single unit test file: `npm test -- src/path/to/file.spec.ts`.
- Single e2e test file: `npm run test:e2e -- test/app.e2e-spec.ts`.
- There is no dedicated `typecheck` script; use `npm run build` as compile/type safety gate.

## Repo quirks agents can miss

- TypeORM is configured with `synchronize: true` in `src/app.module.ts`; schema auto-syncs on boot (no migration workflow in repo).
- E2E tests import full `AppModule`, so they require valid env vars and a reachable Postgres instance.
- Lint/type strictness is intentionally relaxed (`strictNullChecks: false`, `noImplicitAny: false`, several TS ESLint rules set to warn/off).
- `src/auth/entities/user.entity.ts` is the actual TypeORM `User`; `src/users/entities/user.entity.ts` is currently an empty stub.
