const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const dataDir = path.join(root, "data");
const uploadDir = path.join(root, "uploads", "menu");
const stateFile = path.join(dataDir, "state.json");
const fixtureFile = path.join(root, "db", "fixture.json");
const port = Number(process.env.PORT || 4173);
const clients = new Set();
const usePostgres = Boolean(process.env.DATABASE_URL);
let pgPool;

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

function sendHead(res, status = 200, headers = {}) {
  res.writeHead(status, headers);
  res.end();
}

function getPool() {
  if (!usePostgres) return null;
  if (!pgPool) {
    const { Pool } = require("pg");
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pgPool;
}

function readFileState() {
  if (!fs.existsSync(stateFile)) return null;
  return JSON.parse(fs.readFileSync(stateFile, "utf8"));
}

function writeFileState(state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

async function readState() {
  if (!usePostgres) return readFileState();
  const result = await getPool().query("select state from app_state where id = $1", ["default"]);
  return result.rows[0]?.state || null;
}

async function writeState(state) {
  state = normalizeStoredImages(state);
  if (!usePostgres) {
    writeFileState(state);
    return;
  }
  await getPool().query(
    `
      insert into app_state (id, state, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (id)
      do update set state = excluded.state, updated_at = now()
    `,
    ["default", JSON.stringify(state)],
  );
}

function safeFilePart(value) {
  return (
    String(value || "menu")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "menu"
  );
}

function imageExtension(mimeType) {
  return (
    {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    }[mimeType] || "jpg"
  );
}

function normalizeStoredImages(state) {
  if (!state || !Array.isArray(state.menu)) return state;
  for (const item of state.menu) {
    if (typeof item.image !== "string" || !item.image.startsWith("data:image/")) continue;
    const match = item.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) continue;
    const [, mimeType, base64] = match;
    const buffer = Buffer.from(base64, "base64");
    const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 12);
    const filename = `${safeFilePart(item.sku || item.id)}-${hash}.${imageExtension(mimeType)}`;
    const absolute = path.join(uploadDir, filename);
    if (!fs.existsSync(absolute)) fs.writeFileSync(absolute, buffer);
    item.image = `uploads/menu/${filename}`;
  }
  return state;
}

async function ensureDatabase() {
  if (!usePostgres) return;
  await getPool().query(`
    create table if not exists app_state (
      id text primary key,
      state jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
  const result = await getPool().query("select 1 from app_state where id = $1", ["default"]);
  if (result.rowCount) return;
  const fixtureSource = fs.existsSync(fixtureFile) ? fixtureFile : stateFile;
  if (!fs.existsSync(fixtureSource)) return;
  const fixture = JSON.parse(fs.readFileSync(fixtureSource, "utf8"));
  await writeState(fixture);
  console.log(`Seeded PostgreSQL app_state from ${path.relative(root, fixtureSource)}`);
}

const statusRank = {
  pending_payment: 1,
  in_kitchen: 2,
  ready: 3,
  picked_up: 4,
  cancelled: 4,
};

function orderFreshness(order) {
  return Number(
    order?._updatedAt || Date.parse(order?.pickedUpAt || order?.readyAt || order?.paidAt || order?.createdAt || 0) || 0,
  );
}

async function mergeStateByFreshness(incomingState, { allowCatalogWrite = false } = {}) {
  const currentState = await readState();
  if (!currentState || !incomingState) return incomingState || currentState;
  const mergedState = {
    ...incomingState,
    menu: currentState.menu,
    categories: currentState.categories,
    masterTemplate: currentState.masterTemplate,
  };
  if (allowCatalogWrite) {
    mergedState.categories = incomingState.categories;
    mergedState.masterTemplate = incomingState.masterTemplate;
    if (!currentState?.menu?.length || !incomingState?.menu?.length) {
      mergedState.menu = incomingState.menu;
      return mergeOrdersByFreshness(currentState, mergedState);
    }
    const currentById = new Map(currentState.menu.map((item) => [item.id, item]));
    mergedState.menu = incomingState.menu.map((incomingItem) => {
      const currentItem = currentById.get(incomingItem.id);
      if (!currentItem) return incomingItem;
      const currentTime = Number(currentItem._updatedAt || 0);
      const incomingTime = Number(incomingItem._updatedAt || 0);
      if (currentTime > incomingTime) return currentItem;
      return incomingItem;
    });
    for (const currentItem of currentState.menu) {
      if (!mergedState.menu.some((item) => item.id === currentItem.id)) mergedState.menu.push(currentItem);
    }
  }
  return mergeOrdersByFreshness(currentState, mergedState);
}

function mergeOrdersByFreshness(currentState, incomingState) {
  const mergedById = new Map();
  for (const order of currentState.orders || []) mergedById.set(order.id, order);
  for (const incomingOrder of incomingState.orders || []) {
    const currentOrder = mergedById.get(incomingOrder.id);
    if (!currentOrder) {
      mergedById.set(incomingOrder.id, incomingOrder);
      continue;
    }
    const incomingTime = orderFreshness(incomingOrder);
    const currentTime = orderFreshness(currentOrder);
    const incomingRank = statusRank[incomingOrder.status] || 0;
    const currentRank = statusRank[currentOrder.status] || 0;
    if (incomingTime > currentTime || (incomingTime === currentTime && incomingRank >= currentRank)) {
      mergedById.set(incomingOrder.id, incomingOrder);
    }
  }
  incomingState.orders = Array.from(mergedById.values()).sort(
    (a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0),
  );
  return incomingState;
}

function broadcast(event) {
  const payload = `data: ${JSON.stringify({ ...event, at: Date.now() })}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".webmanifest": "application/manifest+json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
    }[ext] || "application/octet-stream"
  );
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = decodeURIComponent(url.pathname);
  if (filePath === "/") filePath = "/index.html";
  if (filePath === "/pos/" || filePath === "/pos") filePath = "/index.html";
  if (filePath === "/customer/" || filePath === "/customer") filePath = "/index.html";
  if (filePath === "/admin/" || filePath === "/admin") filePath = "/admin/index.html";
  const absolute = path.normalize(path.join(root, filePath));
  if (!absolute.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(absolute, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentType(absolute),
      "Cache-Control": absolute.endsWith(".html") ? "no-store" : "no-cache",
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    if (req.method === "HEAD" && req.url === "/api/events") {
      return sendHead(res, 200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "*",
      });
    }

    if (req.method === "GET" && req.url === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(": connected\n\n");
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && req.url === "/api/health") {
      if (req.method === "HEAD") {
        return sendHead(res, 200, {
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        });
      }
      return sendJson(res, {
        ok: true,
        backend: usePostgres ? "postgresql" : "local-json",
        realtime: "sse",
        realtimeClients: clients.size,
        now: new Date().toISOString(),
      });
    }

    if ((req.method === "GET" || req.method === "HEAD") && req.url === "/api/state") {
      return sendJson(res, { state: await readState() });
    }

    if (req.method === "POST" && req.url === "/api/state") {
      const body = JSON.parse(await readBody(req));
      await writeState(await mergeStateByFreshness(body.state, { allowCatalogWrite: body.allowCatalogWrite === true }));
      broadcast({ type: "state_updated", payload: {} });
      return sendJson(res, { ok: true });
    }

    if (req.method === "POST" && req.url === "/api/menu") {
      const body = JSON.parse(await readBody(req));
      const state = (await readState()) || body.state;
      if (!state || !body.menu?.id) return sendJson(res, { error: "Missing state or menu" }, 400);
      state.menu = Array.isArray(state.menu) ? state.menu : [];
      body.menu._updatedAt = Date.now();
      const index = state.menu.findIndex((item) => item.id === body.menu.id);
      if (index >= 0) state.menu[index] = body.menu;
      else state.menu.push(body.menu);
      state.masterTemplate = state.masterTemplate || { version: 1, menuIds: [] };
      state.masterTemplate.menuIds = Array.isArray(state.masterTemplate.menuIds) ? state.masterTemplate.menuIds : [];
      if (!state.masterTemplate.menuIds.includes(body.menu.id)) state.masterTemplate.menuIds.push(body.menu.id);
      await writeState(state);
      broadcast({ type: "state_updated", payload: { menuId: body.menu.id } });
      return sendJson(res, { ok: true, state, menu: body.menu });
    }

    if (req.method === "POST" && req.url === "/api/event") {
      const event = JSON.parse(await readBody(req));
      if (event.state)
        await writeState(await mergeStateByFreshness(event.state, { allowCatalogWrite: event.allowCatalogWrite === true }));
      broadcast(event);
      return sendJson(res, { ok: true });
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, { error: error.message }, 500);
  }
});

ensureDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Mustang POS realtime server running at http://127.0.0.1:${port}`);
      console.log(`Data backend: ${usePostgres ? "PostgreSQL" : "local JSON"}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize data backend:", error);
    process.exit(1);
  });
