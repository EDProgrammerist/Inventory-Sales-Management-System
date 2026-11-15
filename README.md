# Shenban — Electronics Store and Admin Dashboard

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)


Shenban is an HCI and OOP school project for browsing electronics, placing demo orders, and managing a store. The catalog focuses on iPhones, graphics cards, and PlayStation 5 consoles. Prices are in Philippine pesos (PHP).

**Payments and deliveries are simulated.** Placing an order saves it in the database, but does not charge a card or arrange a delivery.

## Features

- **Storefront:** browse products, search and filter the catalog, view product details and images, and manage a cart.
- **Customer accounts:** sign up, sign in, complete checkout, view saved orders, and cancel eligible orders.
- **Checkout:** select an address, choose a shipping preference, and place an order using a demo card.
- **Admin dashboard:** view order summaries, stock information, and simulated sales.
- **Catalog management:** add, view, edit, publish, hide, and delete products; manage prices, images, and stock.
- **Order management:** review customer orders and move them through confirmation, processing, shipping, and delivery.
- **Store management:** manage suppliers and store branches, view reports, and export supported data as CSV.

## Demo Accounts

These are the accounts used for the project demo. Their roles and passwords were checked against the configured database on November 15, 2026.

| Role | Email | Password | Use |
|---|---|---|---|
| Admin | `admin@gmail.com` | `demo123!` | Dashboard, products, orders, reports, suppliers, and stores |
| Customer | `demo@user.com` | `demo123!` | Shopping, checkout, and personal orders |

Sign in at [localhost:5173/login](http://localhost:5173/login). Passwords are case sensitive. These credentials are for demonstration only.

The accounts belong to the configured database; cloning this repository or running migrations does **not** create them. If you use a new database, follow the account setup below.

## How to Demo

### Before presenting

1. Start the backend and frontend using the setup instructions below.
2. Open [localhost:5173](http://localhost:5173).
3. Keep the customer in a normal browser window and the admin in a private/incognito window. This keeps the two sign-ins separate.
4. Make sure at least one product is published and available. If needed, sign in as admin, open `/inventory`, edit a product, set its demo stock to `10`, and save it. Use a demo database for presentation changes.

### 1. Show the customer shopping flow

1. Open the homepage and browse the products without signing in.
2. Open the product list, try a search or category filter, and select a product.
3. Show its details, add **one item** to the cart, and open the cart.
4. Continue to checkout. If signed out, the app opens the sign-in page.
5. Sign in with `demo@user.com` / `demo123!`. The app returns you to checkout and keeps your cart.
6. On the address page, click **Add New Address**. Enter demo details, save the address, select it, and click **Next**.
7. Choose **Standard** shipping and click **Next**.
8. Enter the test card details below and click **Place demo order**.
9. Open [My orders](http://localhost:5173/account/orders) and show the saved order and its status. Note its order ID for the admin demo.

| Payment field | Demo value |
|---|---|
| Cardholder name | `Demo Customer` |
| Card number | `4242 4242 4242 4242` |
| Expiration date | `12/30` (or another future month in `MM/YY` format) |
| CVV | `123` |

Use fictional address details and the test card above. No real card is needed. Avoid reloading during address and shipping entry because these selections are held in the current browsing session.

### 2. Show the admin order flow

1. In the private/incognito window, open [the login page](http://localhost:5173/login).
2. Sign in with `admin@gmail.com` / `demo123!`. The admin dashboard opens.
3. Open [Customer orders](http://localhost:5173/orders) and click **Refresh orders**.
4. Find the customer's new order using its ID or customer email, then click **Review order**.
5. Click **Confirm order**, then **Start processing**, then **Mark shipped**, then **Mark delivered**. Reopen the order as needed to show each next action.
6. Return to the customer's **My orders** page and reload it to show the updated status.
7. Open the admin **Dashboard** and **Reports** to show the order summaries and demo sales.

### 3. Show product and store management

1. Open [Inventory](http://localhost:5173/inventory).
2. Click **View** on a product to show its details.
3. Click **Edit**, change a demo product's price or stock, and save. Open the storefront and reload to show the saved change.
4. To show creation, click **Add product**, complete the form, enable **Published**, and save. Use a unique product ID such as `demo-iphone`.
5. Open **Suppliers** and **Manage Store** to show their records and forms.
6. If showing deletion, use a temporary demo record and demonstrate the confirmation dialog.

**Optional cancellation demo:** place a second order, open it in the customer's **My orders**, and choose **Cancel demo order**, then **Confirm cancellation**. Cancel before it is shipped. Reserved stock is restored on cancellation; only cancelled orders can be deleted from the admin order list.

## Tech Stack

| Part | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express MVC (Model–View–Controller), TypeScript |
| Database | PostgreSQL with Drizzle ORM and migrations |
| Authentication | bcrypt password hashing, JWT sessions, HTTP-only cookies, CSRF protection |
| Validation | Zod on the backend |
| Tests | Node.js test runner; tsx for backend TypeScript tests |

The React frontend calls the Express API, which follows an **MVC (Model–View–Controller)** structure: `models/` defines application data types, `views/` formats JSON responses, and `controllers/` handles HTTP requests and responses. Routes connect endpoints to controllers, while services contain application logic and repositories handle database access. The API validates requests, checks account permissions, and reads or writes PostgreSQL records. Admin pages require an `ADMIN` account; public registration creates a `USER` account.

## Local Setup

### Requirements

- Node.js **24 or newer** and npm.
- A running PostgreSQL database and its connection URL.
- Two terminals: one for the backend and one for the frontend.

Run the following commands in PowerShell from the project root. If `.env` files already exist, edit them instead of copying over them.

### 1. Install dependencies

```powershell
cd backend
npm ci
cd ../frontend
npm ci
cd ..
```

### 2. Configure the environment

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

In `backend/.env`, set your own PostgreSQL URL and keep these local settings:

```dotenv
APP_NAME=Shenban API
PORT=7000
NODE_ENV=development
BACKEND_URL=http://localhost:7000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/shenban
JWT_SECRET=
CSRF_SECRET=
```

Create the `shenban` database first, or use the name of an existing dedicated project database in the URL. The migration command creates tables, not the database itself. Blank secrets generate temporary development secrets, so restarting the backend may require signing in again. Production requires separate private random secrets of at least 32 characters each.

In `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:7000/api
```

### 3. Create the database tables

```powershell
cd backend
npm run db:migrate
npm run db:check
```

### 4. Prepare accounts on a new database only

Skip this step when using the existing demo database.

From the `backend` folder, create the demo admin:

```powershell
'{"email":"admin@gmail.com","password":"demo123!"}' | npm run db:seed-admin
```

This command creates an admin account without inserting business records. It refuses to overwrite an existing account with a different role or password.

After starting the app, open [Sign up](http://localhost:5173/signup) and create the customer using the name `Demo Customer`, email `demo@user.com`, and password `demo123!`. Public sign-up cannot create an admin.

A new database also starts without catalog products. Sign in as admin and use **Inventory → Add product** to create a published demo product with a positive price and stock. The catalog import script replaces business data and is not required for this setup.

### 5. Start the app

**Terminal 1 — from the project root:**

```powershell
cd backend
npm run dev
```

**Terminal 2 — from the project root:**

```powershell
cd frontend
npm run dev
```

Leave both terminals running.

| Service | Address |
|---|---|
| Storefront | [localhost:5173](http://localhost:5173) |
| Sign in | [localhost:5173/login](http://localhost:5173/login) |
| Admin dashboard | [localhost:5173/dashboard](http://localhost:5173/dashboard) |
| API health | [localhost:7000/api/health](http://localhost:7000/api/health) |

## Repository Structure

```text
HCI and OOP/
├── frontend/
│   ├── src/
│   │   ├── assets/          # Product images and other visual assets
│   │   ├── components/      # Shared UI, forms, layouts, and providers
│   │   ├── data/            # Data types and shopping/checkout helpers
│   │   ├── pages/           # Storefront, checkout, and admin pages
│   │   ├── services/        # API clients
│   │   └── app-routes.tsx   # Public and protected routes
│   └── tests/
├── backend/
│   ├── src/
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Application logic
│   │   ├── repositories/   # Database access
│   │   ├── middlewares/    # Authentication and request protection
│   │   ├── schema/         # Request validation
│   │   └── db/             # Database connection and table definitions
│   ├── drizzle/            # SQL migrations
│   ├── scripts/            # Database checks and account setup
│   └── tests/
├── render.yaml             # Backend Render deployment configuration
└── README.md
```

## Checks and Builds

Run from `frontend`:

```powershell
npm test
npm run lint
npm run build
```

Run from `backend`:

```powershell
npm test
npm run lint
npm run build
```

For a built backend, `npm start` runs the compiled server. For a local frontend build preview, run `npm run preview` from `frontend`.

## Deploy the Backend to Render

This repository has separate `frontend` and `backend` folders. For the backend web service, open **Render → Settings → Build & Deploy** and use:

| Setting | Value |
|---|---|
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run db:migrate && npm start` |
| Health Check Path | `/api/health` |

The build command follows the class reference. Its `npm start` command is also used here, after applying database migrations. If migrations are applied separately before starting the service, the Start Command can be just `npm start` as shown in the class screenshot.

Set these in Render's **Environment** settings:

| Variable | Value |
|---|---|
| `NODE_VERSION` | `24` |
| `NODE_ENV` | `production` |
| `APP_NAME` | `Shenban API` |
| `DATABASE_URL` | Your deployed PostgreSQL connection URL |
| `FRONTEND_URL` | Your deployed frontend origin, without a trailing slash |
| `BACKEND_URL` | Your Render service origin, without a trailing slash |
| `JWT_SECRET` | A private random secret of at least 32 characters |
| `CSRF_SECRET` | A different private random secret of at least 32 characters |

Use the actual deployed URLs rather than the local development addresses. Keep database credentials and secrets in Render's environment settings.

**If Render reports `npm error code EUSAGE` and says it needs a lockfile:**

1. Set **Root Directory** to `backend`. There is no `package-lock.json` at the repository root.
2. Check that the GitHub branch and commit used by Render contain both `backend/package.json` and `backend/package-lock.json`.
3. Save the settings and choose **Manual Deploy → Deploy latest commit**.

The backend lockfile is already included in this repository. Keep `npm ci`; it should run inside the backend folder. See [Render's monorepo documentation](https://render.com/docs/monorepo-support) and [npm ci requirements](https://docs.npmjs.com/cli/npm-ci/).

## Troubleshooting

| Problem | What to do |
|---|---|
| Port 5173 is already in use | Stop the other app using 5173, then restart the frontend. Vite is configured to require this port. |
| Login or products fail to load | Check that the backend is running on 7000, the database URL is correct, and migrations have been applied. A health response alone does not prove database access works. |
| Demo credentials do not work | Confirm that you are connected to the demo database. On a new database, create the accounts using the steps above. |
| Login succeeds but admin pages are blocked | Use the admin account. Customer sign-up creates a `USER` role. |
| The storefront is empty | Add a product in Inventory and enable Published. |
| Checkout reports insufficient stock | Reduce the cart quantity or update the demo stock in Inventory. Zero stock means out of stock; blank stock means stock is not recorded. |
| Checkout asks for an address again | Address and shipping selections reset on reload. Enter them again and continue without refreshing. |
| An order does not appear in the admin window | Click Refresh orders and check that filters are not hiding it. |

Google sign-in and password recovery are currently unavailable. Use email/password sign-in for the demo. Sales reports represent simulated orders; they do not represent real payments, costs, or profit.
