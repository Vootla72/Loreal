# L'Oréal Claims Intelligence Engine


You enter a product, a claim and the clinical study (as a PDF). The backend sends it to an LLM, which decides whether the study backs up the claim. The verdict is saved in PostgreSQL and shown in the UI as **Justified (Yes/No)**, **Confidence Score** and **Reasoning**.

```
Loreal-backend/    NestJS 11, Prisma 6, PostgreSQL, OpenAI
Loreal-frontend/   React 19, Vite, TypeScript
PROPOSAL.md        Business context, architecture and roadmap
```

## Where things are

| Part of the brief | File |
|---|---|
| Prisma schema (Claim, Assessment) | `Loreal-backend/prisma/schema.prisma` |
| `POST /api/claims/assess` | `Loreal-backend/src/claims/` |
| LLM call | `Loreal-backend/src/llm/` |
| React UI | `Loreal-frontend/src/components/` |

## Running it

**1. Database** (PostgreSQL on port 5432)

```sh
psql -U postgres -c "CREATE DATABASE loreal_claims_core;"
```

**2. Backend**

```sh
cd Loreal-backend
npm install
cp .env.example .env          # set DATABASE_URL, and OPENAI_API_KEY if you have one
npx prisma migrate deploy
npm run db:seed               # optional sample data
npm run start:dev             # http://localhost:3000/api
```

No OpenAI key? Two options:

- **Free Gemini key:** set `OPENAI_API_KEY` to a key from [Google AI Studio](https://aistudio.google.com/apikey), `OPENAI_BASE_URL` to `https://generativelanguage.googleapis.com/v1beta/openai/` and `OPENAI_MODEL` to a Gemini model (e.g. `gemini-3.5-flash-lite`). The same OpenAI SDK code is used.
- **Offline:** leave `OPENAI_API_KEY` empty and a built-in mock assessor is used (results show `model: "mock"`).

**3. Frontend**

```sh
cd Loreal-frontend
npm install
npm run dev                   # http://localhost:5173
```

Click **Use sample** to fill the form, then **Run AI Assessment**.

## API

`POST /api/claims/assess` takes a multipart form with `productName`, `claim` and `file` (the evidence as a PDF, max 10 MB), and returns the saved assessment:

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
  "createdAt": "2026-11-17T16:34:18.674Z",
  "cached": false
}
```

Errors: `400` invalid input or not a PDF, `413` file too large, `422` unreadable PDF, `502` AI service unavailable.

