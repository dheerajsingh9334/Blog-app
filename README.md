# MERN Blog Platform

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/react-18-blue)
![Express](https://img.shields.io/badge/express-4-lightgrey)
![MongoDB](https://img.shields.io/badge/mongoDB-6-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

Monorepo for a production‑ready blog platform where creators publish, grow an audience, and monetize. It includes an analytics‑driven admin portal, subscription plans with Stripe, notifications, and scheduled publishing.

The repo contains two apps:

- `backend/`: Express + Mongoose REST API
- `frontend/`: React + Vite SPA

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Quick Start

1) Backend

```bash
cd backend
npm install

# Configure environment
copy .env.example .env  # create .env and set values (see below)

npm start
```

The API runs on `http://localhost:5000`.

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

The web app runs on `http://localhost:5173`.

## Backend

### Environment variables (`backend/.env`)

Required keys (example):

```
MONGO_URL=mongodb://localhost:27017/mern_blog
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxx
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=example@example.com
EMAIL_PASS=app_password
```

### Scripts

```bash
npm start                         # start API on port 5000
npm run seed:plans                # seed subscription plans
npm run create:admin              # create an admin user (interactive/utility)
npm run check:admins              # list/check admin users
npm run create:test-admin         # create a test admin
npm run create:admin-collection   # setup admins collection user
npm run setup:admin               # helper script to bootstrap admin
npm run test:broadcast            # fix/diagnose broadcast notifications
```

### API Highlights

- Auth (users and admins)
- Posts, Comments, Categories
- Plans, Payments (Stripe)
- Notifications, Earnings

Routers are mounted at `/api/v1/*` (see `backend/server.js`).

## What this project does

This platform enables creators to publish posts, manage content, and grow an audience while offering admin tools and monetization:

- User features: authentication, post creation/editing/scheduling, search, trending, saved posts, followers/following, notifications, profile, dark mode.
- Plans and payments: subscription plans, upgrade prompts, Stripe checkout and success flows.
- Admin portal: dashboard analytics, manage users/posts/comments/categories, system settings, notifications, and plan management.
- Operational tasks: cron to auto‑publish scheduled posts and compute monthly earnings.

## Why this project stands out (vs typical blog apps)

- Analytics-first admin portal: rich charts (Recharts) for trends, user growth, category distribution, and engagement.
- Subscription tiers and plan-aware UI: features like post limits, upgrade prompts, and Stripe checkout integrated end-to-end.
- Operational tooling baked-in: cron jobs auto-publish scheduled posts and compute monthly earnings.
- Robust data layer: React Query for network/cache + Redux Toolkit (with persist) for auth/session and plan usage.
- Comprehensive notifications: multiple types with deep links; admin broadcast support in the backend.
- Role-based access: guarded admin routes and polished `AdminGlobalLayout` for navigation, search, and notifications.
- Production-ready patterns: rate limiting, cookie parsing, structured routers/controllers, and environment-driven config.
- Modern UX: Tailwind CSS, dark mode, responsive layouts, and accessible components.

## For recruiters and reviewers

- Skim these entry points:
  - Backend: `backend/server.js` (routers, middlewares, cron), `backend/controllers/*`, `backend/router/*`
  - Frontend: `frontend/src/main.jsx`, `frontend/src/App.jsx` (routing and guards)
  - State: `frontend/src/redux/slices/*`, `frontend/src/redux/store/store.js`
  - Admin UI: `frontend/src/components/Admin/*`
  - API calls: `frontend/src/APIServices/*`
- 5‑minute demo:
  1. Start API (`cd backend && npm i && npm start`)
  2. Start app (`cd frontend && npm i && npm run dev`)
  3. Register user → create posts → try scheduling
  4. Explore `/admin/*` after creating an admin via backend scripts
- Screenshots live in `frontend/public/screenshots` and are linked below.

## Frontend

React 18 + Vite + Tailwind CSS + React Query + Redux Toolkit.

### Scripts

```bash
npm run dev       # start dev server (5173)
npm run build     # production build
npm run preview   # preview production build
npm run lint      # run eslint
```

### Configuration

- API base URL: `frontend/src/utils/baseEndpoint.js`
- Admin views live under `frontend/src/components/Admin/*`

### Tech stack

- React 18, React Router, Redux Toolkit (+ persist), React Query
- Tailwind CSS, Headless UI, Heroicons, React Icons
- Recharts for analytics visualizations

## Development Notes

- CORS is configured to allow `http://localhost:5173` in `backend/server.js`.
- A cron runs every minute to publish scheduled posts and a monthly job computes earnings.
- Stripe publishable key is used on the frontend via `Elements`; set your own keys for production.

## Screenshots

Place screenshots under `frontend/public/screenshots` and reference them here. Example:

```markdown
![Home](./frontend/public/screenshots/home.png)
![Admin Dashboard](./frontend/public/screenshots/admin-dashboard.png)
```

If you just took screenshots, drop them into that folder and rename the links above to match your filenames.

## Repository structure

```
mern Blog/
  backend/               # Express API (routers, controllers, models, utils)
  frontend/              # React app (components, API services, redux, hooks)
  README.md              # You are here
```

High‑signal paths:

- Backend routers: `backend/router/*`
- Backend controllers: `backend/controllers/*`
- Models: `backend/models/*`
- Cron + server wiring: `backend/server.js`
- Frontend routing: `frontend/src/App.jsx`
- Admin UI: `frontend/src/components/Admin/*`
- API calls: `frontend/src/APIServices/*`

## Cleanup Performed

Removed unused/legacy frontend components and a stray backend file to keep the codebase lean:
If you rely on any of the removed components, restore them from version control.

Also removed backend testing/helper files as requested: `backend/test*.js`, `backend/utils/testBackend.js`, `backend/scripts/testAdmin.js`.

## Deploy

- Frontend: build with `npm run build` and deploy `frontend/dist` to Netlify/Vercel.
- Backend: deploy to Render/Fly/Heroku. Set env vars from the Backend section. Allow frontend origin in CORS.

## Contributing

Issues and PRs are welcome. Please open an issue describing the change you propose. For larger changes, include context, screenshots, and rationale.

## License

ISC (c) Masynctech coding school and contributors


