# Items API — Example Feature Guide

This guide uses **items** as a reusable example of a protected, database-backed Express API feature. It adapts the architecture and authentication conventions described in the original project documentation without tying the example to a particular business domain.

> **Implementation status:** The file paths, item routes, schemas, and payloads below are a **proposed naming convention and example contract**. Renaming documentation does not create these routes or rename an existing database. Implement and test the feature before calling the endpoints.

## 1. Architecture and naming

```text
HTTP request
  -> route + middleware
  -> controller
  -> service
  -> repository
  -> database
```

| Layer | Example file | Responsibility |
| --- | --- | --- |
| Route | `src/routes/item-routes.ts` | Registers methods, paths, and middleware |
| Controller | `src/controllers/item-controller.ts` | Reads validated inputs; sends an HTTP response |
| Service | `src/services/items/get-items-service.ts` | Applies business rules and authorization |
| Repository | `src/repositories/item-repository.ts` | Performs database queries |
| Schema | `src/schema/item-schema.ts` | Validates route params and request bodies |
| Database | `src/db/schema.ts` | Declares the item table, indexes, and relations |

Keep one function per service file when following the documented project style. Group them under `src/services/items/` and re-export from `index.ts`:

```text
src/services/items/
├── get-items-service.ts
├── get-item-service.ts
├── create-item-service.ts
├── update-item-service.ts
├── delete-item-service.ts
├── get-all-items-service.ts
└── index.ts
```

A controller can respond using the existing service-result convention:

```ts
res.status(result.code).json(result);
```

The service returns the result; the controller does not perform direct SQL queries.

## 2. Proposed item endpoints

These names mirror the original API's action-oriented routing style. They are **examples, not verified existing endpoints**.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/items/v1/get-all-items` | `ADMIN` | List items belonging to all users |
| GET | `/api/items/v1/get-items` | `USER` | List the signed-in user's items |
| GET | `/api/items/v1/get-item/:id` | `USER` | Read one owned item |
| POST | `/api/items/v1/create-item` | `USER` | Create an item |
| POST | `/api/items/v1/update-item/:id` | `USER` | Update specified fields |
| POST | `/api/items/v1/delete-item/:id` | `USER` | Delete an item |

In this example, update and delete use `POST` to retain compatibility with the source project's conventions. Do not silently substitute `PUT`, `PATCH`, or `DELETE` unless you also change the server contract.

The `:id` parameter represents a UUID. All routes in this example are authenticated; regular users can only access their own records. Role checking belongs in route middleware, while record ownership must also be enforced in services and repository filters. A frontend route guard is **not** authorization.

## 3. Authentication, authorization, and CSRF

For a browser with authentication cookies:

1. Request `GET /api/auth/v1/csrf-token` with credentials included.
2. Send `x-csrf-token` on protected `POST` requests, including create, update, and delete.
3. Include the access/refresh authentication cookies; use a new CSRF token after login or token rotation.
4. Let authentication, CSRF, role, and schema middleware run before the controller.

For a cookie-free API or mobile client, send `Authorization: Bearer <accessToken>`. The documented authentication middleware validates Bearer tokens; a successfully verified Bearer request avoids the cookie-based CSRF check. An invalid Bearer header never grants access. See [Browser and mobile authentication](csrf-auth.md).

```text
POST /api/items/v1/create-item
  -> AuthMiddleware
  -> CsrfMiddleware
  -> RoleValidatorMiddleware
  -> SchemaMiddleware
  -> Controller
  -> Service
  -> Repository
```

Only the authenticated account can determine the item owner. Ignore or reject attempts to assign ownership through the request body.

## 4. Example request and response

This **illustrative** resource schema deliberately uses neutral fields; the real app must define and validate its own fields.

```json
{
  "name": "Sample item",
  "description": "An example entry",
  "tags": ["Example", "Draft"]
}
```

For `POST /api/items/v1/create-item`, one possible successful response follows the documented response-envelope pattern:

```json
{
  "code": 201,
  "status": "success",
  "data": {
    "item": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "ba6c317e-c7e3-41d0-9b5f-ea63b69d5117",
      "name": "Sample item",
      "description": "An example entry",
      "tags": ["Example", "Draft"]
    }
  }
}
```

For a list response, use `data.items`; for a single-record response, use `data.item`. These keys are part of the **proposed** contract and must be matched by the implementation and frontend service types.

Suggested error handling consistent with the original documentation:

| Status | Meaning |
| --- | --- |
| `400` | Invalid input or no supported update fields |
| `401` | No valid authentication |
| `403` | Wrong role or invalid/missing CSRF token |
| `404` | Record does not exist or is not accessible to the caller |
| `500` | Unexpected server error; avoid exposing internal details |

For updates, accept only supported fields and reject empty updates. Never trust a TypeScript type as runtime validation; validate the request with Zod or equivalent middleware.

## 5. Restrict database access by owner

For example, a repository update should filter by **both** the resource ID and the authenticated user's ID:

```ts
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";

// Illustrative code to place inside an async repository method.
const [updatedItem] = await db
  .update(items)
  .set({ name: "Renamed item" })
  .where(and(eq(items.id, itemId), eq(items.userId, userId)))
  .returning();
```

`items`, `itemId`, and `userId` must be declared by your own schema and method. Use the same ownership restriction for reads and deletes. `get-all-items` must be guarded separately as an administrator action. Do not rely on a client-supplied `userId`.

## 6. Implementing or renaming a feature

If adapting an existing feature into **items**, complete the changes across the actual codebase; changing only paths in a Markdown file is insufficient.

1. Update route registration and imported route/controller/service/repository symbols.
2. Define the item Zod schemas and supported input fields.
3. Update the database schema, foreign keys, ownership indexes, and queries as needed.
4. Generate and **review** migrations; account for existing data and dependent IDs before applying them.
5. Update frontend service URLs, TypeScript types, route links, and response keys.
6. Rename or adapt tests and run success, validation, role, ownership, CSRF, and not-found cases.
7. Verify existing sessions and authentication behavior after the change.

**Migration caution:** The source feature documentation described migrations that were prepared but **not applied**. Do not reuse or rename old migration SQL blindly, and do not assume this new example's tables exist. Inspect your actual schema and migration history first.

### Verification checklist

- As a `USER`, create an item and list only your own items.
- As another `USER`, confirm that reading, updating, and deleting the first user's item is denied.
- As a `USER`, verify the administrator-only list rejects access with `403`.
- As an `ADMIN`, verify administrator access according to the implemented role policy.
- For cookie-based POST requests, verify CSRF rejection without a valid token.
- For cookie-free requests, verify that only a valid Bearer token authenticates.
- Confirm update/delete responses and the resulting database state are consistent.

See [Express.js API Setup Tutorial](expressjs-api-setup-tutorial.md) for project structure and database setup, and [Browser and Mobile Authentication](csrf-auth.md) for token handling.
