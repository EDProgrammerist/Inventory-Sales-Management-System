# Express.js API Setup Guide — TypeScript, MVC Architecture, Path Aliases, and PostgreSQL

This guide explains a reusable **MVC (Model–View–Controller)** Express + TypeScript API architecture: an HTTP server on port `7000`, environment variables, security middleware, a health check, `@/` imports, and optional PostgreSQL persistence using Drizzle ORM. MVC is adapted for a JSON REST API rather than server-rendered HTML. The **items** feature is a neutral example rather than an assumption about the application's real domain.

> **Scope:** This is a setup and implementation guide, **not a report of changes to your source code**. File examples and item endpoints must be implemented in the project. The source documents previously described prepared, unapplied feature migrations; use your actual schema and migration history when adapting an existing project.

## 1. Prepare the project

The source project recommends Node.js **v24+**, npm, a code editor such as VS Code, and PostgreSQL once you work with persistent data.

```bash
node --version
npm --version

mkdir typescript-express-api
cd typescript-express-api
npm init -y
```

The directory name `typescript-express-api` is just an example; an existing project need not be renamed.

### Install the documented server dependencies

```bash
npm install cookie-parser cors dotenv express helmet hpp jsonwebtoken nodemailer zod csrf-csrf bcrypt
```

```bash
npm install -D jiti @eslint/js @types/cookie-parser @types/cors @types/express @types/hpp @types/jsonwebtoken @types/node @types/nodemailer @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint tsdown tsx typescript typescript-eslint @types/bcrypt
```

Some packages support the original project's authentication feature and may be unnecessary for a smaller API. Keep those that your implementation imports. `jiti` is needed when loading an `eslint.config.ts` file through the documented ESLint setup.

Add these scripts to `package.json` (merge with your existing scripts):

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsdown src/server.ts --format esm --clean --minify",
    "start": "node dist/server.mjs",
    "db:studio": "drizzle-kit studio",
    "db:plan": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "lint": "eslint ."
  }
}
```

`npm run dev` watches files during development. `npm run build` and then `npm start` verify the production bundle. Configure ESLint separately in `eslint.config.ts` according to your project's rules; the scripts above do not create that configuration for you.

## 2. Configure TypeScript and the `@/` alias

The alias `@/` refers to the `src/` directory, so `@/config/env` means `src/config/env.ts` and `@/db` means `src/db/index.ts`.

**Step A — TypeScript.** Add or merge these settings into the root `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

If you already have a `tsconfig.json`, **merge** the alias settings and preserve project-specific `compilerOptions`, `include`, and other path mappings. The example assumes the TypeScript config lives beside `src/`.

**Step B — Development and production.** The documented workflow uses `tsx` for development and `tsdown` for the production bundle. TypeScript `paths` describes module resolution to tooling; it does **not** rewrite import specifiers in output from plain `tsc`. Verify that your actual runner/bundler resolves the alias, and do not run unbundled JavaScript containing unresolved `@/` imports directly with Node.

```ts
import { ENV } from "@/config/env";
import { db } from "@/db";
```

**Step C — Check the alias.** Once the referenced files exist, run the dev server and build:

```bash
npm run dev
npm run build
npm start
```

If an import works in your editor but fails at runtime, inspect `tsconfig.json`, confirm file casing and paths, and check the runtime/build tool's alias support. The alias is for **source-code imports**, not API route URLs. The matching React/Vite frontend alias is configured separately in the [frontend guide](frontend-structure-and-api-guide.md).

## 3. Organize the backend using MVC

**Use MVC as the architectural pattern**, with services and repositories as supporting layers. An Express REST API has a JSON representation for its **View**; a template engine or server-rendered HTML is not required.

| MVC component | Responsibility | Location |
| --- | --- | --- |
| **Model** | Defines persisted data, relationships, and domain types | `src/db/schema.ts`, `src/models/` |
| **View** | Shapes the JSON returned to API clients; hides private/internal fields | `src/views/` |
| **Controller** | Receives HTTP input, calls services, and selects the response/status | `src/controllers/` |

Supporting layers keep the MVC components focused: **routes** map URLs to controllers, **middleware** handles cross-cutting request concerns, **services** contain business logic and authorization, and **repositories** run database queries.

### Recommended MVC folder structure

```text
src/
├── config/                 # Validated environment configuration
├── controllers/            # MVC: HTTP controllers (e.g., health.controller.ts)
├── db/
│   ├── index.ts             # One shared PostgreSQL/Drizzle connection pool
│   └── schema.ts            # Drizzle persistence models and relationships
├── lib/                    # Shared integrations and helpers
├── middlewares/            # Authentication, CSRF, role, validation, errors
├── models/                 # MVC: Domain model types derived from DB tables
│   └── item.model.ts
├── repositories/           # Database access and ownership filters
├── routes/                 # Endpoint declarations (e.g., health.routes.ts)
├── schema/                 # Zod schemas for incoming HTTP requests
├── services/               # Business logic and authorization rules
├── utils/                  # Small reusable utilities
├── views/                  # MVC: JSON response presenters/serializers
│   └── health.view.ts
├── app.ts                  # Express app, middleware, route registration
└── server.ts               # Starts the HTTP listener
```

### MVC request lifecycle

```text
HTTP Request
  -> Route -> Middleware -> Controller -> Service -> Repository
                                         |                     |
                                         |                 Model / DB
                                         v
                                   View (JSON presenter)
                                         |
                                    HTTP Response
```

- **Models** describe data: the Drizzle tables in `src/db/schema.ts` define its persistence structure; files in `src/models/` can export domain types derived from those tables. Avoid duplicating table definitions.
- **Views** convert controller/service results into stable, safe JSON payloads. In a REST API, a `views/` folder contains response presenters, not necessarily `.ejs` or `.pug` templates.
- **Controllers** translate HTTP requests into service calls and return appropriate status codes and view representations. Avoid SQL and complex business rules in controllers.
- **Services** enforce business rules, permissions, and ownership checks; they should not know about `req` or `res`.
- **Repositories** own Drizzle queries, persistence details, and ownership filters. Keep SQL out of routes/controllers/views.
- **`src/schema/`** validates HTTP input with Zod; **`src/db/schema.ts`** defines database tables. These are different concerns.

For the project's one-service-per-file convention, group related files in `src/services/<feature>/` and export them through `index.ts`. `src/routes/index.ts` may aggregate route modules for registration in `src/app.ts`. Follow the naming convention `<feature>.model.ts`, `<feature>.view.ts`, `<feature>.controller.ts`, and `<feature>.routes.ts` as needed.

## 4. Create the environment configuration

In the project root, create `.env` from an example template. Use placeholders rather than real secrets in committed documentation:

```env
APP_NAME=TypeScript Express API
PORT=7000
NODE_ENV=development
BACKEND_URL=http://localhost:7000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
CSRF_SECRET=replace_with_a_separate_random_secret
DATABASE_URL=
```

Use `dotenv` (as in the source project) to load environment variables in `src/config/env.ts`. Validate required settings and fail clearly when production secrets or a required database URL are missing. Do not commit `.env`; commit an `.env.example` with nonsecret placeholders.

The browser frontend's CORS origin must match `FRONTEND_URL` **exactly** (scheme, hostname, and port). `localhost` and `127.0.0.1` are not interchangeable browser origins. Browser-exposed `VITE_` variables are frontend-only configuration and must not contain server secrets.

## 5. Create the Express app and health check

The source application uses:

- `helmet` for common HTTP security headers.
- `cors` to allow its configured frontend origin and credentialed browser requests.
- `express.json()` and `express.urlencoded()` for request bodies.
- `cookie-parser` for cookie access.
- `hpp` for HTTP parameter pollution protection.

The starter defines these checks:

| Method | URL | Purpose |
| --- | --- | --- |
| GET | `/` | Confirms the application instance responds |
| GET | `/api/health` | Confirms the API route layer responds |

The following **standalone minimal MVC implementation** separates JSON presentation, controller actions, route registration, and Express configuration. Adapt it rather than overwriting an existing application with authentication routes.

**`src/views/health.view.ts` — View (JSON response presenters):**

```ts
export function toRootStatusResponse() {
  return { status: "success", timestamp: new Date().toISOString() };
}

export function toHealthResponse() {
  return {
    status: "success",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  };
}
```

**`src/controllers/health.controller.ts` — Controller (HTTP handling):**

```ts
import type { RequestHandler } from "express";
import { toHealthResponse, toRootStatusResponse } from "@/views/health.view";

export const getRootStatus: RequestHandler = (_request, response) => {
  response.status(200).json(toRootStatusResponse());
};

export const getApiHealth: RequestHandler = (_request, response) => {
  response.status(200).json(toHealthResponse());
};
```

**`src/routes/health.routes.ts` — Routes (controller mapping):**

```ts
import { Router } from "express";
import { getApiHealth, getRootStatus } from "@/controllers/health.controller";

export const healthRouter = Router();

healthRouter.get("/", getRootStatus);
healthRouter.get("/api/health", getApiHealth);
```

**`src/app.ts` — Express application (middleware + route mounting):**

```ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import { healthRouter } from "@/routes/health.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());

// Register health routes and any feature/authentication routes first.
app.use(healthRouter);

// Unknown route fallback must come after all mounted routers.
app.use((_request, response) => {
  response.status(404).json({ status: "error", message: "Route not found" });
});
```

The health endpoints are intentionally database-independent; once your API adds persisted features, the **Model** is exercised through the service/repository layers demonstrated below. The View is still explicit in this lightweight health example.

The hardcoded CORS origin above keeps this isolated example short; in a real project, read and validate the configured `FRONTEND_URL` instead. Likewise, load the actual project's security, validation, logging, and centralized error middleware before production use.

A minimal `src/server.ts` can run the app:

```ts
import "dotenv/config";
import { app } from "./app";

const port = Number(process.env.PORT ?? 7000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port");
}

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
```

Start the server:

```bash
npm run dev
```

Then send `GET http://localhost:7000/api/health` from a browser or Postman. Expect status 200 and JSON similar to:

```json
{
  "status": "success",
  "message": "API is healthy",
  "timestamp": "2026-09-18T00:00:00.000Z"
}
```

The timestamp is illustrative. Express evaluates middleware in registration order: register routes **before** the 404 handler. For the full authenticated API, database configuration may be required before importing feature routes.

## 6. Add PostgreSQL and Drizzle ORM

Install the documented packages:

```bash
npm install drizzle-orm@latest pg@latest
npm install -D drizzle-kit@latest @types/pg@latest
```

Pin and commit the resolved `package-lock.json` to keep dependency versions reproducible. Set `DATABASE_URL` to your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/app_db
```

Replace placeholders and include SSL options as required by the database provider.

### Define a schema

The following **illustrative** `src/db/schema.ts` uses an `item` table related to a `user` table. It does not include all columns necessary for a production authentication system; use the actual auth schema when integrating.

```ts
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
});

export const items = pgTable("item", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
});
```

Define indexes, required columns, and deletion behavior based on real access patterns and business requirements. Never replace an existing account table with this incomplete demonstration.

### Add the MVC Model type

`src/db/schema.ts` is the **persistence model**. The optional `src/models/` layer exports domain-facing TypeScript types from the same Drizzle schema, so the model is not declared twice:

**`src/models/item.model.ts`:**

```ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { items } from "@/db/schema";

export type Item = InferSelectModel<typeof items>;
export type NewItem = InferInsertModel<typeof items>;
```

`Item` represents a selected row; `NewItem` represents an insert payload. These types do **not** replace Zod validation of untrusted HTTP input, and database row types must not be sent directly to clients if they contain fields clients should not see.

### Configure migrations

A root-level `drizzle.config.ts` can use:

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : undefined,
  strict: true,
  verbose: true,
});
```

Generate SQL from your schema and saved migration snapshots, **review** the files, then apply pending migrations to the intended database:

```bash
npm run db:plan
npm run db:migrate
```

Generating migrations is not the same as applying them. A "no changes" generation result does not prove that a database has already been migrated. Commit migration SQL, snapshots, and journal metadata as a unit. Run `npm run db:studio` to inspect a development database.

### Create one shared database pool

The documented `src/db/index.ts` pattern is:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
```

Ensure environment variables load **before** the module is imported. In the original project, `@/config/env` centralizes this configuration. Share one pool instead of opening a new pool per request.

### Write queries in repositories

```ts
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";

// Illustration inside an async repository method:
const [updatedItem] = await db
  .update(items)
  .set({ name: "Updated name" })
  .where(and(eq(items.id, itemId), eq(items.userId, userId)))
  .returning();
```

Here `itemId` and `userId` are parameters supplied to the repository by authenticated service logic. The same ownership filters belong on single-record reads and deletes. Query results can be empty; check for `undefined`. Never issue update/delete queries without an intentional filter.

## 7. Add feature endpoints consistently with MVC

For a database-backed feature, implement each MVC component plus the supporting layers:

1. **Model:** Define tables and relations in `src/db/schema.ts`; generate and review a migration, then apply it as appropriate. Export types in `src/models/<feature>.model.ts` when useful.
2. **Validation:** Define Zod request schemas in `src/schema/`.
3. **Repository:** Implement database access in `src/repositories/`, including intentional user/ownership filters.
4. **Service:** Implement business rules and authorization in `src/services/`.
5. **View:** Define safe JSON response presenters in `src/views/` so controllers do not expose raw database records accidentally.
6. **Controller:** Implement request-to-service orchestration, HTTP statuses, and view serialization in `src/controllers/`.
7. **Route:** Add authentication, CSRF, roles, and validation middleware before the controller in `src/routes/`; mount the router in `src/app.ts`.
8. **Tests:** Cover valid and invalid inputs, empty results, missing authentication, wrong roles, wrong owners, and database failures.

For example, the **View** of an item can choose exactly which persisted fields to expose:

**`src/views/item.view.ts`:**

```ts
import type { Item } from "@/models/item.model";

export function toItemResponse(item: Item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
  };
}
```

This intentionally excludes `userId` from the public JSON shape. An item controller should call the relevant service, then pass the authorized result through `toItemResponse()` before `response.json(...)`. Authentication and ownership still belong in server-side middleware/services and repository query filters; a View alone is not a security boundary.

See the [Items API example](items-api.md) for consistent neutral naming and proposed endpoints. Route names under `/api/items/v1/` are **not available** until implemented. The snippets above illustrate structure only; they do not implement item routes, authentication middleware, services, or repositories.

## 8. Authentication and CSRF

The source project documents authentication cookies for browsers and Bearer tokens for mobile/cookie-free clients. Its browser flow obtains a CSRF token before login and refreshes that token after login and token rotation. State-changing cookie-authenticated requests require `x-csrf-token`; role and resource ownership checks still apply.

Read [Browser and Mobile Authentication](csrf-auth.md) for the full flow. Keep `JWT_SECRET` and `CSRF_SECRET` separate, private, and stable in production. Protect all resource endpoints at the API layer even if the frontend hides inaccessible pages.

## 9. Troubleshooting and checks

| Symptom | First check |
| --- | --- |
| `Cannot find module '@/...'` | `baseUrl`, `paths`, file name/case, and runtime/bundler resolution |
| Alias works in editor but not in built output | Build tool alias handling; `tsc` does not rewrite import specifiers |
| API returns `Cannot GET /api/health` | `healthRouter` is mounted in `app.ts` before the 404 handler; check the controller import |
| JSON includes internal fields | Check `src/views/` response presenter; do not serialize entire model rows by default |
| Port or connection failure | API listening port, frontend base URL, host, firewall |
| CORS failure | Exact browser origin versus `FRONTEND_URL`; cookie credentials configuration |
| Missing `DATABASE_URL` | Root `.env` loaded before database modules |
| Database relation/table missing | Applied migrations against the correct database |
| No migration changes generated | Schema snapshots may already match; inspect migration history |
| 401 | Invalid/expired authentication or absent cookies/Bearer token |
| 403 | Insufficient role or invalid/missing CSRF token |
| Changes do not affect one user's records | Verify ownership conditions and intended `userId` |

Run the linter and a production build after changes:

```bash
npm run lint
npm run build
```

Run feature and auth tests from the actual project once they exist. Commit `.env.example`, source files, lockfile, and migration artifacts; exclude `.env`, `node_modules`, and `dist` from Git.

## Reference links

- [Drizzle PostgreSQL setup](https://orm.drizzle.team/docs/get-started/postgresql-new)
- [Drizzle Kit configuration](https://orm.drizzle.team/docs/drizzle-config-file)
- [Drizzle migration workflow](https://orm.drizzle.team/docs/migrations)
- [Drizzle select queries](https://orm.drizzle.team/docs/select)
- [Drizzle update queries](https://orm.drizzle.team/docs/update)
