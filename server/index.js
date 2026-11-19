import express from "express";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { getDb, save, flush, nextId, resetDb, EMPTY } from "./store.js";
import { buildSeed } from "./seed.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "2mb" }));

if (!fs.existsSync(path.join(process.cwd(), "data", "db.json"))) {
  resetDb(buildSeed());
}

const sessions = new Map();

function tokenFor(user) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { userId: user.id, role: user.role, createdAt: Date.now() });
  return token;
}

function currentUser(req) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token || !sessions.has(token)) return null;
  const session = sessions.get(token);
  const user = getDb().users.find((u) => u.id === session.userId);
  if (!user) return null;
  return { ...user, token };
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: "unauthorized" });
  if (user.role !== "admin" && user.role !== "teacher") {
    return res.status(403).json({ error: "forbidden" });
  }
  req.user = user;
  next();
}

const COLLECTIONS = new Set(
  Object.keys(EMPTY).filter((k) => k !== "counters")
);

function collectionOf(req) {
  const name = req.params.collection;
  if (!COLLECTIONS.has(name)) return null;
  return name;
}

// ---------- auth ----------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = getDb().users.find(
    (u) => String(u.email).toLowerCase() === String(email || "").toLowerCase()
  );
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "invalid-credentials" });
  }
  const token = tokenFor(user);
  const { password: _pw, ...safe } = user;
  res.json({ token, user: safe });
});

app.post("/api/logout", (req, res) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (token) sessions.delete(token);
  res.json({ ok: true });
});

app.get("/api/me", requireAuth, (req, res) => {
  const { password: _pw, ...safe } = req.user;
  res.json(safe);
});

// ---------- bootstrap: everything the client needs ----------
app.get("/api/bootstrap", requireAuth, (req, res) => {
  const db = getDb();
  const out = {};
  for (const name of COLLECTIONS) {
    out[name] = db[name] || [];
  }
  res.json(out);
});

// ---------- generic read ----------
app.get("/api/:collection", requireAuth, (req, res) => {
  const name = collectionOf(req);
  if (!name) return res.status(404).json({ error: "unknown-collection" });
  res.json(getDb()[name] || []);
});

app.get("/api/:collection/:id", requireAuth, (req, res) => {
  const name = collectionOf(req);
  if (!name) return res.status(404).json({ error: "unknown-collection" });
  const row = (getDb()[name] || []).find((r) => String(r.id) === req.params.id);
  if (!row) return res.status(404).json({ error: "not-found" });
  res.json(row);
});

// ---------- authenticated user writes (own content) ----------
app.post("/api/messages", requireAuth, (req, res) => {
  const db = getDb();
  const row = {
    threadId: Number(req.body?.threadId),
    authorId: req.user.id,
    body: String(req.body?.body || ""),
    createdAt: req.body?.createdAt || new Date().toISOString(),
  };
  if (!row.threadId || !row.body.trim()) {
    return res.status(400).json({ error: "invalid-message" });
  }
  row.id = nextId("messages");
  db.messages = [...(db.messages || []), row];
  const thread = (db.threads || []).find((t) => t.id === row.threadId);
  if (thread) thread.updatedAt = row.createdAt;
  save();
  res.status(201).json(row);
});

app.post("/api/threads", requireAuth, (req, res) => {
  const db = getDb();
  const row = {
    subject: String(req.body?.subject || "Neue Unterhaltung"),
    classId: req.body?.classId ?? null,
    authorId: req.user.id,
    participants: String(req.body?.participants || ""),
    unread: 0,
    archived: false,
    createdAt: new Date().toISOString(),
  };
  row.id = nextId("threads");
  db.threads = [...(db.threads || []), row];
  save();
  res.status(201).json(row);
});

// ---------- generic write (admin/teacher) ----------
app.post("/api/:collection", requireAdmin, (req, res) => {
  const name = collectionOf(req);
  if (!name) return res.status(404).json({ error: "unknown-collection" });
  const db = getDb();
  const row = { ...req.body };
  if (row.id == null) row.id = nextId(name);
  else row.id = Number(row.id);
  db[name] = [...(db[name] || []), row];
  save();
  res.status(201).json(row);
});

app.put("/api/:collection", requireAdmin, (req, res) => {
  const name = collectionOf(req);
  if (!name) return res.status(404).json({ error: "unknown-collection" });
  if (!Array.isArray(req.body)) return res.status(400).json({ error: "array-expected" });
  const db = getDb();
  db[name] = req.body;
  const maxId = req.body.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  db.counters[name] = Math.max(db.counters[name] || 0, maxId);
  save();
  res.json(db[name]);
});

app.put("/api/:collection/:id", requireAdmin, (req, res) => {
  const name = collectionOf(req);
  if (!name) return res.status(404).json({ error: "unknown-collection" });
  const db = getDb();
  const idx = (db[name] || []).findIndex((r) => String(r.id) === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "not-found" });
  db[name][idx] = { ...db[name][idx], ...req.body, id: db[name][idx].id };
  save();
  res.json(db[name][idx]);
});

app.delete("/api/:collection/:id", requireAdmin, (req, res) => {
  const name = collectionOf(req);
  if (!name) return res.status(404).json({ error: "unknown-collection" });
  const db = getDb();
  db[name] = (db[name] || []).filter((r) => String(r.id) !== req.params.id);
  save();
  res.json({ ok: true });
});

// ---------- admin utilities ----------
app.post("/api/admin/reset", requireAdmin, (_req, res) => {
  resetDb(buildSeed());
  res.json({ ok: true });
});

app.get("/api/admin/export", requireAdmin, (_req, res) => {
  res.setHeader("Content-Disposition", "attachment; filename=schulmanager-backup.json");
  res.json(getDb());
});

app.post("/api/admin/import", requireAdmin, (req, res) => {
  const body = req.body || {};
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "invalid-payload" });
  }
  resetDb(body);
  res.json({ ok: true });
});

// ---------- static client ----------
const dist = path.join(process.cwd(), "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(PORT, () => {
  flush();
  console.log(`Schulmanager API on http://localhost:${PORT}`);
});
