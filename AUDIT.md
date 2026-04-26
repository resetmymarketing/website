# The Marketing Reset - Audit & Issues Tracker

> Living record of project quality. Updated whenever issues are found or fixed.

## Quality Gates

| Gate             | Command              | Result | Notes                                         |
|------------------|----------------------|--------|-----------------------------------------------|
| Type checking    | `pnpm type-check`    | PASS   | 0 errors, strict mode (S16 verified on Next 16.2.3 after `.next/` cache clear) |
| Linting          | `pnpm lint`          | PASS   | 0 errors, 0 warnings (S16)                    |
| Tests            | `pnpm test`          | PASS   | 83/83 passing (S16 verified on Next 16.2.3)   |
| Build            | `pnpm build`         | PASS   | 28 routes (S16, 2.4s compile)                 |
| E2E tests        | `pnpm test:e2e`      | WARN   | 30/31 passing (1 blocked by missing local DB) |
| Dependency audit | `pnpm audit`         | WARN   | Production CVE patched S16. Remaining 7 are dev-only. See detail below. |

### Vulnerability Detail (updated 2026-04-25 post-S16 deploy)

| Package            | Severity | Path                                              | Production Impact                               | Action                              |
|--------------------|----------|---------------------------------------------------|-------------------------------------------------|-------------------------------------|
| ~~next 16.1.7~~    | ~~HIGH~~ | ~~direct dep~~                                    | ~~YES~~                                         | **PATCHED S16** -- next 16.2.3 in prod (F15) |
| vite               | HIGH     | dev (vitest runtime)                              | None -- dev server only                         | Bump vite 6.4.1 -> 6.4.2+           |
| vite               | Moderate | dev                                               | None -- dev server only                         | Covered by above bump               |
| esbuild            | Moderate | drizzle-kit > @esbuild-kit (dev)                  | None -- dev-only                                | Monitor for drizzle-kit update      |
| hono (x2)          | Moderate | shadcn > @modelcontextprotocol/sdk (dev CLI)      | None -- shadcn CLI only, not bundled            | Upstream fix via shadcn update      |
| @hono/node-server  | Moderate | shadcn > @modelcontextprotocol/sdk (dev CLI)      | None -- shadcn CLI only, not bundled            | Upstream fix via shadcn update      |

**Production CVE status (2026-04-25):** GHSA-q4gf-8mx6-v5v3 (Next.js Server Components DoS) is **PATCHED** in production. VPS runs Next.js 16.2.3, Ready in 231ms, no crash signature. Staging in `/tmp/the-marketing-reset-debug/` on port 3099 successfully reproduced clean startup before the production deploy (the same pattern that exposed the Figaro crash-loop axis).

## Issues Tracker

### Severity Definitions

| Severity | Definition                                       | SLA                      |
|----------|--------------------------------------------------|--------------------------|
| CRITICAL | Blocks deployment, data loss risk, security exploit | Fix immediately          |
| HIGH     | Major functionality broken, security vulnerability  | Fix before launch        |
| MEDIUM   | Degraded experience, minor security concern         | Fix before next session  |
| LOW      | Cosmetic, minor inconsistency                       | Fix when convenient      |

### Open Issues

| ID | Severity | Category | Issue | Found | Status |
|----|----------|----------|-------|-------|--------|
| O1 | LOW | Test | E2E login error test fails -- login API hangs on DB pool connection. Local PostgreSQL running but marketing_reset DB may not exist locally. | S14 | Open |
| O2 | LOW | Config | Turbopack crashes on dev machine. Playwright config uses --webpack fallback. | S14 | Workaround |
| O4 | HIGH | Infra | ~~marketingreset service user SSH deploy broken~~ | S15 | **CLOSED** -- see F12 |
| O5 | MEDIUM | Infra | ~~stripped ecosystem.config.cjs deployed~~ | S15 | **CLOSED** -- see F13 |
| O6 | HIGH | Security | ~~Next.js 16.1.7 Server Components DoS CVE (GHSA-q4gf-8mx6-v5v3) in production~~ | S15 | **CLOSED S16** -- see F15 |
| O7 | LOW | Security | `x-powered-by: Next.js` header leaked publicly. Information disclosure (framework name, no version). One-line fix: `poweredByHeader: false` in `next.config.ts`. Verified via `curl -sI https://reset.builtbybas.com/`. | S16 | Open |
| O8 | LOW | Docs | PM2 mode drift -- live `pm2 list` shows mode `cluster`, but HANDOFF.md history records "fork mode (250MB memory limit)". Reconcile via `ecosystem.config.cjs` to declare which is intentional, then update doc to match. | S16 | Open |

### Fixed Issues

| ID | Severity | Category | Issue                            | Resolution                        | Session |
|----|----------|----------|----------------------------------|-----------------------------------|---------|
| F1 | LOW      | Build    | shadcn v4 Button has no asChild  | Created ButtonLink component      | 2       |
| F2 | MEDIUM   | Build    | useSearchParams needs Suspense   | Wrapped LoginForm in Suspense     | 2       |
| F3 | LOW      | A11y     | Login page missing h1 element    | Added h1 inside CardTitle         | 3       |
| F4 | LOW      | Config   | Playwright hitting wrong port    | Updated config to port 3002       | 3       |
| F5 | MEDIUM   | Lint     | setState in useEffect (ThemeToggle) | Replaced with useSyncExternalStore | 4    |
| F6 | LOW      | Test     | Security scan false positive on FOUC script | Added layout.tsx exception | 4    |
| F7 | LOW      | Lint     | Unescaped quote entity in decorative span   | Replaced with &amp;ldquo; entity  | 5    |
| F8 | LOW      | Type     | Zod v4 z.literal errorMap not supported      | Changed to error string param     | 6    |
| F9 | MEDIUM   | Data     | q34 field name mismatch: validation used q34_no_shows_impact, form used q34_cancellation_impact | Aligned schema + test to form field name | 14 |
| F10 | HIGH    | Security | Next.js 16.1.6 DoS (flatted, picomatch, path-to-regexp, brace-expansion CVEs)                   | Patched 9 of 10 transitive vulns on main  | (main branch, pre-S14) |
| F11 | MEDIUM  | UX       | Dark mode toggle removed for testing -- needed decision                                         | Bas decision 2026-04-12: keep light-only (verified no dark mode artifacts remain in src) | 15 |
| F12 | HIGH    | Infra    | O4: broken SSH deploy alias for marketingreset user                                             | Generated ed25519 keypair, added read-only deploy key on resetmymarketing/website, wrote ~/.ssh/config alias. Legacy root-owned key archived to /root/.ssh/archive-2026-04-12/. Revoked old GitHub deploy key. | 15 |
| F13 | MEDIUM  | Infra    | O5: stripped ecosystem.config.cjs deployed                                                       | Pulled comprehensive repo version (NODE_ENV=production, 250M memory cap, log paths). PM2 delete+start + pm2 save. Verified node env=production in pm2 show. | 15 |
| F14 | HIGH    | Security | Leaked GitHub PAT in cleartext on Colour Parlor's git remote URL (discovered during cross-project audit) | Generated ed25519 deploy key for colourparlor user, added on AlwaysinAllways/colourparlor, swapped remote to SSH alias, Bas revoked the leaked PAT. | 15 |
| F15 | HIGH    | Security | O6: Next.js 16.1.7 Server Components DoS CVE (GHSA-q4gf-8mx6-v5v3) in production. | Surgical bump to next 16.2.3 + eslint-config-next 16.2.3 on `fix/next-16.2.3-cve-patch` branch (rejected both Dependabot multi-major bundles). Local quality gates clean. VPS staged in `/tmp/the-marketing-reset-debug/` port 3099 -- Ready in 218ms, 8 routes smoke 200/404. Merged --no-ff to main (`0bd26d1`), deployed to production -- Ready in 231ms, 200 OK on all public routes. | 16 |

### Deferred Issues

| ID | Phase/Reason | Issue                                               | Target             |
|----|-------------|-----------------------------------------------------|--------------------|
| D1 | RESOLVED    | ~~Database not yet connected to VPS~~ (deployed Session 9) | Fixed           |
| D2 | Deployment  | Middleware deprecated in Next.js 16 (migrate to proxy) | Before launch   |

## Tech Debt Register

| ID  | Class  | Description                                     | Target       | Status  |
|-----|--------|-------------------------------------------------|--------------|---------|
| TD1 | Minor  | Middleware file convention deprecated in Next 16 | Before launch | Open   |

## Security Posture

| Control                                     | Status  | Notes                                          |
|---------------------------------------------|---------|-------------------------------------------------|
| Input validation at all boundaries          | PASS    | Zod on all API routes                          |
| Field whitelisting on update operations     | PASS    | Validation schemas enforce allowed fields      |
| Parameterized queries                       | PASS    | Drizzle ORM handles parameterization           |
| No unsafe HTML injection with user data     | PASS    | sanitize.ts + security tests enforce           |
| No dynamic code execution with user input   | PASS    | Security pattern tests verify                  |
| Auth on all protected routes                | PASS    | Middleware redirects, requireAuth in API routes |
| Rate limiting on login                      | PASS    | 5 attempts per 15 minutes per IP               |
| Rate limiting on contact form               | PASS    | 3 submissions per hour per IP                  |
| CSRF / origin validation                    | PASS    | Origin/Referer validation on all mutations     |
| Security headers configured                 | PASS    | CSP, X-Frame-Options, HSTS, etc.              |
| No hardcoded secrets                        | PASS    | Security pattern tests verify                  |
| Environment files in .gitignore             | PASS    | .env, .env.local, .env.production             |
| .env.example exists                         | PASS    | Template with all required vars                |
| No PII in logs                              | PASS    | No console.log in production code              |
| PII encrypted at rest                       | PASS    | PostgreSQL deployed on VPS (Session 9)         |
| Dependency audit clean                      | WARN    | 2 HIGH, 8 moderate. 1 HIGH is prod (Next.js 16.1.7 DoS, fix = 16.2.3 -- staging required) |
| httpOnly session cookies                    | PASS    | Secure, SameSite=lax, httpOnly                 |
| Password hashing                            | PASS    | bcrypt via bcryptjs                            |
| RBAC roles enforced                         | PASS    | requireAuth/requireAdmin in auth.ts            |

## Accessibility Status

| Requirement                          | Status   | Notes                                    |
|--------------------------------------|----------|------------------------------------------|
| Language attribute on root element   | PASS     | lang="en" on html (E2E verified)         |
| Skip-to-content link                | PASS     | First focusable element (E2E verified)   |
| Semantic landmarks                   | PASS     | header, main, footer, nav, aside (E2E verified) |
| Image alt text                       | PASS     | All 5 stock images have descriptive alt text |
| Color contrast 4.5:1                 | PASS     | Brand palette designed for contrast      |
| Keyboard accessible                 | PASS     | All interactive elements reachable       |
| Focus indicators                     | PASS     | Custom focus-visible styles              |
| Touch targets 44x44px               | PASS     | Buttons meet minimum size                |
| Reduced motion respected             | PASS     | prefers-reduced-motion media query       |
| Heading hierarchy                    | PASS     | h1 on each page, proper nesting (E2E verified) |
| Form labels                         | PASS     | All inputs have associated labels (E2E verified) |
| ARIA on custom widgets               | PASS     | aria-expanded, aria-controls on mobile nav |
| 200% zoom clean                      | UNTESTED | Needs manual review                      |
| Screen reader tested                 | UNTESTED | Needs manual testing                     |

## Design Continuity Status

| Aspect                         | Status  | Notes                                      |
|--------------------------------|---------|--------------------------------------------|
| Color palette defined          | PASS    | EcoTrust: Steel Blue, Green CTA, Orange accent |
| Dark mode support              | PASS    | Class-based toggle, FOUC prevention, useSyncExternalStore |
| Brand colors consistent        | PASS    | shadcn tokens mapped to EcoTrust palette   |
| Component patterns consistent  | PASS    | shadcn/ui components with brand theming    |
| Typography hierarchy followed  | PASS    | Geist font configured                     |
| Spacing scale followed         | PASS    | Tailwind scale used consistently           |
| Header/Footer consistent       | PASS    | PublicHeader + PublicFooter components     |
| Button styling consistent      | PASS    | Button + ButtonLink with brand primary     |
| Transitions consistent         | PASS    | Reduced motion respected                   |
| Editorial layout patterns        | PASS    | Full-bleed images, staggered grids, dark bands, timelines |

## Test Coverage

| Test File              | Tests | Covers                                               |
|------------------------|-------|------------------------------------------------------|
| validation.test.ts     | 36    | Zod schemas (quickAdd, contact, login, stage, note, publicIntake) |
| sanitize.test.ts       | 10    | escapeHtml, sanitizeString, sanitizeEmail             |
| patterns.test.ts       | 8     | Security patterns (eval, innerHTML, secrets, etc.)   |
| fit-assessment.test.ts | 8     | Fit scoring engine (ratings, flags, edge cases)      |
| prompts.test.ts        | 8     | Template population, lookup, array values            |
| rate-limit.test.ts     | 4     | Rate limiter (allow, block, separate keys)           |
| csrf.test.ts           | 9     | CSRF validation (origin, referer, safe methods)      |

| E2E Test File          | Tests | Covers                                               |
|------------------------|-------|------------------------------------------------------|
| home.spec.ts           | 4     | Homepage title, heading, skip link, lang             |
| public-site.spec.ts    | 7     | All public pages, nav, footer, contact form          |
| auth.spec.ts           | 4     | Login page, invalid creds, auth redirects            |
| accessibility.spec.ts  | 16    | h1, lang, main landmark for all pages, form labels  |

| Metric                | Target          | Actual                   |
|-----------------------|-----------------|--------------------------|
| Unit test coverage    | 70%+            | ~70% (all lib files covered) |
| E2E critical paths    | 100%            | 90% (public + auth flows)   |
| Accessibility tests   | All public pages | PASS (all 5 pages tested)   |
| Security scan tests   | All API routes  | PASS (pattern scans)     |

## Audit History

| Date       | Session | Type    | Score       | Auditor | Key Changes                                   |
|------------|---------|---------|-------------|---------|-----------------------------------------------|
| 2026-03-07 | 1       | Initial | B (7.5/10)  | Claude  | Project setup, all quality gates passing      |
| 2026-03-07 | 2       | Build   | B+ (8.0/10) | Claude  | Public site, auth, dashboard, intake, APIs    |
| 2026-03-07 | 3       | Feature | A- (8.5/10) | Claude  | Fit engine, deliverables, prompts, rate limit, CSRF, E2E tests |
| 2026-03-07 | 4       | Design  | A- (8.5/10) | Claude  | EcoTrust palette rebrand, dark mode, ThemeToggle, mid-tone accents |
| 2026-03-07 | 5       | Design  | A  (9.0/10) | Claude  | Stock photography, editorial layout redesign for all public pages |
| 2026-03-07 | 6       | Feature | A  (9.0/10) | Claude  | Public intake form (48 Qs), /api/intake, content alignment, button routing |
| 2026-04-10 | 12      | Review  | A  (9.0/10) | Claude + Karli | Consultation form question audit with Karli. No code changes -- planning only. |
| 2026-04-11 | 14      | Audit   | A  (9.0/10) | Claude  | Fixed q34 field mismatch. Playwright config fixes (Turbopack crash, port). 83 unit tests, 30/31 E2E. Governance files updated. |
| 2026-04-12 | 15      | Governance | A- (8.5/10) | Claude | Portfolio quality sweep. Updated CLAUDE.md (Eight->Twelve Pillars, Data Protection, pnpm). Refreshed vulnerability detail (10 vulns, 1 HIGH prod Next.js DoS). VPS divergence: 3 commits behind local main + 15 unmerged feat commits. Missing: SECURITY-AUDIT.md, rollback runbook in DEPLOY.md. |
| 2026-04-25 | 16      | Deploy + CVE patch | A (9.0/10) | Claude | Pre-redesign cleanup + Phase 2b CVE patch shipped. Two commits on feat branch (governance/housekeeping + docs). Merged feat/consultation-form-redesign -> main (--no-ff `a56c997`). Phase 2b: surgical Next 16.1.7 -> 16.2.3 bump on `fix/next-16.2.3-cve-patch`, all local quality gates clean (test 83/83), staged on VPS at /tmp/the-marketing-reset-debug/ port 3099 (Ready 218ms, 8 routes smoke 200/404), merged --no-ff to main (`0bd26d1`), production deployed -- Ready in 231ms on Next 16.2.3, `reset.builtbybas.com` 200 OK. F15: O6 closed. New findings O7 (x-powered-by leak) + O8 (PM2 mode docs drift), both LOW. |
