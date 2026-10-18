# ScopeShield AI backend

ScopeShield compares client requests to uploaded project contracts. PDF.js extracts PDF text and UTF-8 TXT files are decoded directly. Uploaded contracts are held in memory only, not logged, and not persisted.

## Setup

```bash
cd scopeshield-backend
npm install
cp .env.example .env
npm run dev
```

The server listens on `PORT` or `3000` by default.

## Environment variables

- `FRONTEND_ORIGIN` — allowed frontend origin for CORS; defaults to `http://localhost:5173`.
- `GEMINI_API_KEY` — required server-side API key for Gemini analysis.
- `GEMINI_MODEL` — optional supported Gemini text model; defaults to `gemini-2.5-flash`.
- `GEMINI_TIMEOUT_MS` — optional Gemini request timeout from 100 to 120,000 milliseconds; defaults to 30,000.
- `PORT` — deployment HTTP port; defaults to `3000`.
- `ANALYZE_RATE_LIMIT_MAX_REQUESTS` — optional per-client analysis request cap per 15 minutes; defaults to `10`.

## Endpoints

- `GET /api/health` — returns JSON confirming the server is running.
- `POST /api/analyze` — multipart form request containing:
  - `contract`: PDF or TXT file, maximum 10 MB.
  - `clientRequest`: non-empty request, up to 4,000 characters.
  - `estimatedExtraHours`: estimated extra hours, from `0` to `500`.
  - `hourlyRate`: INR per hour, from `0` through `100000`.

Successful requests return a Gemini assessment with a classification, concise summary, contract evidence, uncertainty reasons, human-review flag, validated `estimatedExtraHours` and `hourlyRate`, and `estimatedExtraCost` in INR. The backend calculates cost as hours multiplied by the hourly rate, rounded to two decimal places; Gemini does not receive or set pricing values. Pricing inputs must be finite and non-negative; hours are capped at 500 and hourly rate at INR 100,000. Contract quotations are verified against the extracted source; unverifiable quotations are rejected. Assessments are not definitive legal conclusions and do not approve or send proposals. Errors use the JSON shape `{ "error": { "code": "...", "message": "..." } }`.

## Build and tests

```bash
npm run build
```

Run the contract extraction and assessment validation tests with:

```bash
npm test
```

Start the compiled server with `npm start`.
For one-step production build and start, use `npm run start:prod`.
