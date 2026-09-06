# Functional preview deployment

This branch prepares a free preview of the existing keyword → posts → insights flow. It is not a completed public paid release. No live database or edge function has been changed by the implementation work.

## Runtime and frontend

Use Node 22 and npm. `package-lock.json` is the maintained lockfile for this branch; older Bun lockfiles are retained but not used by CI.

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run check:functions
npm run test:functions
npm run build
```

Deno 2 is needed for the backend checks. Database tests use isolated PGlite PostgreSQL, including simulated Supabase roles and auth schema; they do not replace a hosted Supabase smoke test.

Set hosting environment variables before the build:

- `VITE_SUPABASE_URL`: target Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: target project's public publishable/anon key.
- `VITE_ENABLE_BILLING=false`: keep the preview free.

The existing repository tracks a legacy `.env`. Hosting variables must explicitly override those values to avoid accidentally pointing a new preview at the old project. Do not put a service-role key or any provider secret in a VITE variable. `.env.example` contains placeholders only. Local overrides can be kept in ignored `.env.local`.

Vercel: import this branch as a preview, use the Vite preset, `npm run build`, and output `dist`. `vercel.json` handles client-side routes. Netlify-compatible routing is also included in `public/_redirects`. A page reload on `/dashboard/keywords` should return the app, not 404.

## Backend preparation

Prefer a separate Supabase staging project. Verify the selected project reference before any command that writes remote state. The tracked config has the old project's identifier; never infer the intended destination from it.

1. Review all migrations with `supabase db push --dry-run` after explicitly linking the intended staging project.
2. Apply migrations in order. The new migration preserves records, changes post uniqueness to `(keyword_id, post_id)`, adds post bodies and insight source links, protects profile billing fields, enforces keyword quotas, and adds bounded processing plus atomic insight replacement.
3. Set server secrets through the Supabase dashboard or an ignored secrets file:
   - `LOVABLE_API_KEY`: valid AI gateway key with credits. The implementation retains the existing Lovable gateway; a normal Google/Gemini key is not interchangeable.
   - `AI_MODEL`: optional override; default is `google/gemini-3-flash-preview`.
   - `REDDIT_USER_AGENT`: descriptive app identifier/contact.
   - `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`: optional paired credentials for supported application-only OAuth. If omitted, the original public JSON search method is used. An incomplete pair should not be configured.
   - `ENABLE_BILLING=false`.
   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted edge functions.
4. Deploy all five functions from this branch so billing handlers are gated as well as the two research handlers.
5. In Supabase Auth, configure Site URL and allowed redirects for the actual preview host, including password-reset/email-confirmation flows. Configure email delivery before inviting testers.

The functions retain `verify_jwt=false` for compatibility with application-verified sessions. Every handler validates the bearer token with Supabase Auth before performing its work; this setting must not be mistaken for permission to omit handler authentication. Processing is limited to 30 attempts per action per account per UTC day, at least 60 seconds apart. Failed attempts also count.

## Actual live dependency finding

A single test of the original `www.reddit.com/search.json` method returned HTTP 403 from the development machine. No proxy, alternate host or block-evasion workaround was used. The repaired app now reports this failure instead of claiming a successful zero-result fetch. Authenticated mode is implemented and type-checked but no real Reddit credentials were available to validate it. Neither mode is guaranteed to work from the eventual hosted function until tested there.

A successful live Reddit fetch and a successful AI response are still required before calling the service fully functional end to end. Commercial-use review is deferred per the owner's direction, not represented as resolved.

## Staging acceptance

- Create two test accounts; verify confirmation, login, logout and password reset.
- Add a 2–100 character keyword. Reject duplicates and a fourth Starter keyword, including concurrent/direct API attempts.
- Fetch the selected keyword: verify a successful source response, saved title/body, correct keyword ownership, source URLs and timestamps. A blocked/rate-limited source must display an error and must not generate fake success data.
- Confirm the same Reddit post can be tracked by both accounts without changing either association.
- Generate insights: confirm sources exist in the fetched sample. A malformed or failed AI result must preserve the previous report.
- Switch accounts and confirm posts/insights cannot cross between them.
- Verify the retry cooldown and action cap.
- Refresh nested routes on the static host. Verify small-screen controls, keyboard use and error states with live staging data.

## Scope and rollback

The preview fetches up to 25 posts from the past month for one selected keyword. It stores post text; comment text is not fetched. AI analysis uses at most 25 saved posts. There are no scheduled jobs, daily email digests, agency reports or opportunity scores. Dashboard sample data fallbacks and unsupported landing metrics have been removed from the main research flow.

Payments are off. Enabling paid subscriptions requires separate Stripe test-mode QA and a webhook-backed entitlement lifecycle; the retained polling-based billing code is not the release standard for a paid launch. Pricing identifiers are still those from the old project. Public privacy/terms/support pages must be supplied and reviewed before a public launch; placeholder footer links are hidden in this preview.

For a failed preview release, roll the frontend and functions back to the preceding deployment. Do not automatically reverse the migration: old ingestion code expects a different uniqueness constraint. Keep the new fetch function disabled/unavailable if rolling back to the original code, and restore from a reviewed backup only if necessary. Prefer leaving the isolated staging project in place for diagnosis.
