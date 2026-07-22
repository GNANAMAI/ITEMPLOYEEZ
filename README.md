# IT Employeez — Full Stack Application

Modern redesign of [itemployeez.com](https://itemployeez.com/) built with **React + FastAPI + SQLite**.

## Project Structure

```
IT_employeez/
├── backend/          # FastAPI API + SQLite database
├── frontend/         # React (Vite + TypeScript) UI
└── itemployeez_site_report.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+

## Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies (you install manually)
pip install -r requirements.txt

# Copy environment file and edit values
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Start API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs  
Health check: http://localhost:8000/api/health

### Backend Environment Variables

See [`backend/.env.example`](backend/.env.example):

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CORS_ORIGINS` | Frontend URLs (comma-separated) |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth (optional) |
| `RAZORPAY_*` | Razorpay payment keys (optional — mock mode without keys) |
| `SUBADMIN_EMAIL/PASSWORD` | Default sub-admin account |

**Default sub-admin:** `admin@itemployeez.com` / `Admin@12345`

## Frontend Setup

```bash
cd frontend

# Install dependencies (you install manually)
npm install

# Copy environment file
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Start dev server
npm run dev
```

App: http://localhost:5173

### Frontend Environment Variables

See [`frontend/.env.example`](frontend/.env.example):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key |
| `VITE_GOOGLE_AUTH_URL` | Google OAuth start URL |
| `VITE_PHONE_NUMBER` | Contact phone |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number |
| `VITE_CONTACT_EMAIL` | Contact email |

## Features

- All pages from live site (Home, About, Products, Community, Services, Contact, Legal, Auth, Sub-Admin)
- Modern professional UI theme for IT professionals
- JWT authentication + Google OAuth + Forgot password
- Razorpay subscription (mock mode when keys not configured)
- 17 product categories seeded from live site
- Contact form with sub-admin dashboard

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, products, pricing, CTAs |
| `/about` | About Us |
| `/it-apps` | IT Products catalog |
| `/product/:id` | Product category |
| `/product-details/:slug` | Featured product detail |
| `/community-subscribe` | Gated community (login + subscription) |
| `/services` | Our Services |
| `/service-details/:slug` | Service detail |
| `/contact` | Contact form |
| `/login`, `/signup` | Authentication |
| `/candidate/forgot-password` | Password reset |
| `/terms-conditions`, `/privacy-policy`, `/cancel-policies`, `/disclaimer` | Legal |
| `/sub-admin/login`, `/sub-admin/dashboard` | Sub-admin portal |

## Razorpay Notes

- Without Razorpay keys, subscription runs in **mock mode** (activates membership locally for testing).
- With keys, add Razorpay plan IDs to `.env` and set webhook to `POST /api/subscriptions/webhooks/razorpay`.

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Serve `frontend/dist` via Nginx or similar, proxy `/api` to FastAPI.
