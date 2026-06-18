# Railway Hobby Deployment

This guide deploys Mustang Cafe POS to Railway Hobby with one Node.js web service, one PostgreSQL database, and one persistent volume for uploaded menu images.

## Recommended Railway Setup

- Plan: Hobby
- Services: 1 Node.js web service + 1 PostgreSQL database
- Web service instances: 1
- Volume: mount to `/app/uploads`
- Start command: `npm start`
- Health check: `/api/health`

## 1. Prepare GitHub

Push this repository to GitHub.

Before deploying, make sure these files are included:

- `package.json`
- `server.js`
- `app.js`
- `index.html`
- `admin/index.html`
- `railway.json`
- `db/fixture.json`
- `db/schema.sql`
- `scripts/seed-postgres.js`

Do not commit local runtime files:

- `.env`
- `node_modules/`
- `uploads/`

## 2. Create Railway Project

1. Open Railway.
2. Create a new project.
3. Choose Deploy from GitHub repo.
4. Select the Mustang POS repository.
5. Railway should detect Node.js automatically.
6. Confirm the service uses `railway.json`.

The service should start with:

```bash
npm start
```

## 3. Add PostgreSQL

1. In the same Railway project, add a PostgreSQL database.
2. Open the Node.js web service.
3. Go to Variables.
4. Add `DATABASE_URL` by referencing the Railway PostgreSQL connection URL.

Use Railway's variable reference from the PostgreSQL service, for example:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

The exact service name may differ. Use the variable picker in Railway if the name is not `Postgres`.

## 4. Add Upload Volume

Uploaded menu pictures are stored under `uploads/menu/...`.

Create a Railway volume for the Node.js web service:

- Mount path: `/app/uploads`
- Size: start with 1 GB

This keeps uploaded menu images after redeploys and restarts.

If you skip this step, uploaded menu images may disappear after redeploy because the app filesystem is ephemeral.

## 5. First Deploy

Deploy the web service.

After deployment finishes, open:

```text
https://YOUR-RAILWAY-DOMAIN/api/health
```

Expected result:

```json
{
  "ok": true,
  "backend": "postgresql",
  "realtime": "sse",
  "realtimeClients": 0
}
```

If `backend` is `local-json`, `DATABASE_URL` is missing or wrong.

## 6. Verify Main Screens

Open these URLs:

```text
https://YOUR-RAILWAY-DOMAIN/pos/
https://YOUR-RAILWAY-DOMAIN/customer/
https://YOUR-RAILWAY-DOMAIN/admin/
```

Login test users:

```text
owner / mustang666
franchise / mustang666
manager / mustang666
cashier / mustang666
kitchen / mustang666
customer / mustang666
```

For production, change passwords from the admin page.

## 7. Realtime Test

Use two devices or two browser windows:

1. Device A: open `/pos/`
2. Device B: open the kitchen screen
3. Create a paid order from Device A
4. Confirm the kitchen screen shows the order without refresh
5. Mark all items done
6. Click food ready
7. Confirm the pickup screen updates without refresh
8. Click picked up / token returned

The sync status should show:

- `Realtime` when SSE is connected
- `Online` when fallback polling is active
- `Local only` only when the device cannot reach the server

## 8. Cloudflare Recommendation

During testing, avoid proxying the Railway domain through Cloudflare.

If you use Cloudflare for a custom domain, disable HTTP/3/QUIC first if Chrome shows:

```text
ERR_QUIC_PROTOCOL_ERROR
```

The app uses SSE at `/api/events`, and keeping the path simple helps avoid realtime connection issues.

## 9. Manual Database Seed

The server seeds PostgreSQL from `db/fixture.json` automatically if the database is empty.

If you need to reset the database intentionally, run this from Railway shell or locally with the production `DATABASE_URL`:

```bash
npm run db:seed
```

Warning: this replaces the app state with fixture data.

## 10. Post-Deploy Checklist

- `/api/health` shows `backend: "postgresql"`
- `/api/events` connects
- `/api/state` returns `cache-control: no-store`
- Uploading a menu image creates a file under `uploads/menu`
- Uploaded image still appears after redeploy
- POS, kitchen, and pickup screens update without manual refresh

