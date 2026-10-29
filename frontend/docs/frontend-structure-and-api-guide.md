# Frontend Structure and API Guide

This guide explains a reusable way to organize a React + TypeScript + Vite frontend and connect it to an API. It builds on the architecture documented for `appsdev-api-tutorial` without tying the frontend structure to a particular application domain.

It assumes you can already create and run a React project. Paths and feature names marked as examples are patterns to adapt, not claims that those files or endpoints already exist.

## 1. Organize the source folders

```text
src/
├── assets/                    # Images and static files imported by components
├── components/
│   ├── common/                # Application UI shared across features
│   ├── context/               # Context providers, shared state, and related hooks
│   ├── features/
│   │   ├── auth/              # Sign-in and sign-up feature components
│   │   └── <feature-name>/    # Components for another domain-specific feature
│   └── ui/                    # Reusable primitives: Button, Input, Modal, Table, etc.
├── lib/                       # Shared utilities and configured HTTP client
├── pages/
│   ├── auth/                  # Authentication pages and layout
│   └── <route-name>/          # Route-level composition for other pages
├── services/                  # API calls and response handling
├── styles/                    # Global styles and Tailwind entry point
├── types/                     # Shared TypeScript types
└── main.tsx                   # App entry point, providers, and routes
```

The `<feature-name>` and `<route-name>` entries are placeholders. Add folders when the application actually needs them.

### Pages: compose routes

A page represents a route. It arranges the layout, headings, navigation, account actions, and feature components for that screen. Keep most domain-specific behavior out of pages so the route composition stays readable.

For instance, a login page may compose a `Card`, `AuthFormHeader`, `LoginForm`, and a sign-up link.

### Features: own a task

A feature component manages one area of functionality: inputs, request state, error messages, dialogs, and callbacks. An authentication form, for example, owns its form values and submission feedback. A data-list feature may fetch records, show an empty state, and refresh when an action succeeds.

Use descriptive names and named functions such as `async function handleSubmit()` to make the execution flow easy to follow.

### Common: share application-level UI

Use `components/common` for components shared across multiple features, such as `PageHeader` or an application navigation bar. Keep feature-specific headings and panels inside their feature folder.

### UI: reuse primitives

Before building a button, input, select, modal, or table, look in `components/ui`. These components accept props and render UI; they should not call API endpoints or manage authentication directly.

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

The `@/` prefix is a project-local import alias. Configure it as described next rather than assuming it works automatically.

## 2. Configure the `@/` path alias

A path alias keeps imports readable when files are nested deeply.

```tsx
// Without an alias
import { Button } from "../../../components/ui/button";

// With the @/ alias
import { Button } from "@/components/ui/button";
```

Both imports refer to a file under `src/`. You need **two configurations**: Vite must resolve the import when running or building, and TypeScript must understand it during type checking and editor navigation.

### Step 1: Set the alias in `vite.config.ts`

```ts
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

Merge `resolve.alias` into your existing Vite configuration; do not remove other plugins or options. This example uses Vite's React plugin and Node's URL utilities.

### Step 2: Set the alias in the application TypeScript config

In a standard Vite React + TypeScript project, edit `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Merge** these properties into the existing `compilerOptions` rather than replacing the whole file. If your project does not use `tsconfig.app.json`, put them in the TypeScript config that checks your application code (often `tsconfig.json`). If your config already has `paths` entries, preserve them.

`tsconfig.app.json` is assumed to be in the project root beside `src/`. If your config lives elsewhere, adjust the relative target accordingly.

### Step 3: Use and verify it

```tsx
import { http } from "@/lib/axios";
import { Button } from "@/components/ui/button";
```

Restart the Vite dev server after changing the config. If your editor still flags the import, restart its TypeScript language service. If `node:url` cannot be resolved in `vite.config.ts`, ensure Node type definitions are installed and available to the configuration TypeScript project.

The alias changes **source-code imports only**. It does not change browser URLs, React Router paths, API endpoints, or the value of `VITE_API_BASE_URL`.

## 3. Understand the request flow

```text
Page -> Feature component -> Service function -> Shared Axios client -> API
                          <- Returned data or error                 <-
```

The page composes the screen. The feature decides when to request data and how to display it. The service knows the HTTP method, endpoint, payload, and expected response. The shared Axios client handles base URL configuration and, where needed, credentials, CSRF headers, and authentication refresh.

For authentication, a form can call `login()` from shared React Context instead of directly manipulating the global user state. The context action uses an authentication service, which communicates through the shared HTTP client.

## 4. Connect the frontend to an API

Place the frontend `.env` file at the **project root**, beside `vite.config.ts`:

```env
VITE_API_BASE_URL=http://localhost:7000/api
```

In the documented setup, `src/lib/axios.ts` reads `import.meta.env.VITE_API_BASE_URL` and reports a missing value rather than silently using another server. Restart Vite after modifying `.env`.

The base URL already includes `/api`. For example, an authentication request to `/auth/v1/session` targets:

```text
http://localhost:7000/api/auth/v1/session
```

The backend must be reachable and configured. When it uses credentialed cross-origin requests, its allowed frontend origin (documented as `FRONTEND_URL`) must match the actual browser origin, commonly `http://localhost:5173`. `localhost` and `127.0.0.1` are different hostnames, so use them consistently.

Variables prefixed with `VITE_` are exposed to browser code. Store only **public** settings there; database passwords, JWT signing secrets, and server-side CSRF secrets belong on the backend.

## 5. Keep API code in services

Create service functions in `src/services`. The documented naming convention uses a `Service` suffix. Reuse the configured Axios instance from `src/lib/axios.ts`.

```ts
import { http } from "@/lib/axios";

// Illustrates an endpoint documented by the existing backend.
// Adapt the return shape to the API's actual session response.
export async function getSessionService(): Promise<unknown> {
  const response = await http.get<unknown>("/auth/v1/session");
  return response.data;
}
```

The example returns `unknown` until the endpoint response has been verified and typed; do not assume an undocumented response shape. Axios puts the response body in `response.data`. Some APIs also wrap their useful data inside a `data` property. The following is an **illustrative envelope**, not a claim about the session endpoint's exact payload:

```json
{
  "code": 200,
  "status": "success",
  "data": {
    "items": []
  }
}
```

For that envelope, `response.data.data.items` accesses the `items` array: the first `.data` is Axios's response body and the second is the API's envelope field. A service should return only what its callers need, after checking the actual API contract.

TypeScript annotations describe expected data but do **not** validate server responses at runtime. Add runtime validation when the API is untrusted or strict data guarantees are important. Axios rejects unsuccessful HTTP statuses by default; components should handle errors and show useful feedback.

### Handle loading, errors, and cleanup in a feature

The following pattern is intentionally generic. Replace `loadItemsService` and the state setters with those belonging to your feature:

```tsx
useEffect(function fetchItems() {
  let active = true;

  async function loadItems() {
    try {
      const items = await loadItemsService();
      if (active) {
        setItems(items);
        setError(null);
      }
    } catch {
      if (active) {
        setError("Unable to load data. Please try again.");
      }
    } finally {
      if (active) {
        setIsLoading(false);
      }
    }
  }

  void loadItems();

  return function cleanup() {
    active = false;
  };
}, []);
```

This is an effect body, not a complete component. It assumes state and service imports are defined elsewhere, the initial loading state is `true`, and that the service is stable for the lifetime of the effect. The effect stays synchronous and invokes a named async function. The cleanup avoids state updates from an obsolete request; it does **not** cancel the HTTP request. Use `AbortController` if cancellation is required and supported by the request call.

After a successful create, update, or delete operation, update React state or fetch fresh data. A successful API response by itself does not update the displayed list. A child form can expose `onSuccess` so its parent refreshes the view and closes a dialog.

## 6. Share authentication state with React Context

React Context lets components read shared state without passing it through every intermediate component. In an authenticated app, different screens may need to know whether a user is signed in, who they are, what role they have, and whether session restoration has finished.

The original guide documents the following authentication pieces:

| Name | Responsibility | Documented location |
| --- | --- | --- |
| `AuthContext` | Stores the shared authentication interface | `src/components/context/auth-state.ts` |
| `AuthProvider` | Owns user state and authentication actions | `src/components/context/auth-context.tsx` |
| `useAuth()` | Reads context state and invokes its actions | `src/components/context/use-auth.ts` |

Wrap the application routes with the provider so descendants can use its state:

```tsx
<AuthProvider>
  {/* Router and pages go here. */}
</AuthProvider>
```

This is a structural illustration; the full provider and router composition belongs in `src/main.tsx`.

### Read the shared state

```tsx
const { user, ready } = useAuth();
```

`user` represents the signed-in account or `null`. `ready` tells the UI whether the initial session check has completed; `false` is not necessarily an authentication failure. Check that `user` exists before reading properties such as `user.name`.

The documented context also exposes `login`, `signup`, and `logout`. A login form might use it as follows:

```tsx
const { login } = useAuth();

async function handleSubmit() {
  const signedInUser = await login(email, password);
  // Continue with post-login navigation or UI feedback.
}
```

The form still needs input validation, submission state, and error handling. The context stores the resulting user once; consumers then update through React.

Context state lives in application memory, not a database. A browser reload clears it, so the app must restore the session from the API. Do not store passwords or HttpOnly authentication cookies in Context or local storage.

### Documented cookie, CSRF, and refresh flow

These details describe the **existing API integration**, not requirements for every React project:

1. Login and signup go through authentication services, which obtain a CSRF token when required and submit credentials.
2. Successful login sets access-token and refresh-token **HttpOnly cookies**.
3. The service gets a CSRF token for the new cookie session and calls `/auth/v1/session` to retrieve the account.
4. `AuthProvider` saves the account and the form navigates according to the user's role.
5. The shared Axios client uses `withCredentials: true` and sends `x-csrf-token` on POST, PUT, PATCH, and DELETE requests.
6. On startup, `restoreSessionService` restores the session. When a normal protected request receives 401, the response interceptor attempts token refresh and retries the original request once.
7. Concurrent refresh attempts share one in-flight refresh operation. Authentication endpoints are excluded from automatic retries to avoid loops.
8. If refresh fails, an `auth:expired` event causes the context to clear the user.

Token cookies are not read by frontend JavaScript. CSRF tokens are handled separately in memory and invalidated when authentication changes. The backend remains responsible for authorizing every request.

## 7. Separate routes and authorization

The documented application uses React Router in `src/main.tsx`, with public authentication routes and role-protected sections:

| URL | Purpose |
| --- | --- |
| `/auth/login` | Login page |
| `/auth/signup` | Signup page |
| `/auth` | Redirect to login |
| `/user` | Authenticated user landing route |
| `/admin` | Administrator landing route |
| `/` and unmatched paths | Redirect according to session state |

These are the routes retained from the documented project; add, rename, or remove routes to fit a different app. A nested authentication layout can share branding and render child pages using React Router's `Outlet`.

A `ProtectedRoute` component can wait for session restoration, redirect unauthenticated visitors to login, and check a required role before rendering protected content. **Frontend route guards are a user-experience mechanism, not a security boundary.** The API must enforce authentication, roles, and resource permissions.

## 8. Add a new feature consistently

1. Read the backend route contract: HTTP method, path, request body, response envelope, and required permissions.
2. Add a named `...Service` function under `src/services`, using the shared `http` client.
3. Build the feature under `src/components/features/<feature-name>`; own its state, data fetching, form handling, and errors there.
4. Reuse `components/ui` primitives and promote cross-feature application UI to `components/common` when appropriate.
5. Compose the feature in a page and register the route in `src/main.tsx`; use an appropriate route guard if needed.
6. Verify loading, success, empty data, server failure, signed-out access, and unauthorized roles. After mutations, verify that displayed data reflects the change.
7. Use `@/` for imports from `src/` when it improves clarity; do not use it for API URLs or browser routes.

## 9. Troubleshoot with browser tools

Use the browser's **Network** panel to inspect the requested URL, HTTP method, payload, response status, and returned JSON. Use **Console** for JavaScript errors.

| Symptom | What to check |
| --- | --- |
| `Cannot find module '@/...'` | Both Vite and TypeScript aliases exist; the target file and casing match |
| Import works in editor but fails at runtime | `resolve.alias` in `vite.config.ts`; restart the dev server |
| Import runs but TypeScript shows an error | `compilerOptions.paths` in the correct tsconfig; restart the TypeScript service |
| Missing API URL | `VITE_API_BASE_URL` is set in the root `.env`; restart Vite |
| Network error / connection refused | Backend is running; host, port, and base URL are correct |
| CORS error | Backend's allowed frontend origin matches the browser origin |
| 401 after refresh | Session is unavailable, expired, rotated, or revoked; reauthenticate |
| 403 | Inspect the response to distinguish insufficient role permissions from a CSRF failure |
| 404 | Confirm the path, resource ID, and backend route registration |
| Data saved but UI unchanged | Confirm the mutation callback updates state or triggers a refetch |

Keep API calls out of UI primitives, and do not repeat base URLs or authentication header logic across individual components. Centralize HTTP configuration in the shared client and endpoint operations in service functions.
