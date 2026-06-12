const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const root = path.join(__dirname, "..");
const fixturePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, "db", "fixture.json");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Example: DATABASE_URL=postgres://user:pass@host:5432/db npm run db:seed");
  process.exit(1);
}

if (!fs.existsSync(fixturePath)) {
  console.error(`Fixture not found: ${fixturePath}`);
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  const state = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  await pool.query(`
    create table if not exists app_state (
      id text primary key,
      state jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  await pool.query(`
    insert into app_state (id, state, updated_at)
    values ($1, $2::jsonb, now())
    on conflict (id)
    do update set state = excluded.state, updated_at = now()
  `, ["default", JSON.stringify(state)]);
  console.log(`Seeded app_state from ${path.relative(root, fixturePath)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
