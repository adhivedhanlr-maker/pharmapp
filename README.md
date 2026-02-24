# 🏥 PharmaApp — South India B2B Pharma Marketplace

## 🚀 Quick Start

### 1. Start Infrastructure (Docker)
```bash
# From project root
docker-compose up -d
```
Services started:
- **PostgreSQL** → `localhost:5432`
- **Redis** → `localhost:6379`
- **Elasticsearch** → `localhost:9200`
- **Kibana** → `localhost:5601`
- **Redis Commander** → `localhost:8081`

---

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Run Prisma migration
npx prisma migrate dev --name init

# Seed database (500k products, 3k distributors, 30k retailers)
npx ts-node prisma/seed.ts

# Start dev server (port 3001)
npm run start:dev
```

📚 Swagger API docs: http://localhost:3001/api/docs

---

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev
```

🌐 App: http://localhost:3000

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@pharma.com | admin123 |
| Distributor | dist0@pharma.com | distributor123 |
| Retailer | retailer0@pharma.com | retailer123 |

---

## 🗺️ Pages

| URL | Description |
|---|---|
| `/` | Landing Page |
| `/login` | Role-based login |
| `/register` | Multi-step registration |
| `/search` | Enterprise medicine search |
| `/checkout` | Multi-distributor cart checkout |
| `/dashboard/admin` | Admin intelligence panel |
| `/dashboard/distributor` | Distributor overview |
| `/dashboard/retailer` | Retailer orders & search |
| `/dashboard/salesman` | Salesman commission & route |

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/search?q=paracetamol` | Fuzzy medicine search |
| GET | `/api/search/suggest?q=para` | Autocomplete |
| POST | `/api/search/sync` | Sync DB → Elasticsearch |
| GET | `/api/inventory/search/marketplace?query=...` | Marketplace search |
| POST | `/api/orders` | Place order (auto-splits by distributor) |
| GET | `/api/analytics/district-heatmap` | Kerala heatmap |
| GET | `/api/finance/gst-summary` | GST liability |
| GET | `/api/finance/ledger/reconcile` | Credit reconciliation |
| GET | `/api/intelligence/connector-blueprints` | Universal + MARG connector templates |
| POST | `/api/intelligence/connectors` | Create pharmacy software connector |
| POST | `/api/intelligence/connectors/:id/sync/raw` | Push raw DB rows for normalization + sync |
| GET | `/api/intelligence/retailer/alerts` | Low-stock + near-expiry alerts |
| GET | `/api/intelligence/distributor/opportunities` | Distributor leads from pharmacy shortages |

---

## 🏗️ Architecture

```
pharmapp/
├── backend/               # NestJS API
│   ├── prisma/            # Schema + Migrations + Seed
│   ├── scripts/
│   │   ├── pharmacy-gateway.cjs        # Local pharmacy DB pull agent (Postgres/MySQL/SQL Server)
│   │   └── gateway-config.example.json # Connector-agent config template
│   ├── src/
│   │   ├── auth/          # JWT + RBAC
│   │   ├── inventory/     # Product + Stock management
│   │   ├── orders/        # Order lifecycle + Credit Ledger
│   │   ├── search/        # Elasticsearch integration
│   │   ├── finance/       # GST + ITC reconciliation
│   │   └── analytics/     # District heatmap + trends
├── frontend/              # Next.js 14 App Router
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # ShadCN UI + custom
│   │   ├── store/         # Zustand (auth + cart)
│   │   └── lib/           # Axios client
└── docker-compose.yml     # Postgres + Redis + Elasticsearch
```

---

## Universal Connector (Pharmacy DB -> PharmaApp)

1. In retailer dashboard, create connector type:
- `MARG_DIRECT_DB` for Marg preset
- `UNIVERSAL_DIRECT_DB` for custom software schema

2. Copy:
- `backend/scripts/gateway-config.example.json` -> `backend/scripts/gateway-config.json`

3. Fill DB details + SQL query + connector ID + retailer JWT.

4. Run pharmacy gateway on the pharmacy machine:
```bash
cd backend
node scripts/pharmacy-gateway.cjs scripts/gateway-config.json
```

5. Gateway flow:
- Pulls rows from pharmacy software DB.
- Calls `/api/intelligence/connectors/:id/sync/raw`.
- Backend uses connector `fieldMap` to normalize and sync stock.

## Auto Scheduler

- Backend now has a built-in scheduler that runs every minute.
- It auto-syncs all active connectors whose `syncIntervalMinutes` is due.
- If connector `config.source.type` is `direct_db`, backend pulls from pharmacy DB and syncs automatically.

## Pilot Package (Non-Technical Flow)

Use this when visiting a pharmacy for a live test.

1. Copy:
- `backend/scripts/pilot-config.example.json` -> `backend/scripts/pilot-config.json`

2. Fill only these fields in `pilot-config.json`:
- `backendBaseUrl`
- `retailerLogin.email`
- `retailerLogin.password`
- `source.dbKind` (`sqlserver` / `mysql` / `postgres`)
- `source.host`, `source.port`, `source.database`, `source.username`, `source.password`
- `source.query` (their stock SQL)

3. Run:
```bash
cd backend
npm run pilot:run
```

What it does automatically:
- Logs into your app.
- Creates connector if not already present.
- Pulls stock rows from pharmacy software DB.
- Syncs raw rows to your backend.
- Repeats every configured minutes.
