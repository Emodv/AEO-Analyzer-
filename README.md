# AEO Analyzer — Agentic Engine Optimization Auditing SaaS

A production-ready, full-stack SaaS lead-generation web application designed to audit any website for **Agentic Engine Optimization (AEO)** compliance. Users scan their domains to receive a diagnostic performance rating across 8 key checkpoints, an AI-Generated Executive Summary (powered by Gemini), and options to submit leads for custom professional fixing roadmap services.

---

## 🚀 Architecture Overview

AEO Analyzer is built with a decoupled React and Vite frontend that communicates with a Node.js Express server. When a domain is requested, the system runs all 8 auditing checkpoints in parallel. It queries `robots.txt` access permissions, parses sitemaps to test schema markup coverage, checks for root `llms.txt` and `agent-permissions.json` files, measures raw server-side render text density (for Single-Page Application warnings), checks PageSpeed Insights, and checks JSON-LD structures for deprecated parameters. It lazily integrates with Supabase (PostgreSQL) and Resend for emails, falling back seamlessly to local persistent filesystem storage if no keys are configured.

---

## 🛠 Prerequisites

- **Node.js**: v18.0.0 or higher
- **Database**: Supabase account (or local JSON fallback database)
- **Email Delivery**: Resend account (or local console logger fallback)
- **Optional**: Google PageSpeed API Key & Google Gemini API Key

---

## 📂 Environment Variables Reference

Create `.env.local` or `.env` inside the workspace with the following fields:

| Variable | Description | Required / Fallback |
|---|---|---|
| `GEMINI_API_KEY` | Powers AI-Generated Executive audit insights | Optional (Falls back to deterministic summary) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project API URL | Optional (Falls back to local file storage) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key | Optional (Falls back to local file storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side secure token for postgres database | Optional (Falls back to local file storage) |
| `RESEND_API_KEY` | Triggers transactional confirmation and alert emails | Optional (Logs content to server terminal) |
| `RESEND_FROM_EMAIL` | Sender address (e.g. `noreply@yourdomain.com`) | Optional (Defaults to `noreply@aeoanalyzer.com`) |
| `OPS_EMAIL_1` | First operational partner email | Optional (Defaults to `carlos@yourcompany.com`) |
| `OPS_EMAIL_2` | Second operational partner email | Optional (Defaults to `curtis@yourcompany.com`) |
| `PAGESPEED_API_KEY` | Google PageSpeed lighthouse evaluation token | Optional (Falls back to latency-based scoring) |
| `APP_URL` | Hosted production domain URL (for link references) | Optional (Defaults to development server URL) |

---

## 💻 Local Setup Steps

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Duplicate `.env.example` and name it `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your target keys for Supabase, Resend, and Gemini.

3. **Run Supabase Database Migrations**
   Execute the migration SQL defined in `supabase/migrations/001_initial.sql` in your Supabase SQL Editor.

4. **Launch Dev Server**
   ```bash
   npm run dev
   ```
   The full-stack dev server launches on `http://localhost:3000`.

---

## 🛠 Developer Guide: How to Add a New Audit Checkpoint

To introduce a ninth checkpoint (for example, verifying if there is an active `security.txt` file):

1. **Create Checkpoint File**: Add `src/lib/scanner/checkpoint9.ts`:
   ```typescript
   import { CheckpointResult } from '../../types';
   export async function checkSecurityTxt(domain: string): Promise<CheckpointResult> {
     // Implement validation logic...
     return { pass: true, label: 'Security.txt', detail: 'Verify active security directives.' };
   }
   ```

2. **Update Interfaces**: Append the new key to the `ChecksObject` interface in `src/types.ts`.

3. **Integrate in Orchestrator**: Inside `src/lib/scanner/index.ts`, run the new function alongside other checkpoints, map the scoring multiplier to match the new count (e.g., `score = Math.round(passes * (100 / 9))`), and add the outcome to the `checks` payload.

---

## ✈️ Deploy to Vercel

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the project root.
3. Configure environment variables in the Vercel Dashboard under Project Settings.
4. Redeploy with `vercel --prod`.
