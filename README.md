# Mustang Cafe POS

Web POS, customer kiosk, kitchen screen, and franchise admin prototype for Mustang Cafe.

## Local Development

The app can still run with the local JSON fallback when `DATABASE_URL` is not set:

```bash
npm install
npm start
```

Open:

- POS: `http://127.0.0.1:4173/pos/`
- Customer kiosk: `http://127.0.0.1:4173/customer/`
- Admin: `http://127.0.0.1:4173/admin/`

## PostgreSQL Deployment

Set `DATABASE_URL` before starting the server. When PostgreSQL is enabled, the server stores the app state in the `app_state` table.

```bash
npm install
DATABASE_URL="postgres://user:password@host:5432/database" npm start
```

On first start, the server creates the table and seeds from `db/fixture.json` if the database is empty.

To manually seed or reset the database from the fixture:

```bash
DATABASE_URL="postgres://user:password@host:5432/database" npm run db:seed
```

The fixture keeps startup data such as branches, users, roles, categories, menu, promotions, and queue tokens. It does not include customer order history.
