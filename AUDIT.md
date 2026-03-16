# The Marketing Reset - Audit & Issues Tracker

> Living record of project quality. Updated whenever issues are found or fixed.

## Quality Gates

| Gate             | Command              | Result | Notes                                         |
|------------------|----------------------|--------|-----------------------------------------------|
| Type checking    | `npm run type-check` | PASS   | 0 errors, strict mode                         |
| Linting          | `npm run lint`       | PASS   | 0 errors, 0 warnings                          |
| Tests            | `npm run test`       | PASS   | 62/62 passing                                 |
| Build            | `npm run build`      | PASS   | 27 routes (9 static, 15 dynamic, 3 API groups) |
| E2E tests        | `npx playwright test`| PASS   | 31/31 passing                                 |
| Dependency audit | `npm audit`          | WARN   | 4 moderate (dev-only, esbuild in drizzle-kit)  |

### Vulnerability Detail

| Package | Severity | Path                       | Production Impact | Action                          |
|---------|----------|----------------------------|-------------------|---------------------------------|
| esbuild | Moderate | drizzle-kit > @esbuild-kit | None (dev-only)   | Monitor for drizzle-kit update  |

## Issues Tracker

### Severity Definitions

| Severity | Definition                                       | SLA                      |
|----------|--------------------------------------------------|--------------------------|
| CRITICAL | Blocks deployment, data loss risk, security exploit | Fix immediately          |
| HIGH     | Major functionality broken, security vulnerability  | Fix before launch        |
| MEDIUM   | Degraded experience, minor security concern         | Fix before next session  |
| LOW      | Cosmetic, minor inconsistency                       | Fix when convenient      |

### Open Issues

| ID | Severity | Category | Issue          | Found | Status |
|----|----------|----------|----------------|-------|--------|
|    |          |          | No open issues |       |        |

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

### Deferred Issues

| ID | Phase/Reason | Issue                                               | Target             |
|----|-------------|-----------------------------------------------------|--------------------|
| D1 | Deployment  | Database not yet connected to VPS                   | Before launch      |
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
| PII encrypted at rest                       | PENDING | Database not yet connected to VPS              |
| Dependency audit clean                      | WARN    | 4 moderate dev-only vulnerabilities            |
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
| validation.test.ts     | 15    | Zod schemas (quickAdd, contact, login, stage, note)  |
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
