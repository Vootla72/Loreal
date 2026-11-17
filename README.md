# L'Oréal Claims Intelligence Engine

Full-stack prototype: React (Vite) → NestJS → Prisma → PostgreSQL, with an OpenAI LLM that judges whether clinical evidence justifies a product claim.

```
Loreal-frontend/   React 19 + Vite + TypeScript UI
Loreal-backend/    NestJS 11 API, Prisma 6 ORM, OpenAI SDK
PROPOSAL.md        Business process, research, architecture, roadmap
```

## 1. Database

You need a PostgreSQL server. Either option works:

- **Local install** (PostgreSQL 14/18 is already installed on this machine as a Windows service on port 5432).
  Create the database once:
  ```sh
  "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE loreal_claims;"
  ```
- **Docker**: `cd Loreal-backend && docker compose up -d` (Postgres on port 5434, password `postgres`).

## 2. Backend

```sh
cd Loreal-backend
npm install
# edit .env: set DATABASE_URL (your postgres password) and optionally OPENAI_API_KEY
npx prisma migrate deploy     # creates Product, Claim, Assessment tables
npx prisma db seed            # optional demo data
npm run start:dev             # http://localhost:3000/api
```

Without `OPENAI_API_KEY` the API uses a deterministic **offline mock assessor**, so the full flow can be demoed with no key. Results are labelled `model: "mock"`.

If npm blocks Prisma's install scripts, run `npx prisma generate` once after `npm install`.

### API

| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | DB + LLM mode check |
| GET / POST | /api/products | List / create products (Business team) |
| GET / POST | /api/claims | List / propose claims (Business team) |
| PATCH | /api/claims/:id | Manager review, scientist test, evaluator decision |
| **POST** | **/api/claims/assess** | `{ claimId, evidence }` → LLM verdict, saved and returned |
| GET | /api/claims/:id/assessments | Assessment history for a claim |

Example:
```sh
curl -X POST http://localhost:3000/api/claims/assess -H "Content-Type: application/json" \
  -d '{"claimId":2,"evidence":"Randomised double-blind study, n=60. Hydration elevated vs placebo at 72h (p<0.01)."}'
```

## 3. Frontend

```sh
cd Loreal-frontend
npm install
npm run dev                   # http://localhost:5173 (proxies /api to :3000)
```

Walk the flow: **Product Management** → **Claims Management** (propose, then Review as manager) → **Scientist Testing** (submit a Pass) → **Evaluator Review** (paste study results, Run AI Assessment, then Approve/Reject).

The AI result component is `Loreal-frontend/src/components/ClaimAssessment.tsx`.
