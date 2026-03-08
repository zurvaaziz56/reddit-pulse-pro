

# Reddit Trend Radar — Full-Stack Implementation Plan

This is a large project. I recommend building it incrementally across multiple sessions. Here is the full plan broken into phases.

---

## Phase 1: Enable Lovable Cloud + Authentication

- Enable Lovable Cloud (required for database, edge functions, email)
- Set up authentication with email/password, including password reset flow
- Create a `profiles` table linked to `auth.users` for storing user workspace data
- Create a `/reset-password` page
- Protect dashboard routes with auth guards
- Wire up Login, Signup, and Logout with real Supabase auth

## Phase 2: Database Schema

Create these tables via migrations:

- **keywords** — `id`, `user_id` (FK to auth.users), `keyword`, `created_at`
- **reddit_posts** — `id`, `post_id` (unique), `title`, `subreddit`, `author`, `score`, `num_comments`, `url`, `created_utc`, `keyword_id` (FK), `fetched_at`
- **insights** — `id`, `keyword_id` (FK), `type` (enum: trend/pain_point/opportunity/content_idea), `content`, `generated_at`
- **user_roles** — standard roles table per security guidelines

RLS policies: users can only read/write their own keywords and related data.

## Phase 3: Keyword Management

- Replace mock keyword data with real Supabase queries
- CRUD operations for keywords tied to authenticated user
- Enforce plan limits (3/10/50) — store plan info on profiles or via Stripe metadata
- Add "Keyword Monitors" page to dashboard sidebar

## Phase 4: Reddit Data Fetching (Edge Function)

- Create `supabase/functions/fetch-reddit/index.ts`
- Use Reddit's public JSON API (`https://www.reddit.com/search.json?q=KEYWORD&sort=new&t=day`) — no API key needed for basic search
- Fetch posts for each keyword, deduplicate by `post_id`, store in `reddit_posts`
- Set up a cron job (pg_cron) to run hourly
- Display real posts in the Trending Posts dashboard, filtered by keyword

## Phase 5: AI Insight Engine (Edge Function)

- Create `supabase/functions/generate-insights/index.ts`
- Use Lovable AI (Gemini) to analyze batched post titles/content per keyword
- Generate structured output via tool calling: trends, pain points, opportunities, content ideas
- Store results in `insights` table
- Cron job to run daily
- Update InsightsPanel, PainPointsPanel, OpportunitiesPanel to pull from database

## Phase 6: Subreddit Discovery

- Aggregate `reddit_posts` by subreddit per keyword
- Replace mock `subredditData` with real counts
- Show top subreddits with post counts in SubredditChart

## Phase 7: Stripe Billing

- Enable Stripe integration
- Create 3 products/prices (Starter $19, Pro $49, Agency $149)
- Add checkout flow, customer portal, webhook handling
- Enforce keyword limits based on active subscription
- Add Billing page to dashboard

## Phase 8: Daily Email Digest

- Create `supabase/functions/daily-digest/index.ts`
- Enable custom email domain via Lovable Cloud
- Compile top posts + insights per user, send via email
- Cron job to run daily

## Phase 9: Account Settings Page

- Profile management (email display)
- Subscription status display
- Link to Stripe customer portal

## Phase 10: Dashboard Polish

- Add real stats (total keywords, total posts tracked, latest insight date)
- Per-keyword filtering across all panels
- Dark mode is already default; optionally add light mode toggle
- Mobile responsive sidebar (collapsible)

---

## Recommended Starting Order

I suggest we start with **Phase 1 (Cloud + Auth)** and **Phase 2 (Database)** first, since everything else depends on them.

Shall I begin with enabling Lovable Cloud and setting up authentication?

