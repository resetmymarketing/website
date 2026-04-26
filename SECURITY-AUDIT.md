# The Marketing Reset -- Security Audit

> **Project:** The Marketing Reset
> **Checklist Source:** `~/.claude/docs/penetration-test-checklist.md` (20 categories, 200+ items)
> **Last Full Sweep:** Not yet executed -- baseline file created 2026-04-12
> **Tester:** Claude + Bas
> **Overall Status:** needs-rerun (file seeded, sweep pending)

---

## Executive Summary

- **Total items tested:** 0 / 200+
- **Pass:** 0
- **Fail:** 0
- **N/A:** 0
- **Remediated:** 0
- **Critical findings open:** 0 (untested)
- **High findings open:** 1 known (Next.js 16.1.7 DoS CVE, deploy blocker -- tracked in AUDIT.md, fix = 16.2.3 with staging)
- **Ready for delivery / launch:** NO -- full sweep not executed + open Next.js CVE in production

---

## Known-State Security Posture (from AUDIT.md, verified 2026-04-12)

| Control                                     | Status  | Evidence                                             |
|---------------------------------------------|---------|------------------------------------------------------|
| Input validation at all boundaries          | PASS    | Zod schemas in `src/lib/validation.ts`               |
| Field whitelisting on update operations     | PASS    | Validation schemas enforce allowed fields            |
| Parameterized queries                       | PASS    | Drizzle ORM handles parameterization                 |
| No unsafe HTML injection with user data     | PASS    | `src/lib/sanitize.ts` + pattern tests enforce        |
| No dynamic code execution with user input   | PASS    | Pattern tests verify no eval/exec/new Function       |
| Auth on all protected routes                | PASS    | `middleware.ts` + `requireAuth` in API routes        |
| Rate limiting on login                      | PASS    | 5 attempts per 15 minutes per IP                     |
| Rate limiting on contact form               | PASS    | 3 submissions per hour per IP                        |
| CSRF / origin validation                    | PASS    | `src/lib/csrf.ts` on all mutation routes             |
| Security headers configured                 | PASS    | CSP, X-Frame-Options, HSTS in `next.config.ts`       |
| No hardcoded secrets                        | PASS    | Pattern tests scan for credential strings            |
| Environment files in `.gitignore`           | PASS    | `.env`, `.env.local`, `.env.production`              |
| `.env.example` exists                       | PASS    | Template with 4 required vars                        |
| No PII in logs                              | PASS    | No console.log in production code                    |
| PII encrypted at rest                       | PASS    | PostgreSQL on VPS with chmod 600 credentials         |
| httpOnly session cookies                    | PASS    | Secure, SameSite=lax, httpOnly                       |
| Password hashing                            | PASS    | bcrypt via bcryptjs                                  |
| RBAC roles enforced                         | PASS    | `requireAuth`/`requireAdmin` in `src/lib/auth.ts`    |
| Dependency audit clean                      | **FAIL**| 2 HIGH (1 prod: Next.js 16.1.7 DoS), 8 moderate      |

---

## Section Status

Track completion of each category from the global checklist.

| #  | Category                                        | Items | Status | Critical | High | Medium | Low | Date |
|----|-------------------------------------------------|-------|--------|----------|------|--------|-----|------|
| 1  | Injection Attacks                               | 12    | Pending|          |      |        |     |      |
| 2  | Cross-Site Scripting (XSS)                      | 9     | Pending|          |      |        |     |      |
| 3  | Authentication and Session Management           | 15    | Pending|          |      |        |     |      |
| 4  | Authorization and Access Control                | 12    | Pending|          |      |        |     |      |
| 5  | API Security                                    | 12    | Pending|          |      |        |     |      |
| 6  | Data Protection and Cryptography                | 12    | Pending|          |      |        |     |      |
| 7  | Infrastructure and Server Security              | 14    | Pending|          |      |        |     |      |
| 8  | Client-Side Security                            | 10    | Pending|          |      |        |     |      |
| 9  | File Upload and Processing                      | 9     | N/A    |          |      |        |     |      |
| 10 | Cross-Site Request Forgery (CSRF)               | 5     | Pending|          |      |        |     |      |
| 11 | Business Logic Vulnerabilities                  | 10    | Pending|          |      |        |     |      |
| 12 | Denial of Service (DoS) Resilience              | 7     | Pending|          |      |        |     |      |
| 13 | Third-Party and Supply Chain Security           | 8     | Partial|          | 1    |        |     | 2026-04-12 |
| 14 | Logging, Monitoring, and Incident Response      | 7     | Pending|          |      |        |     |      |
| 15 | Next.js / React Specific                        | 11    | Pending|          | 1    |        |     | 2026-04-12 |
| 16 | Database Security                               | 8     | Pending|          |      |        |     |      |
| 17 | Email and Communication Security                | 5     | N/A    |          |      |        |     |      |
| 18 | Mobile and Responsive Security                  | 5     | Pending|          |      |        |     |      |
| 19 | Compliance and Privacy                          | 7     | Pending|          |      |        |     |      |
| 20 | Social Engineering and Physical Security        | 5     | Pending|          |      |        |     |      |

**N/A reasons:**
- Section 9 (File Upload): no file upload paths in the application.
- Section 17 (Email): no outbound email integration; contact form stores submissions in DB only.

---

## Detailed Results

Per-section test result tables will be added here as each section is executed. Section 1 template provided; sections 2-20 pulled verbatim from `~/.claude/docs/penetration-test-checklist.md` as they are run.

### Section 1: Injection Attacks

| Test Item                                                                           | Status | Evidence / File / Line | Notes |
|-------------------------------------------------------------------------------------|--------|------------------------|-------|
| SQL Injection: parameterized queries enforced on all DB calls                       |        |                        |       |
| SQL Injection: test UNION-based, blind, time-based, and error-based variants        |        |                        |       |
| SQL Injection: stored procedures and dynamic SQL tested                             |        |                        |       |
| NoSQL Injection: MongoDB/document DB query operator injection                       | N/A    |                        | No NoSQL in stack |
| Command Injection: OS command execution via user input                              |        |                        |       |
| LDAP Injection                                                                      | N/A    |                        | No LDAP |
| XPath/XML Injection                                                                 | N/A    |                        | No XML parsers |
| Template Injection (SSTI)                                                           |        |                        |       |
| Header Injection: HTTP response splitting                                           |        |                        |       |
| Email Header Injection                                                              | N/A    |                        | No email sending |
| Log Injection                                                                       |        |                        |       |
| ORM Injection: raw query usage audited even with Drizzle in place                   |        |                        |       |

---

## Findings Log

| Finding ID | Section | Severity | Description                                  | AUDIT.md Ref | Status | Remediation                                                     |
|------------|---------|----------|----------------------------------------------|--------------|--------|-----------------------------------------------------------------|
| SEC-001    | 15      | HIGH     | Next.js 16.1.7 Server Components DoS CVE     | Dep audit row| Open   | Bump to 16.2.3 with VPS staging protocol (see HANDOFF / DEPLOY) |
| SEC-002    | 13      | HIGH     | Vite 6.4.1 arbitrary file read (dev-only)    | Dep audit row| Open   | Bump to 6.4.2 (no prod impact, dev server only)                 |

---

## Re-Sweep History

| Date       | Scope              | Tester         | Summary                                                                                             |
|------------|--------------------|----------------|-----------------------------------------------------------------------------------------------------|
| 2026-04-12 | File seeded        | Claude + Bas   | Baseline file created during portfolio governance sweep (Session 15). Full 200-item sweep pending.  |

---

## Sign-Off

- **Ready for client delivery:** NO -- full sweep not executed
- **Ready for production launch:** NO -- open HIGH CVE (Next.js DoS) + unfinished sweep
- **Next scheduled re-sweep:** Execute full 200-item sweep before feat branch merge to production
