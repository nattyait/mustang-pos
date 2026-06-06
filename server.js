const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataDir = path.join(root, "data");
const stateFile = path.join(dataDir, "state.json");
const port = Number(process.env.PORT || 4173);
const clients = new Set();

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

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
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
  }[ext] || "application/octet-stream";
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = decodeURIComponent(url.pathname);
  if (filePath === "/") filePath = "/index.html";
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

    if (req.url === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(": connected\n\n");
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }

    if ((req.method === "GET" || req.method === "HEAD") && req.url === "/api/state") {
      if (!fs.existsSync(stateFile)) return sendJson(res, { state: null });
      return sendJson(res, { state: JSON.parse(fs.readFileSync(stateFile, "utf8")) });
    }

    if (req.method === "POST" && req.url === "/api/state") {
      const body = JSON.parse(await readBody(req));
      fs.writeFileSync(stateFile, JSON.stringify(body.state, null, 2));
      broadcast({ type: "state_updated", payload: {} });
      return sendJson(res, { ok: true });
    }

    if (req.method === "POST" && req.url === "/api/event") {
      const event = JSON.parse(await readBody(req));
      if (event.state) fs.writeFileSync(stateFile, JSON.stringify(event.state, null, 2));
      broadcast(event);
      return sendJson(res, { ok: true });
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, { error: error.message }, 500);
  }
});

server.listen(port, () => {
  console.log(`Mustang POS realtime server running at http://127.0.0.1:${port}`);
});
