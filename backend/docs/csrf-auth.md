# Browser and Mobile Authentication

This guide describes the authentication and CSRF patterns documented for the Express API. Its resource examples use the neutral **items** feature from [Items API](items-api.md). Item paths are **proposed examples**, not proof that an existing server already exposes them. The `/api/auth/v1/...` routes below come from the source project's documented authentication flow.

Login returns access and refresh tokens in the API response's `data` object and sets HttpOnly authentication cookies. **Browsers** normally use cookies. **Mobile and cookie-free clients** should keep returned tokens in secure storage and avoid sending authentication cookies.

## 1. Browser flow (cookies)

1. `GET /api/auth/v1/csrf-token` with `credentials: "include"`; keep `data.csrfToken` in memory.
2. `POST` login or signup with `credentials: "include"` and an `x-csrf-token` header.
3. After a successful login, get another CSRF token because it is bound to the new authentication cookies.
4. Send cookies and `x-csrf-token` for protected state-changing requests (for example, creating/updating/deleting an item), refresh, and logout. Safe `GET` requests do not require a CSRF header in this documented flow.
5. After authentication refresh, fetch a **new** CSRF token before the next protected POST. After logout, obtain a fresh token before another browser login.

```ts
const apiBaseUrl = "http://localhost:7000/api";

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/auth/v1/csrf-token`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch CSRF token (${response.status})`);
  }

  const result: { data?: { csrfToken?: unknown } } = await response.json();
  const token = result.data?.csrfToken;
  if (typeof token !== "string" || !token) {
    throw new Error("CSRF token missing from response");
  }
  return token;
}

async function login(email: string, password: string): Promise<string> {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${apiBaseUrl}/auth/v1/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed (${response.status})`);
  }

  // Return the token bound to the new cookie session.
  // The caller should keep it in the shared auth/HTTP client's memory.
  return getCsrfToken();
}
```

In a real frontend, store the token returned by `login()` in a shared memory-based auth/HTTP client. The example omits token persistence across calls and refresh coordination; see the [frontend guide](frontend-structure-and-api-guide.md) for the larger Axios/Context pattern.

For an **illustrative** items API, a browser POST would use the same cookie and CSRF header options:

```ts
const csrfToken = await getCsrfToken();
await fetch(`${apiBaseUrl}/items/v1/create-item`, {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "x-csrf-token": csrfToken,
  },
  body: JSON.stringify({ name: "Example item" }),
});
```

This second example fetches a CSRF token for the current cookie session. A real client can reuse its valid in-memory token until authentication changes. A CSRF failure is documented as HTTP `403` with `Invalid or missing CSRF token`. Configure CORS to allow the browser's exact origin. Production cookies require HTTPS.

## 2. Mobile and cookie-free clients

- **Login/signup:** Submit credentials as JSON without cookies or browser Origin/Referer/Fetch Metadata headers. Under the documented middleware behavior, this flow does not require a CSRF token.
- **Protected items:** Send `Authorization: Bearer <accessToken>`. Middleware validates Bearer authentication before CSRF middleware skips its cookie check. Invalid Bearer tokens are **not** accepted.
- **Refresh/logout:** Submit `{ "refreshToken": "..." }` as JSON without cookies. The CSRF middleware verifies the token signature/type before allowing this cookie-free path, and services still enforce database checks.
- **Do not mix flows:** If a request sends authentication cookies to refresh/logout, it must include CSRF protection even if it also includes Bearer or body tokens. Disable automatic cookie storage/sending for the mobile token flow.

Persist tokens only in storage appropriate to the platform, and never log credentials or token values.

## 3. Middleware order

For a protected, state-changing resource request, the documented middleware flow is:

```text
Route
  -> AuthMiddleware
  -> CsrfMiddleware
  -> RoleValidatorMiddleware
  -> SchemaMiddleware
  -> Controller
  -> Service
  -> Repository
```

CSRF protection is different from role authorization and record ownership. Verify all three independently. The CSRF route uses `AuthController` and `get-csrf-token-service.ts` and does not need database access; the documented setup uses a signed double-submit cookie.

## 4. Environment and verification

Use a separate, secret, consistent `CSRF_SECRET` across production server instances. For example:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The source setup generates a random development secret when none is configured, so restarting the API may require fetching a new CSRF token. Keep application secrets on the backend, never in `VITE_` variables.

Run the documented database-free CSRF tests if the original source tree and test files are present:

```bash
npx tsx --test src/tests/csrf.test.ts
```

Also test: missing/invalid CSRF header, cross-origin CORS rejection, token rotation, logout, and cookie-free Bearer requests.
