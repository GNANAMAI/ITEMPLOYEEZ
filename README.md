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
| `/admin/login` | Admin login (sample: `admin@itemployeez.com` / `Admin@12345`) |
| `/admin/dashboard` | Full admin CMS (banners, products, candidates, payments, …) |
| `/sub-admin/*` | Redirects to `/admin/*` |

## User Workflow

1. **Login / Sign up** → redirected to IT Products
2. **Browse companies** at `/it-apps`
3. **Select a company** → `/product/{id}` shows products under that company
4. **Product details** → `/product-details/{slug}` with description and Subscribe CTA
5. **Checkout** → `/subscription-checkout/{slug}` (₹99/year, Razorpay)
6. **Community access** → `/community-subscribe?product={slug}` after payment

Without Razorpay keys, checkout runs in **mock mode** (instant activation for testing).

## Razorpay Notes

- **Without Razorpay keys:** checkout shows a **demo Razorpay modal** (Test Mode) so you can walk through the payment UI locally.
- **With keys:** add test/live keys to `backend/.env` and `frontend/.env`, create a ₹99/year plan in the Razorpay dashboard, and set `RAZORPAY_PLAN_YEARLY` + `VITE_RAZORPAY_KEY_ID`.
- Webhook URL: `POST /api/subscriptions/webhooks/razorpay`

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
