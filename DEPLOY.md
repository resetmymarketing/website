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
