# The Marketing Reset — JawDrop Rebrand & Public Site Rebuild

> Design spec. Written 2026-04-12. Brainstormed live with Karli (client) and Bas.
> Supersedes the EcoTrust palette direction for the public marketing site.
> Does **not** change backend, API, auth, DB, form structure, or dashboard.

---

## 1. North-Star Reference

The v4 hero mockup Karli approved during brainstorming is the tonal reference for every page. It established:

- Pacific blue hero section with Lemonade sun top-right
- Fraunces display type, italic on emotional words
- Limeade block highlight on "the unlock word"
- Lemonade pill CTA on Lapis
- Stripe detail marking chapter starts
- Oat secondary section with Fraunces headings + italic lime phrases
- Palette-tag chips in 4-color rotation
- Generous whitespace, editorial rhythm

Every page is evaluated against: **does it feel like that hero?**

## 2. Governing Metaphor — "The site is the notebook"

Scroll = turning pages. The marketing website itself becomes a preview of the deliverable Karli sends clients home with after a Reset session.

- Each public page is a **chapter** in a book
- Corner bookmark tags mark each chapter
- A persistent lower-corner page number updates as the visitor scrolls ("1 of 5")
- Section transitions use a 4-frame page-curl hint (not a literal flip)
- By the time the visitor reaches the CTA, they've experienced a miniature version of the Reset itself

## 3. Scope

### In scope (public marketing site full rebuild)

| Page | Route | Treatment |
|------|-------|-----------|
| Home | `/` | Full redesign — Chapter 01: "The Noise" |
| About | `/about` | Full redesign — Chapter 02: "The Person" |
| How It Works | `/how-it-works` | Full redesign — Chapter 03: "The Reset" |
| Contact | `/contact` | Full redesign — Chapter 04: "The Invitation" |
| Get Started landing | `/get-started` | Full redesign — Chapter 05: "The Beginning" |
| Not Ready | `/not-ready` | Full redesign — Appendix |
| Header, footer | global | Rebuilt |
| 404, error boundary | global | Reskinned |

### Re-skinned only (token swap, zero structural change)

- Concierge (7-screen flow)
- Consultation form (all 6 steps, 54 questions)
- All existing Session 12 form components (`IntakeLinkTable`, `IntakeConfirmationCard`, `ConciergeCheckboxOption`, `ConciergeTextOption`, `ConciergeReadiness`)

### Out of scope — no touch

- Dashboard and all `(dashboard)/` routes
- Auth system (login, session, middleware)
- API routes, DB schema, Drizzle migrations, validation logic
- Form questions, form flow, form validation
- Dark mode (stays removed — light-only)
- Dependency upgrades (Next.js 16.2.3 CVE — tracked separately as Issue O6)
- Cross-project work

## 4. Design System

### 4.1 Palette (locked — confirmed against Karli's Lemonade Stand palette card)

| Name | Hex | Role |
|------|-----|------|
| **Lapis** | `#2D4670` | Text anchor, CTA bands, primary navy |
| **Pacific** | `#5B94C4` | Hero backgrounds, secondary sections, links |
| **Oat** | `#DFCEB0` | Primary warm background, alternating sections |
| **Lemonade** | `#F5D547` | CTAs, highlights, sun motif |
| **Limeade** | `#A8CC3E` | Block highlights on key words, accent tags |
| **Lime** | `#757F39` | Dividers, quote marks, supporting typography accents |

Each generates a Tailwind scale (50-900) for shades. Replaces EcoTrust tokens in `globals.css` and shadcn semantic mapping.

### 4.2 Typography

- **Fraunces** (Google) — display. Weights 300 / 400 / 500 + italic. Used on H1-H3 and editorial moments.
- **Inter** (Google) — body, UI, small text. Weights 400 / 500 / 600 / 700.
- Loaded via `next/font/google`, subset to Latin, `display: swap`.

### 4.3 Motion System (Framer Motion only — no new dependencies)

GSAP and Lenis were considered and **rejected** to keep dependencies lean. All scroll-linked effects use Framer's `useScroll` + `useTransform`, native CSS `position: sticky` for pinning, CSS `scroll-behavior: smooth` for smooth-scroll, and SVG `stroke-dashoffset` for path draws.

### 4.4 Signature Motion Moments (all 8 approved)

| # | Name | Chapter / Location | Tool |
|---|------|--------------------|------|
| 01 | **The Highlighter** | Every chapter — 2-4 moments per page | Framer `whileInView` + SVG path draw |
| 02 | **The Strikethrough Hero** | Home hero (Chapter 01) | Framer sequence + `AnimatePresence` + SVG stroke-dashoffset |
| 03 | **The Sun Arc** | Site-wide ambient | Framer `useScroll({ target: document })` + `useTransform` along Bézier path |
| 04 | **Noise → Signal** | Home, pinned scene (Chapter 01) | Native `position: sticky` + Framer `useScroll({ target: section })` |
| 05 | **Audience Mosaic** | Home + About | Framer `whileHover` + `whileInView` + CSS keyframe breathing |
| 06 | **The Reset Button** | Not Ready page (easter egg) | Framer exit animations on click |
| 07 | **The Plan Reveal** | How It Works, climax (Chapter 03) | Framer `useScroll({ target: section })` + per-line SVG stroke-dashoffset |
| 08 | **Tactile Stripes** | Throughout (ambient, low cost) | Pure CSS `@keyframes`, 2-3s duration, 2% translate jitter |

### 4.5 Non-Negotiables

- Every signature honors `prefers-reduced-motion: reduce` — snap to final state, no pinning, no smooth-scroll
- Every signature has a static visual fallback that still communicates content (no reliance on motion to understand meaning)
- Lighthouse Performance ≥ 90 (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- Lighthouse Accessibility ≥ 95
- JS bundle per route ≤ 180 KB gzipped (currently ~150)
- All interactive elements keyboard-reachable
- Color contrast minimum AA (AAA where text ≥ 18pt)

### 4.6 Shared Motifs

- **Yellow sun disc** — single SVG, reused as hero ornament, section marker, loading indicator
- **Hand-drawn stripe dividers** — SVG with subtle jitter
- **Highlighter stroke** — SVG path, reusable `<Highlight>` React component wrapping any `<span>`
- **Corner bookmark tags** — colored tab protruding from section edge, marks chapter
- **Page curl hint** — SVG overlay revealed at section scroll-out, 4 keyframes

## 5. Page-by-Page Treatments

### Chapter 01 — Home (`/`) — "The Noise"

1. **Hero** — Pacific background, Lemonade sun top-right, stripe detail top. **Strikethrough Hero Cycler** runs: "Post every day." → "Start a TikTok." → "Run more ads." → settles on "Start with clarity." in italic Fraunces with Limeade highlight. Sun begins its arc here.
2. **Who this is for** — Oat band, 4 category tags (Salons, Wellness, Food, Consultants), 2 highlighted phrases.
3. **Three shifts** — Pacific band pillar grid. Numbers 01/02/03 in Lemonade, Limeade, Lime.
4. **Noise → Signal** — pinned scene. Left: chaotic marketing-tactic fragments. Right: one clear sentence emerges.
5. **Audience Mosaic** — Lapis background, 6-8 service business tiles, breathing micro-motion, hover reveals testimonial line.
6. **CTA band** — Lapis with centered Lemonade pill button. Sun arc lands behind it.

### Chapter 02 — About (`/about`) — "The Person"

1. **Hero** — Oat background. Karli portrait left (natural light workspace). Right: Fraunces italic "I built this because —" with three highlighted phrases.
2. **Manifesto spread** — two-column book-spread. Left: "What I believe." Right: "What I refuse to do." Subtle page-curl divider.
3. **Values grid** — four values in Oat tiles with Limeade corner tags. Highlighter animates on the key verb.
4. **Audience Mosaic (second appearance)** — different tiles, same component.
5. **CTA** — "Ready to meet? →" link-style to contact.

### Chapter 03 — How It Works (`/how-it-works`) — "The Reset"

1. **Hero** — Pacific band. "One afternoon. One plan." Sun begins arc.
2. **Timeline** — vertical, 4 stages (Intake → Session → Plan → Follow-up). Lemonade-numbered circles. Jittering stripe dividers between stages.
3. **The Plan Reveal** — full-bleed Oat section containing the deliverable notebook mockup. As the visitor scrolls, lines draw themselves, headings get highlighted, corner tag flips in. **This is the climax — the moment that sells the product.**
4. **FAQ** — notebook-page styled accordions. Each Q opens like a page turn. Lime corner tab marks them.
5. **CTA** — "Start your reset" Lemonade pill, bottom centered.

### Chapter 04 — Contact (`/contact`) — "The Invitation"

- **Full-viewport split.** Left: Oat, Karli portrait + "Let's have a real conversation." Right: contact form on cream, minimal, input lines styled like notebook rules. Submit = Lemonade pill, "Send your note →".
- **Ambient:** sun tucked in upper-left corner, doesn't arc on this page (static chapter).
- No other sections — the page is intentionally quiet.

### Chapter 05 — Get Started landing (`/get-started`) — "The Beginning"

1. **Hero** — Oat. Fraunces: "This is the first blank page." Short paragraph prepping the visitor for the concierge (4 questions, ~3 min).
2. **Concierge + form** — reskin-only, palette/type/button tokens swap, zero structural change.

### Appendix — Not Ready (`/not-ready`) — "Come Back"

- Single-column Oat page. Fraunces: "Come back when the season fits." Soft paragraph acknowledging timing matters.
- **The Reset Button** easter egg — click it and the page animates into a calm "we'll be here" state.
- Sun is setting in the lower-right.

### Global Shell

- **Header** — minimal, Oat/transparent blur, Fraunces wordmark "The Marketing Reset" + Inter nav. Mobile = drawer.
- **Footer** — Lapis, minimal links, Limeade corner tag with "© 2026", stripe detail top.
- **404** — reskinned: "This page turned to a blank one."
- **Error boundary** — reskinned to match.

## 6. Photography

### Strategy

Licensed sourcing (Pexels / Unsplash / licensed stock) matching the 11 inspiration photos Karli shared as a brief. Photos are peppered rhythmically through pages — not hero-dominant. Karli can veto/swap any image.

### Per-page allocation

| Page | Count | Brief |
|------|-------|-------|
| Home hero | 0 | Typography + sun only |
| Home — Audience Mosaic | 6-8 | Diverse service businesses; natural light; real workspaces |
| Home — testimonial band | 1 | Single portrait, close crop, reflective |
| About hero | 1 | Karli's portrait (or placeholder matching `image0.jpeg` aesthetic) |
| About — Audience Mosaic | 6-8 | Reuses component, different tiles |
| Contact hero | 1 | Candid hand-writing-in-notebook style |
| All other pages | 0 | Typography / motifs only |

### Sourcing brief

- **Subjects** — service-business owners at work. Diversity across race, gender, age, body type, ability. Mix of industries (salon, spa, bakery, florist, tattoo, coach, coffee, boutique).
- **Lighting** — natural daylight. No harsh studio flash.
- **Framing** — candid > posed. Working, not looking at camera. Hands visible often.
- **Environments** — real workspaces. Not stocky conference rooms.
- **Color grading** — subtle warm LUT in CSS to tie photos to Oat/Pacific palette (desaturate ~5%, warm ~+3%).
- **Licensing** — only Pexels / Unsplash / licensed stock. Document per photo in `public/images/credits.md`.
- **Format** — WebP + AVIF fallback. Next.js `<Image>` responsive.

### Existing photos (`public/images/`)

Audit current 5 images (`collaboration.jpg`, `cozy-workspace.jpg`, `bookshelf-nook.jpg`, `notebook-pen.jpg`, `strategy-session.jpg`) against the new palette/brief. Keep what fits, source new for gaps. Nothing deleted this session (data protection rule).

## 7. Technical Architecture

### 7.1 New files

```
src/lib/
  motion.ts                    # Framer variants + reduced-motion utility
  fonts.ts                     # next/font setup (Fraunces + Inter)

src/components/
  motion/
    SunArc.tsx                 # Scroll-linked sun traversal
    Highlight.tsx              # <Highlight>key word</Highlight>
    StrikethroughCycler.tsx    # Hero bad-advice cycler
    PageCurlTransition.tsx     # Section exit hint
    NoiseToSignal.tsx          # Pinned chaos → clarity
    PlanReveal.tsx             # Scroll-driven notebook write
    ResetButton.tsx            # Easter egg on /not-ready
    AudienceMosaic.tsx         # Living photo wall
    AudienceTile.tsx           # Individual tile with hover testimonial
  brand/
    StripeDivider.tsx          # Jittering stripe SVG
    ChapterTag.tsx             # Corner bookmark tag
    BookPageNumber.tsx         # Live "1 of 5" indicator
    SunBadge.tsx               # Reusable sun SVG
```

### 7.2 Files modified (not replaced)

```
src/app/globals.css            # Palette tokens swapped
tailwind.config.ts             # Color scales regenerated
src/app/layout.tsx             # Fonts wired in, FOUC script kept
components.json                # shadcn theme updated
src/components/ui/button.tsx   # Pill variant added
```

### 7.3 Files rewritten (page redesigns)

```
src/app/(public)/page.tsx
src/app/(public)/about/page.tsx
src/app/(public)/how-it-works/page.tsx
src/app/(public)/contact/page.tsx
src/app/(public)/get-started/page.tsx
src/app/(public)/not-ready/page.tsx
src/app/not-found.tsx
src/app/error.tsx
src/components/site-header.tsx
src/components/site-footer.tsx
```

### 7.4 Reskinned only

```
src/components/intake/**                      # Token swap only
src/components/ConciergeCheckboxOption.tsx    # Token swap only
src/components/ConciergeTextOption.tsx        # Token swap only
src/components/ConciergeReadiness.tsx         # Token swap only
src/components/IntakeConfirmationCard.tsx     # Token swap only
src/components/IntakeLinkTable.tsx            # Token swap only
```

### 7.5 Zero-touch (never modified)

- `src/lib/validation.ts`
- `src/lib/schema.ts`
- `src/lib/auth.ts`
- `src/lib/fit-assessment.ts`
- `src/lib/prompts.ts`
- `src/lib/db.ts`
- `src/lib/env.ts`
- `src/lib/rate-limit.ts`
- `src/lib/csrf.ts`
- `src/app/api/**`
- `src/app/(dashboard)/**`
- `drizzle/**`
- `.env*`

### 7.6 Blast-radius audit

| Touches | Yes/No | Notes |
|---------|--------|-------|
| Database schema | No | Zero migrations |
| API routes / validation | No | Unchanged |
| Auth / sessions | No | Unchanged |
| Form logic / questions | No | Reskin only |
| Dashboard | No | Out of scope |
| Unit tests | No | No logic changes |
| E2E tests | Some | Selector updates where page structure shifts |
| Build pipeline / deps | No new deps | Framer-only, `package.json` unchanged |
| `.env`, secrets | No | Zero touch |

## 8. Branch Strategy & Rollout

### Sequence

1. **Push + merge `feat/consultation-form-redesign` to `main`** first (existing in-flight branch — must clear before rebuild).
2. **Branch off main: `feat/jawdrop-rebrand-2026`.**
3. **Work in vertical slices** (design-system → home → about → how-it-works → contact → get-started reskin → not-ready → global polish) with Bas verifying each slice on `pnpm dev` before the next starts.
4. **All quality gates pass before any push.**
5. **Ship to staging first** (per DEPLOY.md rollback runbook). Only after Bas sign-off does it merge to main and deploy.

### Quality gates per slice

| Gate | Command | Target |
|------|---------|--------|
| Type safety | `pnpm type-check` | 0 errors |
| Lint | `pnpm lint` | 0 errors, 0 warnings |
| Unit tests | `pnpm test` | 83/83 still passing |
| E2E tests | `pnpm test:e2e` | 30/30 pass (login test blocked, unrelated) |
| Build | `pnpm build` | Success, no warnings |
| Bundle budget | `.next/analyze` | ≤ 180 KB gzipped per route |
| Lighthouse (dev) | Chrome audit | Performance ≥ 90, A11y ≥ 95 |
| Reduced motion | Manual | Every signature falls back cleanly |
| Keyboard nav | Manual | All CTAs and chapter tabs reachable |

### Rollback plan

- Every deploy preceded by a `git tag known-good-YYYY-MM-DD` on main
- DEPLOY.md rollback runbook (added Session 15) applies
- Under 5 minutes to restore on live

### Risks

| Risk | Mitigation |
|------|-----------|
| Signature motion feels gimmicky or slow on real devices | On-device testing (laptop + mid-tier Android) per slice; performance budget enforced |
| Re-skinning form breaks validation via token name collisions | Reskin only swaps Tailwind classes; no logic or prop changes; unit tests catch regressions |
| Orphaned `bg-brand-*` classes after palette migration | Grep audit at end of design-system slice; all old tokens removed |
| Bundle size creeps past budget | SVGs optimized via SVGO; components lazy-loaded where possible |
| Vision drift during implementation | Bas verifies each vertical slice on dev; this spec is the contract |

## 9. Success Criteria

The rebuild is complete when:

1. All six public pages are rebuilt to match the north-star hero reference
2. All eight signature motion moments are implemented and respect `prefers-reduced-motion`
3. All quality gates pass
4. Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on the deployed site
5. The concierge and form still function exactly as they do today (Karli's Session 12 content preserved)
6. Karli verifies the live staging site and gives sign-off
7. A visitor arriving cold can describe at least one signature moment after 60 seconds on the site ("there's a sun that moves," "key words get highlighted," "the bad advice gets crossed out")

## 10. Non-Goals

- This is not a redesign of the Reset product or its offerings
- This is not a change to Karli's tone, copy positioning, or content decisions from Session 12
- This is not a backend or infrastructure change
- This is not a dashboard refresh
- This is not a performance optimization pass (separate initiative)
- This is not a security audit pass (separate initiative)
