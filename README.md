# L'Oréal Claims Intelligence Engine: Core Feature

An evaluator submits a product claim and its clinical study results. An LLM judges whether the study justifies the claim, the verdict is saved to PostgreSQL, and the React UI shows **Justified (Yes/No)**, **Confidence Score** and **Reasoning**.

```
Loreal-frontend/   React 19 + Vite + TypeScript: one page, one component
Loreal-backend/    NestJS 11 + Prisma 6 + OpenAI SDK: one endpoint
PROPOSAL.md        Business process, research, architecture, roadmap
```

This branch contains only what the brief asks for. The `main` branch has a fuller version with the four-role workflow (business team, claim manager, scientist, evaluator).

| Requirement | Where |
|---|---|
| Prisma schema for Claim and Assessment | `Loreal-backend/prisma/schema.prisma` |
| `POST /api/claims/assess` controller and service | `Loreal-backend/src/claims/` |
| OpenAI call with structured output | `Loreal-backend/src/llm/` |
| React component showing the result | `Loreal-frontend/src/components/ClaimAssessment.tsx` |

## 1. Database

Create the database once (PostgreSQL 18 on port 5432):

```sh
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE loreal_claims_core;"
```

Or use Docker: `cd Loreal-backend && docker compose up -d` (port 5434, password `postgres`).

## 2. Backend

```sh
cd Loreal-backend
npm install
# edit .env: DATABASE_URL (your postgres password) and optionally OPENAI_API_KEY
npx prisma migrate deploy     # creates the Claim and Assessment tables
npm run db:seed               # optional: sample claims and assessments (safe to re-run)
npm run start:dev             # http://localhost:3000/api
```

Without `OPENAI_API_KEY`, a deterministic **offline mock assessor** is used, so the demo runs with no key or credits. Its results show `model: "mock"`.

If npm blocks Prisma's install scripts, run `npx prisma generate` once after `npm install`. On Windows, stop the backend before running `prisma generate`, or the engine file is locked.

### API

`POST /api/claims/assess`

```json
{
  "productName": "Revitalift Night Cream",
  "claim": "Reduces wrinkles by 20% in 4 weeks",
  "evidence": "Randomised, double-blind study, n=60. Wrinkle depth -22% at week 4 (p<0.01)."
}
```

Response (201):

```json
{
  "id": 1,
  "claimId": 1,
  "productName": "Revitalift Night Cream",
  "claim": "Reduces wrinkles by 20% in 4 weeks",
  "isJustified": true,
  "confidenceScore": 0.9,
  "reasoning": "…",
  "model": "gpt-4o-mini",
  "createdAt": "2026-11-17T16:34:18.674Z"
}
```

Errors: 400 for invalid input, 502 when the AI service is unavailable. `GET /api/health` reports the database status and the LLM mode.

A claim is matched on product plus normalized wording (trimmed, lowercased, single spaces). Submitting the same claim again with new evidence adds a new assessment to the same claim.

## 3. Frontend

```sh
cd Loreal-frontend
npm install
npm run dev                   # http://localhost:5173 (proxies /api to :3000)
```

Click **Use sample** to fill the form, then **Run AI Assessment**.
