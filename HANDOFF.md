# The Marketing Reset - Session Handoff

> Updated at the end of every session. This is how the AI picks up where it left off.

## Current State

### What's Done

- Project scaffolded with Next.js 16 + TypeScript (strict mode)
- All dependencies installed (Drizzle ORM, Zod, bcryptjs, pg, shadcn deps, testing tools)
- ESLint + Prettier configured (0 errors, 0 warnings)
- Security headers configured in next.config.ts (CSP, X-Frame-Options, HSTS, etc.)
- Environment variable validation with Zod (src/lib/env.ts)
- Database schema defined with Drizzle ORM (src/lib/schema.ts)
  - Tables: users, sessions, clients, client_notes, deliverables, generated_prompts, revenue_entries, contact_submissions
  - Enums: pipeline_stage, fit_rating, deliverable_status, note_type, user_role
- Validation schemas defined (src/lib/validation.ts)
  - quickAddClient, fullIntake, stageTransition, fitAssessmentAction, note, deliverableUpdate, contactForm, publicIntake, login
- Sanitization utilities (src/lib/sanitize.ts) - escapeHtml, sanitizeString, sanitizeEmail
- App routing structure with route groups:
  - (public)/ - Public marketing site
  - (dashboard)/dashboard/ - Operations dashboard
- Error boundary (error.tsx) and 404 page (not-found.tsx)
- Skip-to-content link in root layout
- Reduced motion media query in globals.css
- Focus visible styles configured
- **EcoTrust design palette** applied (replacing original warm orange/sage green):
  - Brand: Steel Blue (#1F4E79) scale with cornflower mid-tones
  - CTA: Green (#4CAF50) with black text for accessibility
  - Accent: Orange (#FFA726) for highlights and badges
  - Cool neutrals replacing warm neutrals
  - Full dark mode support via class-based `.dark` toggle
  - FOUC prevention script in layout.tsx (reads localStorage before paint)
  - ThemeToggle component using `useSyncExternalStore` (no lint issues)
  - Light mode uses `bg-brand-50` (#f0f5fa) for alternating sections (steel blue tint)
- Testing configured:
  - Vitest with 62 passing unit tests (validation, sanitization, security patterns, fit assessment, prompts, rate limiting, CSRF)
  - Playwright with 31 passing E2E tests (public site, auth, accessibility)
  - Security pattern scan tests (eval, innerHTML, secrets, console.log, TODO/FIXME)
  - dangerouslySetInnerHTML allowed in layout.tsx only (FOUC prevention, static string)
- shadcn/ui installed and configured (Button, Card, Input, Label, Textarea, Dialog, Badge, Separator, Sheet, Avatar, Dropdown Menu, Tabs, Select)
- Brand palette applied to shadcn semantic tokens (primary = green CTA, accent = steel blue)
- ButtonLink component for Link + button styling (shadcn v4 removed asChild)
- **Public marketing site complete with editorial/magazine-style layouts:**
  - Header with responsive mobile nav + ThemeToggle
  - Footer with navigation and contact links
  - Landing page: full-bleed hero with image overlay, editorial quote, staggered 01/02/03 pillars on 12-col grid, edge-to-edge image break, dark CTA band
  - About page: text-heavy hero, 5-col split with bookshelf image, dark audience band, bordered values grid, inline CTA bar
  - How It Works page: full-bleed hero with gradient overlay, vertical timeline with numbered circles, dark deliverables band, divider FAQ, inline CTA
  - Contact page: full-height two-column split (collaboration image left, form right), no card wrapper, immersive layout
  - Get Started page: concierge flow (4-question guided experience) + multi-step intake form (54 questions in 6 steps), animated transitions via Framer Motion, sessionStorage draft persistence, URL param pre-fill from concierge
- Auth system built:
  - Auth library (src/lib/auth.ts) - createSession, getSession, destroySession, verifyCredentials, requireAuth, requireAdmin
  - Login API (POST /api/auth/login) - Zod validated, rate limited (5/15min), CSRF protected
  - Logout API (POST /api/auth/logout) - destroys session
  - Session check API (GET /api/auth/me) - returns current user
  - Login page with Suspense boundary for searchParams, h1 for accessibility
  - Middleware protecting /dashboard/* routes (redirects to /login)
- Dashboard built (wired to live database queries):
  - Sidebar navigation with ThemeToggle (Overview, Pipeline, Clients, Intake, Sign out)
  - Overview page with live stat cards and recent clients list
  - Pipeline page with live client counts per stage and clickable client names
  - Clients page with live client list, fit ratings, stage badges
  - Client detail page (/dashboard/clients/[id]) with stage progression, fit assessment, intake data, deliverables, notes
  - Intake page with tabbed Quick Add and Full Intake forms
- Fit assessment scoring engine (src/lib/fit-assessment.ts):
  - 6 weighted criteria, green/yellow/red rating, score 0-100, flagged reasons
- Prompt system (src/lib/prompts.ts):
  - 4 templates (Brand Voice, Content Strategy, Audience Clarity, Marketing Reset Plan)
  - Auto-population from intake data
- Rate limiting (src/lib/rate-limit.ts):
  - In-memory sliding window, applied to login and contact APIs
- CSRF validation (src/lib/csrf.ts):
  - Origin/Referer header validation on all mutation routes
- API routes (all auth-protected except contact and intake):
  - GET /api/clients, GET/POST /api/clients/[id], fit, stage, notes, deliverables, prompts
  - GET /api/dashboard/stats
  - POST /api/contact (public, rate limited, CSRF protected)
  - POST /api/intake (public, rate limited, CSRF protected, creates client with intake_submitted status)
- Drizzle migration generated (drizzle/0000_condemned_colossus.sql)
- Admin seed script (scripts/seed-admin.ts) - seeded admin user with default credentials
- **Contrast and accessibility polish (Session 7):**
  - Text contrast boosted to AAA compliance (warm-600 → warm-800, brand-500 → brand-700 across all public pages)
  - Form input borders darkened (--border/--input from #e4e9ef to #9aa5b4)
  - Label-to-input spacing added (space-y-1.5 on all field wrapper divs in intake form)
  - Hero "See How It Works" button fixed (white-on-white caused by outline variant bg-background + text-white, added bg-transparent)
  - Select elements given title attributes for axe accessibility compliance (q06, q18, q26, q46)
  - HANDOFF.md cleaned up (removed stray image markdown from line 1)
- All quality gates passing (type-check, lint, test, build)

### What's In-Progress

- **Consultation form redesign** -- branch `feat/consultation-form-redesign` (15 commits, unpushed)
  - All Karli-approved changes from Session 12 have been IMPLEMENTED:
    - Concierge rewritten as 7-screen flow (was 6): welcome, C1 with Other, C2, C3 with 7th option, C4 multi-select, summary builder, C5 readiness qualifier
    - Consultation form rewritten with streamlined questions: 4 cuts (Q20b/c/d, Q26), 6 additions (voice, content enjoyment, FAQs, transformation, seasonality, solo/team), reframes (Q13 conversational, Q22/Q23 combined, Q34 broadened, Q48 warm close)
    - Online Presence moved to Step 0 with compact link tables (GMB + Yelp added)
    - Confirmation card shows concierge answers at top of Step 1
    - Language swap: "intake" -> "consultation" in all user-facing strings
    - Not-ready page at /not-ready for C5 "No" routing
    - New components: ConciergeCheckboxOption, ConciergeTextOption, ConciergeReadiness, IntakeConfirmationCard, IntakeLinkTable
  - Dark mode toggle removed for testing (last commit) -- needs decision to restore or keep light-only
  - **Pending:** Bas to decide on dark mode, push branch, merge to main

### VPS Deployment (Completed 2026-03-15)

- **Domain:** resetmymarketing.com (under registrar review, not yet active)
- **Port:** 3007
- **PM2 app name:** the-marketing-reset (fork mode, 250MB memory limit)
- **Directory:** /var/www/the-marketing-reset
- **Database:** PostgreSQL user `marketing_reset`, database `marketing_reset`
- **Admin seeded:** admin@themarketingreset.com
- **Nginx:** HTTP config in place at /etc/nginx/sites-available/resetmymarketing
- **SSL:** Not yet configured (waiting on domain approval)
- **GitHub:** github.com/resetmymarketing/website (branch: main)
- **SSH keys:** Separate deploy keys on VPS and local dev machine (github.com-resetmymarketing alias)
- **Package manager:** Switched from npm to pnpm (node-linker=hoisted in .npmrc for compatibility)

### VPS User Isolation (Completed 2026-03-16)

- App runs as dedicated `marketingreset` Linux service account (nologin)
- PM2 systemd service: `pm2-marketingreset` (auto-restart on reboot)
- Ecosystem file: `/var/www/the-marketing-reset/ecosystem.config.cjs` (PORT=3007)
- .env.local locked to chmod 600 (only marketingreset user can read)
- Subdomain: **https://reset.builtbybas.com** (SSL via certbot)
- All deploys/builds must run as the service user:

  ```bash
  sudo -u marketingreset env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/the-marketing-reset bash -c '<command>'
  ```

### What's Next

1. **Dark mode decision** -- restore toggle or keep light-only?
2. **Push feature branch** -- 15 commits on feat/consultation-form-redesign
3. **Visual verification** -- Bas to review concierge + consultation flow on dev server
4. **Merge to main** after visual approval
5. **Set up local marketing_reset DB** -- E2E login test hangs without it (DB pool timeout)
6. Domain approval (resetmymarketing.com under registrar review)
7. Point DNS A records to VPS IP once domain is active
8. Run `certbot --nginx -d resetmymarketing.com -d www.resetmymarketing.com` for SSL
9. Change default admin password on first login
10. Manual accessibility testing (200% zoom, screen reader, reduced motion)
11. Lighthouse performance/accessibility audit
12. Manual testing of concierge + consultation flow end-to-end (all screens, keyboard nav)
13. Migrate middleware to proxy (Next.js 16 deprecation)
14. Security audit (SECURITY-AUDIT.md per Portfolio Quality Initiative)

### Blockers

- Domain resetmymarketing.com under registrar review (cannot configure DNS or SSL until approved)
- E2E auth test (1/31) fails -- login API hangs on local DB connection. Need local marketing_reset database or connection timeout in db.ts

### Decisions Made

- Unified app (public + dashboard in one Next.js app using route groups)
- PostgreSQL self-hosted on VPS (replacing SQLite from v1)
- Drizzle ORM (replacing raw SQL from v1)
- Custom auth with httpOnly cookies (new, v1 had no auth)
- Intake data stored as JSONB (vs 48 individual columns in v1)
- Node environment for Vitest (jsdom had ESM compatibility issues)
- ButtonLink component instead of asChild (shadcn v4 uses base-ui, no asChild support)
- EcoTrust color palette with dark mode (class-based toggle, useSyncExternalStore)
- FOUC prevention via inline script in layout.tsx head (dangerouslySetInnerHTML, static string only)
- Light mode alternating sections use bg-brand-50 (#f0f5fa steel blue tint) for visual depth
- Middleware for auth redirect (deprecated in Next.js 16 but still functional, migrate to proxy later)
- In-memory rate limiting (sufficient for single-instance deployment)
- Public intake form at /get-started (not /contact) — "Start Your Reset" and "Get Started" buttons link to intake
- Playwright configured for port 3002 (port 3000 occupied by other local project)
- framer-motion added for concierge/intake animated transitions (~32KB gzipped, tree-shakeable)
- Intake form expanded from 48 to 54 questions (added brand messaging, retention, competition, marketing investment questions)
- Get Started page now has two modes: concierge (default, guided 4-question flow) and intake (multi-step form with progress bar)

## Session History

| Date       | Session | Summary                                                                                          |
|------------|---------|--------------------------------------------------------------------------------------------------|
| 2026-03-07 | 1       | Project setup. Scaffolded, configured, all quality gates passing.                                |
| 2026-03-07 | 2       | Public site, auth, dashboard, intake flow, APIs, Drizzle migration. All quality gates passing.   |
| 2026-03-07 | 3       | Fit assessment, deliverables, prompts, metrics, live data wiring, rate limiting, CSRF, E2E tests. All quality gates passing. |
| 2026-03-07 | 4       | EcoTrust palette rebrand (light + dark mode), ThemeToggle component, FOUC prevention, mid-tone accents in light mode. All quality gates passing. |
| 2026-03-07 | 5       | Stock photography sourced (5 images from Pexels). Editorial/magazine-style layout redesign for all 4 public pages. All quality gates passing. |
| 2026-03-07 | 6       | Public intake form (48 questions, /get-started), public API route, content alignment fixes, button routing. All quality gates passing. |
| 2026-03-07 | 7       | Contrast boost (AAA compliance), darkened form borders, label-to-input spacing, hero button white-on-white fix, select title attributes for a11y. All quality gates passing. |
| 2026-03-15 | 8       | Concierge "Get Started" experience (6-screen guided flow with Framer Motion animations), multi-step intake form (6 steps with progress bar), 6 new intake questions (brand messaging, retention, competition, marketing investment). framer-motion dependency added. All quality gates passing. |
| 2026-03-15 | 9       | VPS deployment. Switched npm to pnpm. Created PM2 ecosystem config, Nginx config, DEPLOY.md. Set up GitHub repo (resetmymarketing/website), SSH keys (local + VPS). Deployed to VPS: cloned, PostgreSQL database created, schema migrated, admin seeded, built, PM2 running on port 3007, Nginx configured. Domain under registrar review. SSL pending. |
| 2026-03-16 | 10      | VPS security audit: closed UFW port 3003 (analytics proxied by Nginx). Planned user isolation migration: spec + implementation plan for migrating ABHS, Figaro, Marketing Reset, Umami from root PM2 to dedicated no-login Linux service accounts. Ready to execute next session. |
| 2026-03-16 | 11      | Executed VPS user isolation: migrated 4 apps (Umami, Figaro, Marketing Reset, ABHS) to dedicated nologin service accounts with isolated PM2 + systemd startup. Set up builtbybas.com subdomains (abhs, figaro, reset) with Nginx + SSL. Closed direct app ports. Added default Nginx catchall (444) for bare IP. Updated global docs. |
| 2026-04-10 | 12      | Karli's first direct Claude Code session. Reviewed v3.0 handoff doc against actual codebase -- found duplication issues and inaccuracies from prior Claude session. Analyzed all 52 questions against deliverable needs. Identified 4 cuts (Q20b, Q20c, Q20d, Q26), 6 new questions (voice, content enjoyment, FAQs, transformation, seasonality, team), and multiple reframes for inclusivity. Created HTML mockup in tmp/. Karli approved all recommendations. No code changes -- planning only. |
| 2026-04-10 | 13*     | Implementation sessions (unknown count). Implemented all Session 12 approved changes: 7-screen concierge (Other, multi-select, readiness), consultation form rewrite (cuts, additions, reframes, link tables), language swap, not-ready page, new components. Tests updated (83 passing). Dark mode removed for testing. |
| 2026-04-11 | 14      | Codebase audit. Fixed q34 field name mismatch (validation vs form). Updated Playwright config (Turbopack crash workaround, port fix, webpack fallback). Ran E2E tests (30/31 pass -- 1 blocked by missing local DB). Updated governance files to reflect actual branch state. |
