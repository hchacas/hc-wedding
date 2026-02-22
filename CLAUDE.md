# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HC Wedding is a monorepo for a wedding RSVP application with two services: an Astro SSR frontend (`ui/`) and an Express.js API backend (`api/`). Both run behind an Nginx reverse proxy in Docker.

## Commands

### Frontend (ui/)
```bash
npm run dev      # Dev server on port 4321
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend (api/)
```bash
npm run dev           # Dev server with --watch
npm run start         # Production start on port 3001
npm run init-db       # Initialize SQLite database
npm run create-admin                    # Create admin (default: admin/admin123, dev only)
npm run create-admin -- --interactive  # Create admin interactively (use for production)
npm run create-admin -- -u <user> -p <pass> -n "Name"  # Create admin with flags
```

### Creating / resetting admin credentials
Always use the script — it runs `Admin.hashPassword()` (bcrypt, cost 12) automatically. Never insert a password hash manually.

```bash
# New admin — interactive (recommended for production)
cd api && npm run create-admin -- --interactive

# New admin — flags
cd api && npm run create-admin -- -u <user> -p <password> -n "Full Name"

# Reset password: delete the row, then recreate
sqlite3 api/data/wedding.db "DELETE FROM admins WHERE username='<user>';"
cd api && npm run create-admin -- --interactive
```

### Docker
```bash
docker compose up --build                              # Development
docker compose --profile production up -d --build     # Production
```

### Database Migrations
```bash
node api/scripts/migrate-database.js   # Apply pending migrations
```

## Architecture

### Services
- **wedding-api** (Express, port 3001): REST API with SQLite database
- **wedding-ui** (Astro/Node, port 4321): SSR frontend
- **Nginx**: Reverse proxy routing traffic to both services

### API Structure (`api/src/`)
- `config/` — Database connection (`database.js`) and OAuth setup (`oauth.js`)
- `models/` — Raw SQL query wrappers for `Guest`, `Invitation`, `Admin` tables
- `routes/` — Express routers: `auth.js`, `rsvp.js`, `admin.js`, `invitations.js`
- `middleware/` — `auth.js` (Passport OAuth guard), `basicAuth.js` (admin Basic Auth)

### Frontend Structure (`ui/src/`)
- `pages/` — File-based Astro routes; `invitacion/[token].astro` handles personalized invite URLs
- `components/` — Astro components (Hero, Countdown, EventDetails, RSVPForm, etc.)
- `layouts/` — `BaseLayout.astro` root template
- `styles/tokens.css` — CSS custom properties for the design system (warm ivory/sand palette)

### Authentication
- **Guests**: Google OAuth 2.0 via Passport.js → `express-session` (24h TTL)
- **Admins**: HTTP Basic Auth via custom middleware. Passwords hashed with **bcrypt (cost 12)** via `bcryptjs`. `validatePassword()` is migration-aware: falls back to legacy SHA256 and auto-upgrades the hash on first successful login — no lockout after deploy.
  - **Always use `npm run create-admin`** to create accounts — never insert password hashes manually, the script handles bcrypt automatically.
  - To reset a password: `sqlite3 api/data/wedding.db "DELETE FROM admins WHERE username='<user>';"` then re-run `create-admin`.

### Data Model
Three SQLite tables (no ORM, promisified raw SQL):
- `invitations` — unique token, guest_name, personalized message
- `guests` — linked to OAuth via `auth_id`, stores RSVP responses
- `admins` — Basic Auth credentials (hashed passwords)

### Environment Variables
API requires: `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CALLBACK_URL`, `FRONTEND_URL`
UI requires: `API_URL`, `FRONTEND_URL` (injected via Vite in `astro.config.mjs`)

### CI/CD
GitHub Actions builds 4 Docker images (api, ui-server, ui-proxy, nginx-proxy), pushes to GHCR, and SSH-deploys to DigitalOcean. Production domain: `sheilayhabib.com`.

## Production

### Server Access
```bash
ssh -i ~/.ssh/id_ed25519_DigitalOcean root@209.38.233.151
```

### Container Names
- `wedding-api` — Express API (port 3001)
- `wedding-ui-server` — Astro SSR (port 4321)
- `wedding-proxy` — Nginx reverse proxy

### Volume
Named volume `wedding-data` is mounted at `/app/data/` inside `wedding-api`. This persists the SQLite DB across redeploys.

### DB Ownership Issue
Named volume files are created as `root:root` at first start, but the container runs as `appuser` (UID 100). After the permanent fix (Step 5), the entrypoint script runs `chown` as root then drops to `appuser`. If the DB is ever read-only after a redeploy on an older image:
```bash
docker exec -u root wedding-api chown -R appuser:appgroup /app/data/
```

### Running Scripts Inside the Container
```bash
docker exec wedding-api node scripts/create-admin.js -u <user> -p <pass> -n "Full Name"
```

### Reset Admin Password (Production)
```bash
# 1. Generate bcrypt hash inside the container
HASH=$(docker exec -u root wedding-api node --input-type=module -e "
import bcrypt from './node_modules/bcryptjs/index.js';
const h = await bcrypt.hash('NEW_PASSWORD', 12);
process.stdout.write(h);
" 2>/dev/null)

# 2. Write it to the DB
docker exec -u root wedding-api sqlite3 /app/data/wedding.db \
  "UPDATE admins SET password_hash='\$HASH' WHERE username='admin';"

# OR: delete row then recreate
docker exec -u root wedding-api sqlite3 /app/data/wedding.db \
  "DELETE FROM admins WHERE username='admin';"
docker exec wedding-api node scripts/create-admin.js -u admin -p NEW_PASSWORD -n "Admin"
```
