# VPS App User Isolation - Design Spec

**Date:** 2026-03-16
**Scope:** Server-wide infrastructure (VPS 72.62.200.30)
**Approach:** In-place ownership transfer (Approach A)

## Goal

Migrate 4 VPS apps from running under root's PM2 to dedicated no-login Linux service accounts with isolated PM2 instances. This improves security isolation, permission boundaries, and follows best practices.

## Current State

| App | Directory | Port | PM2 | Running As | DB User |
|-----|-----------|------|-----|------------|---------|
| ABHS | `/var/www/abhsweb/abhs` | 3005 | root | root | SQLite |
| Figaro | `/var/www/figaro` | 3004 | root | root | `figaro_user` |
| Marketing Reset | `/var/www/the-marketing-reset` | 3007 | root | root | `marketing_reset` |
| Umami | `/var/www/umami` | 3003 | root | root | `umami` (PG role) |
| BuiltByBas | `/var/www/builtbybas` | 3002 | root | root | `builtbybas` |
| ColourParlor | `/var/www/colourparlor` | 3001 | root | root | N/A (Supabase) |
| OrcaChild | `/home/orcachild/ocinw-website` | 3000 | orcachild | orcachild | N/A (Supabase) |

## Not In Scope

- **BuiltByBas** and **ColourParlor** stay under root PM2 (per user request)
- **OrcaChild** already isolated under `orcachild` user
- Nginx configs (proxy to localhost, user-agnostic)
- PostgreSQL DB credentials (apps connect with their own users already)
- UFW firewall rules

## Target State

| App | Linux User | Shell | Home Dir | PM2 Instance |
|-----|------------|-------|----------|-------------|
| ABHS | `abhs` | `/usr/sbin/nologin` | `/var/www/abhsweb` | `pm2-abhs.service` |
| Figaro | `figaro` | `/usr/sbin/nologin` | `/var/www/figaro` | `pm2-figaro.service` |
| Marketing Reset | `marketingreset` | `/usr/sbin/nologin` | `/var/www/the-marketing-reset` | `pm2-marketingreset.service` |
| Umami | `umamiapp` | `/usr/sbin/nologin` | `/var/www/umami` | `pm2-umamiapp.service` |

> **Note:** Umami's Linux user is `umamiapp` (not `umami`) to avoid confusion with the existing `umami` PostgreSQL role. Linux users and PG roles are separate namespaces, but distinct names prevent operational mistakes.

## User Creation

```bash
sudo useradd -r -s /usr/sbin/nologin -d /var/www/abhsweb -c "ABHS service" abhs
sudo useradd -r -s /usr/sbin/nologin -d /var/www/figaro -c "Figaro service" figaro
sudo useradd -r -s /usr/sbin/nologin -d /var/www/the-marketing-reset -c "Marketing Reset service" marketingreset
sudo useradd -r -s /usr/sbin/nologin -d /var/www/umami -c "Umami service" umamiapp
```

No passwords, no SSH access. Managed via `sudo -u <user> -s /bin/bash` from `orcachild`.

> **Note:** `-r` (system user) does not create home directories by default. The home dir already exists (it's the app dir in `/var/www/`), but we need to explicitly create the `.pm2` directory for each user after ownership transfer.

## PATH Considerations

Nologin users have no login shell and no profile sourcing. All PM2 and Node commands must be run with explicit PATH:

```bash
sudo -u <user> env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/<app-dir> bash -c '<command>'
```

The PM2 startup systemd service must also include the correct PATH in its `Environment=` directive.

## Per-App Migration Steps

Repeated for each app, one at a time:

1. **Stop in root PM2:** `sudo -u root bash -c 'export PM2_HOME=/root/.pm2 && pm2 delete <app-name>'`
2. **Transfer ownership:** `sudo chown -R <user>:<user> /var/www/<app-dir>`
3. **Create .pm2 directory:** `sudo mkdir -p /var/www/<app-dir>/.pm2 && sudo chown <user>:<user> /var/www/<app-dir>/.pm2`
4. **Lock .env files:** `sudo chmod 600 /var/www/<app-dir>/.env*`
5. **Start under new user PM2:**
   ```bash
   sudo -u <user> env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/<app-dir> \
     bash -c 'cd /var/www/<app-dir> && pm2 start <start-command> --name <app-name>'
   ```
6. **Save PM2 state:**
   ```bash
   sudo -u <user> env PATH=/usr/local/bin:/usr/bin:/bin HOME=/var/www/<app-dir> \
     bash -c 'pm2 save'
   ```
7. **Configure PM2 startup:**
   ```bash
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u <user> --hp /var/www/<app-dir>
   sudo systemctl enable pm2-<user>.service
   ```
8. **Verify app responds:**
   - `curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>` (direct)
   - If Nginx-proxied: also verify through the domain/Nginx

> **Note for ABHS:** Home dir is `/var/www/abhsweb` but app is at `/var/www/abhsweb/abhs`. The `chown -R` in step 2 targets `/var/www/abhsweb` (the parent) to cover both the `.pm2` dir and the app subdirectory.

> **Note for future builds:** After migration, any `next build`, `pnpm install`, or `npm install` must run as the service user, not root. Running as root would create root-owned files inside the user-owned directory.

## App Start Commands

Derived from current root PM2 configuration:

| App | Start Command | Notes |
|-----|--------------|-------|
| ABHS | `node_modules/.bin/next start -p 3005` | SQLite DB file must be writable by `abhs` user |
| Figaro | `pnpm start` | Port 3004 via .env |
| Marketing Reset | `node_modules/.bin/next start -p 3007` | |
| Umami | `npm start` | Port 3003 |

## Migration Order

Lowest risk first:

1. **Umami** - internal analytics, no client impact
2. **Figaro** - no domain, dev stage
3. **Marketing Reset** - no domain, dev stage
4. **ABHS** - no domain, furthest along

## Post-Migration Cleanup

1. Save root PM2 state after removing migrated apps: `sudo bash -c 'export PM2_HOME=/root/.pm2 && pm2 save'`
2. Verify root PM2 only shows BuiltByBas and ColourParlor
3. Update global `~/.claude/docs/vps-infrastructure.md` with:
   - New Linux users and their purpose
   - Updated PM2 instance ownership table
   - Access pattern documentation (`sudo -u <user>` pattern)
4. Update each project's local HANDOFF.md with its specific change (new user, how to manage)

## Rollback Plan

If any app fails after migration:

1. Stop the new user's PM2 process:
   ```bash
   sudo -u <user> env HOME=/var/www/<app-dir> bash -c 'pm2 delete <app-name>'
   ```
2. Remove the systemd startup service:
   ```bash
   sudo env PATH=$PATH:/usr/bin pm2 unstartup systemd -u <user> --hp /var/www/<app-dir>
   ```
3. Transfer ownership back to root:
   ```bash
   sudo chown -R root:root /var/www/<app-dir>
   ```
4. Clean up leftover `.pm2` directory:
   ```bash
   sudo rm -rf /var/www/<app-dir>/.pm2
   ```
5. Restart under root PM2:
   ```bash
   sudo bash -c 'export PM2_HOME=/root/.pm2 && cd /var/www/<app-dir> && pm2 start <start-command> --name <app-name> && pm2 save'
   ```
6. Investigate the issue before reattempting

## Verification Checklist (per app)

- [ ] App responds on its port: `curl http://localhost:<port>`
- [ ] If Nginx-proxied: domain resolves correctly
- [ ] `.env` files only readable by service user: `ls -la /var/www/<app-dir>/.env*`
- [ ] PM2 save succeeded: `sudo -u <user> env HOME=<dir> bash -c 'pm2 list'`
- [ ] Systemd service enabled: `systemctl is-enabled pm2-<user>`
- [ ] For ABHS: SQLite file writable by `abhs` user
- [ ] For Next.js apps: `.next/` directory owned by service user

## Security Benefits

- Apps can only read their own `.env` files (not each other's)
- A compromised app cannot access other apps' data or credentials
- No app runs with root privileges
- Each PM2 instance is isolated
- SQLite/file-based data isolated per user
