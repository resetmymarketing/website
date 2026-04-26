# VPS App User Isolation - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate 4 VPS apps (Umami, Figaro, Marketing Reset, ABHS) from root PM2 to dedicated no-login Linux service accounts with isolated PM2 instances.

**Architecture:** In-place ownership transfer. Create service users, stop app in root PM2, chown directories, restart under new user's PM2 with systemd startup. One app at a time, lowest risk first.

**Tech Stack:** Ubuntu 24.04, PM2, systemd, SSH

**SSH command pattern:** All commands run from local Windows machine via:
```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "<command>"
```

**Env pattern for nologin users:** All PM2/node commands for service users must use:
```bash
sudo -u <user> env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/<app-dir> bash -c '<command>'
```

**Spec:** `docs/superpowers/specs/2026-03-16-vps-user-isolation-design.md`

**Rollback:** If any app fails after migration, see the Rollback Plan section in the spec document above. It has full step-by-step commands to revert a single app back to root PM2.

---

## Chunk 1: Pre-Flight and User Creation

### Task 1: Pre-flight snapshot

Capture current state so we can verify nothing breaks and have rollback data.

**Files:** None (VPS commands only)

- [x] **Step 1: Snapshot root PM2 state**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 list'"
```

Expected: All 6 apps listed (builtbybas, colourparlor, abhs, figaro, the-marketing-reset, umami) with status `online`.

- [x] **Step 2: Verify all 4 target apps respond**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "curl -s -o /dev/null -w 'umami:%{http_code}\n' http://localhost:3003 && curl -s -o /dev/null -w 'figaro:%{http_code}\n' http://localhost:3004 && curl -s -o /dev/null -w 'abhs:%{http_code}\n' http://localhost:3005 && curl -s -o /dev/null -w 'tmr:%{http_code}\n' http://localhost:3007"
```

Expected: All return `200`.

- [x] **Step 3: Record current file ownership for rollback reference**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "ls -la /var/www/umami/.env && ls -la /var/www/figaro/.env && ls -la /var/www/the-marketing-reset/.env.local && ls -la /var/www/abhsweb/abhs/.env.local"
```

Expected: All owned by `root:root`.

### Task 2: Create all 4 service users

Create all users upfront before migrating any apps. This is safe and non-disruptive.

**Files:** None (VPS commands only)

- [x] **Step 1: Create the 4 no-login service accounts**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo useradd -r -s /usr/sbin/nologin -d /var/www/umami -c 'Umami service' umamiapp && sudo useradd -r -s /usr/sbin/nologin -d /var/www/figaro -c 'Figaro service' figaro && sudo useradd -r -s /usr/sbin/nologin -d /var/www/the-marketing-reset -c 'Marketing Reset service' marketingreset && sudo useradd -r -s /usr/sbin/nologin -d /var/www/abhsweb -c 'ABHS service' abhs && echo 'All users created'"
```

Expected: `All users created` (no errors).

- [x] **Step 2: Verify users exist**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "id umamiapp && id figaro && id marketingreset && id abhs"
```

Expected: 4 lines showing uid/gid for each user, shell `/usr/sbin/nologin`.

---

## Chunk 2: Migrate Umami (App 1 of 4)

Internal analytics tool. Lowest risk - no client impact.

### Task 3: Stop Umami in root PM2

- [x] **Step 1: Delete Umami from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 delete umami'"
```

Expected: `[PM2] Applying action deleteProcessId on app [umami](ids: 2)`

- [x] **Step 2: Verify Umami is gone from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 list'"
```

Expected: 5 apps remaining (no `umami`).

### Task 4: Transfer Umami ownership and lock .env

- [x] **Step 1: chown the Umami directory to umamiapp**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chown -R umamiapp:umamiapp /var/www/umami"
```

Expected: No output (success).

- [x] **Step 2: Create .pm2 directory**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo mkdir -p /var/www/umami/.pm2 && sudo chown umamiapp:umamiapp /var/www/umami/.pm2"
```

Expected: No output (success).

- [x] **Step 3: Lock .env files**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chmod 600 /var/www/umami/.env*"
```

Expected: No output (success).

- [x] **Step 4: Verify ownership and permissions**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "ls -la /var/www/umami/.env && ls -la /var/www/umami/.pm2 && ls -ld /var/www/umami"
```

Expected: All owned by `umamiapp:umamiapp`, `.env` permissions `-rw-------`.

### Task 5: Start Umami under umamiapp PM2

- [x] **Step 1: Start Umami with new user's PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u umamiapp env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/umami bash -c 'cd /var/www/umami && pm2 start npm --name umami -- start'"
```

Expected: PM2 table showing `umami` with status `online`.

- [x] **Step 2: Verify Umami responds**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3003"
```

Expected: `200`.

- [x] **Step 3: Save PM2 state**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u umamiapp env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/umami bash -c 'pm2 save'"
```

Expected: `[PM2] Saving current process list...` `[PM2] Successfully saved`.

### Task 6: Configure Umami PM2 startup service

- [x] **Step 1: Generate systemd startup for umamiapp**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo env PATH=/usr/local/bin:/usr/bin:/bin pm2 startup systemd -u umamiapp --hp /var/www/umami"
```

Expected: Output showing systemd service created. May output a command to run - if so, run it.

- [x] **Step 2: Enable the service**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo systemctl enable pm2-umamiapp.service"
```

Expected: `Created symlink...` or already enabled.

- [x] **Step 3: Verify service is enabled**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "systemctl is-enabled pm2-umamiapp"
```

Expected: `enabled`.

- [x] **Step 4: Verify analytics.builtbybas.com still works through Nginx**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "curl -s -o /dev/null -w '%{http_code}' https://analytics.builtbybas.com"
```

Expected: `200`.

---

## Chunk 3: Migrate Figaro (App 2 of 4)

No domain, dev stage. Port 3004.

### Task 7: Stop Figaro in root PM2

- [x] **Step 1: Delete Figaro from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 delete figaro'"
```

Expected: `[PM2] Applying action deleteProcessId on app [figaro]`

- [x] **Step 2: Verify Figaro is gone from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 list'"
```

Expected: 4 apps remaining (no `figaro`).

### Task 8: Transfer Figaro ownership and lock .env

- [x] **Step 1: chown the Figaro directory**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chown -R figaro:figaro /var/www/figaro"
```

- [x] **Step 2: Create .pm2 directory**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo mkdir -p /var/www/figaro/.pm2 && sudo chown figaro:figaro /var/www/figaro/.pm2"
```

- [x] **Step 3: Lock .env files**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chmod 600 /var/www/figaro/.env*"
```

- [x] **Step 4: Verify ownership and permissions**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "ls -la /var/www/figaro/.env && ls -la /var/www/figaro/.pm2 && ls -ld /var/www/figaro"
```

Expected: All owned by `figaro:figaro`, `.env` permissions `-rw-------`.

### Task 9: Start Figaro under figaro PM2

- [x] **Step 1: Start Figaro with new user's PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u figaro env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/figaro bash -c 'cd /var/www/figaro && pm2 start pnpm --name figaro -- start'"
```

Expected: PM2 table showing `figaro` with status `online`.

- [x] **Step 2: Verify Figaro responds**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3004"
```

Expected: `200`.

- [x] **Step 3: Save PM2 state**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u figaro env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/figaro bash -c 'pm2 save'"
```

Expected: Successfully saved.

### Task 10: Configure Figaro PM2 startup service

- [x] **Step 1: Generate systemd startup for figaro**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo env PATH=/usr/local/bin:/usr/bin:/bin pm2 startup systemd -u figaro --hp /var/www/figaro"
```

- [x] **Step 2: Enable the service**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo systemctl enable pm2-figaro.service"
```

- [x] **Step 3: Verify service is enabled**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "systemctl is-enabled pm2-figaro"
```

Expected: `enabled`.

---

## Chunk 4: Migrate Marketing Reset (App 3 of 4)

No domain, dev stage. Port 3007.

### Task 11: Stop Marketing Reset in root PM2

- [x] **Step 1: Delete Marketing Reset from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 delete the-marketing-reset'"
```

Expected: `[PM2] Applying action deleteProcessId on app [the-marketing-reset]`

- [x] **Step 2: Verify Marketing Reset is gone from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 list'"
```

Expected: 3 apps remaining (no `the-marketing-reset`).

### Task 12: Transfer Marketing Reset ownership and lock .env

- [x] **Step 1: chown the Marketing Reset directory**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chown -R marketingreset:marketingreset /var/www/the-marketing-reset"
```

- [x] **Step 2: Create .pm2 directory**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo mkdir -p /var/www/the-marketing-reset/.pm2 && sudo chown marketingreset:marketingreset /var/www/the-marketing-reset/.pm2"
```

- [x] **Step 3: Lock .env files**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chmod 600 /var/www/the-marketing-reset/.env*"
```

- [x] **Step 4: Verify ownership and permissions**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "ls -la /var/www/the-marketing-reset/.env.local && ls -la /var/www/the-marketing-reset/.pm2 && ls -ld /var/www/the-marketing-reset"
```

Expected: All owned by `marketingreset:marketingreset`, `.env.local` permissions `-rw-------`.

### Task 13: Start Marketing Reset under marketingreset PM2

- [x] **Step 1: Start Marketing Reset with new user's PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u marketingreset env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/the-marketing-reset bash -c 'cd /var/www/the-marketing-reset && pm2 start node_modules/.bin/next --name the-marketing-reset -- start -p 3007'"
```

Expected: PM2 table showing `the-marketing-reset` with status `online`.

- [x] **Step 2: Verify Marketing Reset responds**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3007"
```

Expected: `200`.

- [x] **Step 3: Save PM2 state**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u marketingreset env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/the-marketing-reset bash -c 'pm2 save'"
```

Expected: Successfully saved.

### Task 14: Configure Marketing Reset PM2 startup service

- [x] **Step 1: Generate systemd startup for marketingreset**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo env PATH=/usr/local/bin:/usr/bin:/bin pm2 startup systemd -u marketingreset --hp /var/www/the-marketing-reset"
```

- [x] **Step 2: Enable the service**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo systemctl enable pm2-marketingreset.service"
```

- [x] **Step 3: Verify service is enabled**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "systemctl is-enabled pm2-marketingreset"
```

Expected: `enabled`.

---

## Chunk 5: Migrate ABHS (App 4 of 4)

No domain, furthest along. Port 3005. Uses SQLite. App at `/var/www/abhsweb/abhs`, home at `/var/www/abhsweb`.

### Task 15: Stop ABHS in root PM2

- [x] **Step 1: Delete ABHS from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 delete abhs'"
```

Expected: `[PM2] Applying action deleteProcessId on app [abhs]`

- [x] **Step 2: Verify ABHS is gone from root PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 list'"
```

Expected: 2 apps remaining (builtbybas, colourparlor only).

### Task 16: Transfer ABHS ownership and lock .env

Note: chown targets `/var/www/abhsweb` (the parent), not `/var/www/abhsweb/abhs`, so it covers both the `.pm2` dir and the app subdirectory.

- [x] **Step 1: chown the ABHS parent directory**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chown -R abhs:abhs /var/www/abhsweb"
```

- [x] **Step 2: Create .pm2 directory**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo mkdir -p /var/www/abhsweb/.pm2 && sudo chown abhs:abhs /var/www/abhsweb/.pm2"
```

- [x] **Step 3: Lock .env files**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo chmod 600 /var/www/abhsweb/abhs/.env*"
```

- [x] **Step 4: Verify ownership and permissions**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "ls -la /var/www/abhsweb/abhs/.env.local && ls -la /var/www/abhsweb/.pm2 && ls -ld /var/www/abhsweb"
```

Expected: All owned by `abhs:abhs`, `.env.local` permissions `-rw-------`.

- [x] **Step 5: Verify SQLite DB file ownership**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "find /var/www/abhsweb/abhs -name '*.db' -o -name '*.sqlite' -o -name '*.sqlite3' 2>/dev/null | head -5 | xargs ls -la 2>/dev/null || echo 'No SQLite files found (may be created at runtime)'"
```

Expected: Any SQLite files owned by `abhs:abhs` (covered by the recursive chown).

### Task 17: Start ABHS under abhs PM2

- [x] **Step 1: Start ABHS with new user's PM2**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u abhs env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/abhsweb bash -c 'cd /var/www/abhsweb/abhs && pm2 start node_modules/.bin/next --name abhs -- start -p 3005'"
```

Expected: PM2 table showing `abhs` with status `online`.

- [x] **Step 2: Verify ABHS responds**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3005"
```

Expected: `200`.

- [x] **Step 3: Save PM2 state**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo -u abhs env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/abhsweb bash -c 'pm2 save'"
```

Expected: Successfully saved.

### Task 18: Configure ABHS PM2 startup service

- [x] **Step 1: Generate systemd startup for abhs**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo env PATH=/usr/local/bin:/usr/bin:/bin pm2 startup systemd -u abhs --hp /var/www/abhsweb"
```

- [x] **Step 2: Enable the service**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo systemctl enable pm2-abhs.service"
```

- [x] **Step 3: Verify service is enabled**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "systemctl is-enabled pm2-abhs"
```

Expected: `enabled`.

---

## Chunk 6: Post-Migration Cleanup and Verification

### Task 19: Save root PM2 state and verify

- [x] **Step 1: Save root PM2 (should only have builtbybas and colourparlor)**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 save && pm2 list'"
```

Expected: Only `builtbybas` and `colourparlor` listed.

### Task 20: Full verification sweep

- [x] **Step 1: Verify all apps respond on their ports**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "echo '=== ALL APPS ===' && curl -s -o /dev/null -w 'ocinw(3000):%{http_code}\n' http://localhost:3000 && curl -s -o /dev/null -w 'colourparlor(3001):%{http_code}\n' http://localhost:3001 && curl -s -o /dev/null -w 'builtbybas(3002):%{http_code}\n' http://localhost:3002 && curl -s -o /dev/null -w 'umami(3003):%{http_code}\n' http://localhost:3003 && curl -s -o /dev/null -w 'figaro(3004):%{http_code}\n' http://localhost:3004 && curl -s -o /dev/null -w 'abhs(3005):%{http_code}\n' http://localhost:3005 && curl -s -o /dev/null -w 'tmr(3007):%{http_code}\n' http://localhost:3007"
```

Expected: All return `200`.

- [x] **Step 2: Verify all PM2 instances**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "echo '=== ROOT PM2 ===' && sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 list' && echo '=== ORCACHILD PM2 ===' && pm2 list && echo '=== UMAMIAPP PM2 ===' && sudo -u umamiapp env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/umami bash -c 'pm2 list' && echo '=== FIGARO PM2 ===' && sudo -u figaro env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/figaro bash -c 'pm2 list' && echo '=== MARKETINGRESET PM2 ===' && sudo -u marketingreset env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/the-marketing-reset bash -c 'pm2 list' && echo '=== ABHS PM2 ===' && sudo -u abhs env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/abhsweb bash -c 'pm2 list'"
```

Expected:
- Root: builtbybas, colourparlor
- orcachild: ocinw
- umamiapp: umami
- figaro: figaro
- marketingreset: the-marketing-reset
- abhs: abhs

- [x] **Step 3: Verify all systemd services are enabled**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "systemctl is-enabled pm2-root pm2-orcachild pm2-umamiapp pm2-figaro pm2-marketingreset pm2-abhs"
```

Expected: All show `enabled`.

- [x] **Step 4: Verify .env file isolation (each user can only read their own)**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "echo '=== Cross-read test ===' && sudo -u figaro cat /var/www/umami/.env 2>&1 | head -1 && sudo -u umamiapp cat /var/www/figaro/.env 2>&1 | head -1 && sudo -u marketingreset cat /var/www/figaro/.env 2>&1 | head -1 && sudo -u abhs cat /var/www/the-marketing-reset/.env.local 2>&1 | head -1"
```

Expected: All return `Permission denied`.

- [x] **Step 5: Verify .next/ ownership for Next.js apps**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "ls -ld /var/www/figaro/.next && ls -ld /var/www/the-marketing-reset/.next && ls -ld /var/www/abhsweb/abhs/.next"
```

Expected: All `.next/` directories owned by their respective service users (figaro, marketingreset, abhs).

- [x] **Step 6: Verify Nginx-proxied domains still work**

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30 "curl -s -o /dev/null -w 'analytics.builtbybas.com:%{http_code}\n' https://analytics.builtbybas.com && curl -s -o /dev/null -w 'builtbybas.com:%{http_code}\n' https://builtbybas.com && curl -s -o /dev/null -w 'thecolourparlor.com:%{http_code}\n' https://thecolourparlor.com && curl -s -o /dev/null -w 'orcachildinthewild.com:%{http_code}\n' https://www.orcachildinthewild.com"
```

Expected: All return `200`.

### Task 21: Update global documentation

- [x] **Step 1: Update `~/.claude/docs/vps-infrastructure.md`**

Update the following sections on the local machine:
- Add a "Linux Users" section documenting all service accounts
- Update PM2 Commands section to show per-user patterns
- Update the Security section with the new access pattern

Changes to make:
- Add Linux Users table: root (builtbybas, colourparlor), orcachild (ocinw), umamiapp (umami), figaro (figaro), marketingreset (the-marketing-reset), abhs (abhs)
- Add management command: `sudo -u <user> env PATH=/usr/local/bin:/usr/bin:/bin HOME=<home-dir> bash -c '<command>'`
- Note: future deploys/builds must run as the service user, not root

- [x] **Step 2: Update each project's HANDOFF.md**

For each of the 4 migrated projects, add a note to its HANDOFF.md documenting:
- The new Linux service user that runs the app
- The management command pattern for that user
- That all future builds/deploys must run as the service user

| Project | User | Management command |
|---------|------|-------------|
| Marketing Reset | `marketingreset` | `sudo -u marketingreset env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/the-marketing-reset bash -c '<cmd>'` |
| ABHS | `abhs` | `sudo -u abhs env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/abhsweb bash -c '<cmd>'` |
| Figaro | `figaro` | `sudo -u figaro env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/figaro bash -c '<cmd>'` |
| Umami | `umamiapp` | `sudo -u umamiapp env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/umami bash -c '<cmd>'` |
