# The Marketing Reset - VPS Deployment Guide

> Domain: resetmymarketing.com
> Port: 3007
> App name: the-marketing-reset
> Directory: /var/www/the-marketing-reset

## First-Time Setup (run once)

### 1. Clone the repo

```bash
cd /var/www
git clone git@github.com:YOUR_USERNAME/the-marketing-reset.git
cd the-marketing-reset
```

### 2. Create the PostgreSQL database

```bash
sudo -u postgres psql
```

```sql
CREATE USER marketing_reset WITH PASSWORD 'GENERATE_A_STRONG_PASSWORD';
CREATE DATABASE marketing_reset OWNER marketing_reset;
GRANT ALL PRIVILEGES ON DATABASE marketing_reset TO marketing_reset;
\q
```

### 3. Create the .env.local file

```bash
nano /var/www/the-marketing-reset/.env.local
```

Add:
```
DATABASE_URL=postgresql://marketing_reset:YOUR_PASSWORD@localhost:5432/marketing_reset
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://resetmymarketing.com
SESSION_SECRET=GENERATE_WITH_node_-e_"console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Install dependencies and run migration

```bash
cd /var/www/the-marketing-reset
pnpm install --frozen-lockfile
pnpm drizzle-kit push
```

### 5. Seed the admin user

```bash
pnpm tsx scripts/seed-admin.ts
```

Change the default password immediately after first login.

### 6. Build the app

```bash
pnpm build
```

### 7. Create logs directory

```bash
mkdir -p /var/www/the-marketing-reset/logs
```

### 8. Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Verify it is running:
```bash
pm2 status
pm2 logs the-marketing-reset --lines 10
```

### 9. Set up Nginx

```bash
sudo cp /var/www/the-marketing-reset/nginx/resetmymarketing.com /etc/nginx/sites-available/resetmymarketing.com
sudo ln -s /etc/nginx/sites-available/resetmymarketing.com /etc/nginx/sites-enabled/
sudo nginx -t
```

### 10. Get SSL certificate (before enabling HTTPS in Nginx)

Comment out the HTTPS server block in the Nginx config first, then:

```bash
sudo certbot --nginx -d resetmymarketing.com -d www.resetmymarketing.com
```

Certbot will update the Nginx config with the SSL paths. Then restore the full config:

```bash
sudo cp /var/www/the-marketing-reset/nginx/resetmymarketing.com /etc/nginx/sites-available/resetmymarketing.com
sudo nginx -t && sudo systemctl reload nginx
```

### 11. Open the firewall port

```bash
sudo ufw allow 3007/tcp && sudo ufw reload
```

Note: Port 3007 only needs to be open if you want direct access. Nginx proxies from 443, so this is optional.

### 12. Point DNS

Add these DNS records at your registrar:
- **A record**: `resetmymarketing.com` -> your VPS IP
- **A record**: `www.resetmymarketing.com` -> your VPS IP

---

## Deploying Updates

Every time you push changes to GitHub:

```bash
cd /var/www/the-marketing-reset
git pull
pnpm install --frozen-lockfile
pnpm build
pm2 restart the-marketing-reset
```

If there are database schema changes:
```bash
cd /var/www/the-marketing-reset
git pull
pnpm install --frozen-lockfile
pnpm drizzle-kit push
pnpm build
pm2 restart the-marketing-reset
```

### Quick health check after deploy

```bash
pm2 logs the-marketing-reset --lines 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3007
```

Should return `200`.

---

## Rollback Runbook (Recovery)

> **Added 2026-04-12** (Session 15) in response to Figaro Session 16 incident. A rollback performed without a documented runbook is slow and error-prone under pressure. Use this.

### Last Known-Good Commit

- **2026-04-25 (after Phase 2b deploy, S16):** `0bd26d1` -- Merge branch 'fix/next-16.2.3-cve-patch' into main. Currently deployed on VPS via marketingreset user + SSH deploy key, serving production on <https://reset.builtbybas.com>. **Next.js 16.2.3** (CVE GHSA-q4gf-8mx6-v5v3 patched), Ready in 231ms, NODE_ENV=production, 250M memory cap, comprehensive ecosystem config. Includes consultation form redesign + JawDrop rebrand spec committed (not implemented yet).
- **Previous LKG (2026-04-12, after Phase 2a):** `9ba05e1` -- chore: add Dependabot. Next.js 16.1.7. Deployed via marketingreset user + SSH deploy key.
- **Pre-2026-04-12:** `1d9db89` -- Merge remote main branch. Deployed via root user + legacy deploy key (now archived).
- Update this line after every successful production deploy.

### When to Roll Back

- 5xx errors spiking after deploy
- PM2 restart-looping (`pm2 show the-marketing-reset` shows rising restart count)
- Build succeeded but runtime crashes (check `pm2 logs` for stack traces; `next start` wrapped by PM2 surfaces as generic `ELIFECYCLE`)
- Any regression visible on smoke test after deploy

**Rule:** rollback first, debug second. The site goes back up, then we investigate.

### Rollback Command Sequence

All commands run as the `marketingreset` service user:

```bash
ssh -i ~/.ssh/orcachild_vps -p 2222 orcachild@72.62.200.30

sudo -u marketingreset env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/the-marketing-reset bash -c '
  cd /var/www/the-marketing-reset && \
  git log --oneline -5 && \
  git reset --hard <LAST_KNOWN_GOOD_COMMIT> && \
  pnpm install --frozen-lockfile && \
  pnpm build && \
  pm2 restart the-marketing-reset
'
```

Replace `<LAST_KNOWN_GOOD_COMMIT>` with the hash from the section above.

### Post-Rollback Verification

```bash
# PM2 status (should show online and uptime growing)
sudo -u marketingreset env HOME=/var/www/the-marketing-reset pm2 status

# Local health probe
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3007

# Public endpoint
curl -s -o /dev/null -w "%{http_code}\n" https://reset.builtbybas.com

# Tail logs for clean startup (no errors in last 20 lines)
sudo -u marketingreset env HOME=/var/www/the-marketing-reset pm2 logs the-marketing-reset --lines 20 --nostream
```

Expected: both curls return `200`, PM2 shows `online`, uptime increasing, no errors in recent logs.

### Restoring `.env.local`

The `.env.local` file on the VPS is chmod 600 to `marketingreset`. If it is ever lost:

- Keys required (per `.env.example`): `DATABASE_URL`, `NODE_ENV`, `NEXT_PUBLIC_APP_URL`, `SESSION_SECRET`
- `DATABASE_URL` format: `postgresql://marketing_reset:<password>@localhost:5432/marketing_reset`
- DB password lives only in the existing `.env.local` -- if lost, reset via `ALTER USER marketing_reset WITH PASSWORD '<new>';` as postgres superuser and update `.env.local`
- `SESSION_SECRET` must be regenerated with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` -- regenerating invalidates all existing sessions (forces re-login, acceptable)

After restoring `.env.local`, restart: `sudo -u marketingreset pm2 restart the-marketing-reset`.

### After Any Successful Deploy

1. Smoke test live URL
2. Update "Last Known-Good Commit" section above with the new hash
3. Commit the DEPLOY.md change with a message like `chore: update last-known-good commit to <hash>`

---

## Troubleshooting

### App not starting
```bash
pm2 logs the-marketing-reset --lines 50
```

### Database connection issues
```bash
sudo systemctl status postgresql
psql -U marketing_reset -d marketing_reset -c "SELECT 1;"
```

### Nginx issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -20 /var/log/nginx/error.log
```

### Memory issues
```bash
pm2 restart the-marketing-reset --max-memory-restart 250M && pm2 save
```

### Full server health
```bash
uptime && free -h && df -h / && pm2 status
```
