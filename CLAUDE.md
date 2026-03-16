# The Marketing Reset - Project Instructions

> This file is the AI's project guide. Read this first every session.

## Project Overview

**Name:** The Marketing Reset
**Type:** Unified web app (public marketing site + operations dashboard)
**Client:** Karli Rosario
**Purpose:** A one-time strategic marketing clarity service for service-based businesses

## Tech Stack (LOCKED)

| Layer | Choice |
|-------|--------|
| Language | TypeScript (strict mode) |
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (self-hosted) |
| ORM | Drizzle ORM |
| Auth | Custom (httpOnly cookies, bcrypt, RBAC) |
| Validation | Zod (every boundary) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Package Manager | npm |
| Linting | ESLint + Prettier |

**Changing any layer requires documented justification in HANDOFF.md and explicit user approval.**

## Architecture

- `src/app/(public)/` - Public marketing site (SSR, SEO-optimized)
- `src/app/(dashboard)/` - Operations dashboard (auth-protected)
- `src/app/api/` - API routes (Zod validated, sanitized)
- `src/lib/` - Shared logic (db, schema, validation, sanitize, utils)
- `src/components/` - Reusable components
- `drizzle/` - Database migrations

## Eight Pillars (Non-Negotiable)

1. **Security Minded** - Can this be exploited?
2. **Structure** - Can someone else pick this up tomorrow?
3. **Performance** - Does this respect the user's time and device?
4. **Inclusive** - Can everyone use this?
5. **Non-Bias** - Does this assume or exclude?
6. **UX Minded** - Does this feel intentional and clear?
7. **Universal Design** - Does this work for the widest range of people?
8. **R3S** - What happens when something fails?

## Conflict Resolution

- Security > Performance > Convenience
- Accessibility > Aesthetics
- Data Privacy > Feature Completeness

## Prohibited Actions

- Never force-push to any shared branch
- Never commit .env or secrets
- Never inject user-supplied data as raw HTML
- Never use `any` type or unsafe casts
- Never pass raw request body to database
- Never store tokens in localStorage/sessionStorage
- Never expose secret keys to client bundles
- Never skip auth checks on protected routes
- Never delete user data without confirmation
- Never log PII (names, emails, phone numbers)
- Never ship without passing quality gates
- Never use eval(), exec(), or new Function()
- Never skip hooks or bypass safety checks
- Never use @ts-ignore without documented justification

## Session Protocol

**Start:** Read HANDOFF.md, AUDIT.md, ProjectHealth.md. Run tests. State understanding.
**During:** Follow pillars. Mark todos. Log issues in AUDIT.md. Test before/after.
**End:** Update HANDOFF.md, AUDIT.md, ProjectHealth.md. Run quality gates. Recommend next steps.

## Quality Gates (All Must Pass)

1. `npm run type-check` - 0 errors
2. `npm run lint` - 0 errors
3. `npm run test` - All passing
4. `npm run build` - 0 errors

## Key Files

- `CLAUDE.md` - This file (project instructions)
- `HANDOFF.md` - Session continuity
- `AUDIT.md` - Quality & issues tracker
- `ProjectHealth.md` - Health summary
- `BuiltByBasProjectSetup.md` - Standards reference (in .claude/)
- `.env.example` - Environment variable template

## Brand

- EcoTrust palette (Steel Blue + Green CTA + Orange Accent)
- Primary brand: #1F4E79 (Steel Blue), scale --brand-50 through --brand-900
- CTA: #4CAF50 (Green) with BLACK text (white fails 4.5:1 contrast)
- Accent: #FFA726 (Orange) for highlights, badges, warnings
- Cool neutrals (--warm-50 through --warm-900)
- Dark mode: class-based (.dark), FOUC prevention script in layout.tsx
- Tone: grounded, strategic, supportive, clear, not corporate
- No em-dashes in public content
- No competitor bashing
- AI works behind the scenes (never lead with "AI")
