# Employee Leave Management System

Full-stack MERN project implementing employee leave requests, manager approvals, and admin user/role management.

## Live Demo

- Frontend (Vercel): https://employee-leave-management-system-fr.vercel.app/
- Backend API (Render): https://employee-leave-management-system-backend-4s8y.onrender.com/
- Health Check: https://employee-leave-management-system-backend-4s8y.onrender.com/api/health

## Tech Stack

- Frontend: React + Tailwind CSS
- Routing: React Router
- State Management: Context API
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT
- Authorization: Role-based access control (`admin`, `manager`, `employee`)

## Features

- JWT login/register
- Protected routes on frontend and backend
- Role-based dashboards
- Leave application form
- Leave approval/rejection workflow
- Leave status tracking (`pending`, `approved`, `rejected`)
- Admin user CRUD and role assignment
- Request validation and error handling

## Folder Structure

```text
employee-leave-management/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      seeder/
      utils/
      validators/
  frontend/
    src/
      api/
      components/
      context/
      pages/
```

## Setup

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set values in `.env`:
- `MONGO_URI`
- `JWT_SECRET`
- optional `JWT_EXPIRES_IN`

Run backend:

```bash
npm run dev
```

Optional seed admin:

```bash
npm run seed:admin
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Default API URL:
- `VITE_API_BASE_URL=http://localhost:5000/api`

## Test Credentials (example)

- Admin: `admin@company.com` / `Admin@123` (if seeded)
- Employee/Manager: Create via register/admin panel

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/leaves`
- `GET /api/leaves/my`
- `GET /api/leaves/summary/my`
- `GET /api/leaves/review-queue`
- `PATCH /api/leaves/:id/status`
- `GET /api/users` (admin)
- `POST /api/users` (admin)
- `PATCH /api/users/:id/role` (admin)
- `DELETE /api/users/:id` (admin)

## Required Screenshots for Submission

Add these images in your GitHub README:
- Login page
- Employee dashboard
- Manager approval dashboard
- Admin panel

## Deployment Guide

Deploy backend and frontend separately for best reliability.

### 1) Deploy Backend (Render/Railway/other Node host)

1. Create a new Web Service from `backend/`.
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables:
   - `PORT` is auto-provided by Render (do not hardcode in Render env)
   - `MONGO_URI=<your mongo connection string>`
   - `JWT_SECRET=<strong random secret>`
   - `JWT_EXPIRES_IN=1d`
   - `CORS_ORIGIN=<your frontend URL>` (for multiple origins, separate by comma)
   - `ADMIN_EMAIL=<optional>`
   - `ADMIN_PASSWORD=<optional>`
5. Deploy and verify health endpoint:
   - `https://<your-backend-domain>/api/health`

### 2) Deploy Frontend (Vercel/Netlify)

1. Create a new project from `frontend/`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>/api`
5. Deploy.

Notes:
- `frontend/vercel.json` is included so React routes like `/admin` and `/employee/history` work after refresh on Vercel.
- Frontend API client now supports env-based URL and defaults to `/api` if `VITE_API_BASE_URL` is not set.

### 3) Final Post-Deploy Check

1. Open frontend URL and register/login.
2. Verify role-based pages load.
3. Create a leave request and review it from manager account.
4. Check browser Network tab for `401`/CORS errors.
5. If CORS errors appear, update backend `CORS_ORIGIN` to exactly match your deployed frontend domain.
