const TOKEN_KEY = "sm_token";
const USER_KEY = "sm_user";
const DB_KEY = "sm_static_db";

// Startdaten werden mitgebaut (data/db.json) — kein Extra-Download,
// funktioniert also auch ohne Backend und ohne api-seed.json.
import seedSource from "../data/db.json";

const SEED = () => JSON.parse(JSON.stringify(seedSource));

// Statischer Betrieb: ohne Express-Backend (GitHub Pages) laufen die Daten
// aus public/api-seed.json im localStorage. Der Login arbeitet dann lokal.
const COLLECTIONS = [
  "users", "classes", "subjects", "teachers", "students", "events", "exams",
  "threads", "messages", "homework", "detentions", "invoices", "letters",
  "lessons", "widgets",
];

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---------- statischer Speicher ----------
let cache = null;

function readDb() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) cache = JSON.parse(raw);
  } catch {
    cache = null;
  }
  return cache;
}

function writeDb(db) {
  cache = db;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

async function ensureDb() {
  const db = readDb();
  if (db) return db;
  const seed = SEED();
  writeDb(seed);
  return seed;
}

function nextId(db, collection) {
  db.counters = db.counters || {};
  db.counters[collection] = (db.counters[collection] || 0) + 1;
  return db.counters[collection];
}

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function userFromToken(db) {
  const token = getToken() || "";
  if (!token.startsWith("sm-local:")) return null;
  const id = Number(token.slice("sm-local:".length));
  return db.users.find((u) => Number(u.id) === id) || null;
}

function bootstrap(db) {
  const out = {};
  for (const name of COLLECTIONS) out[name] = db[name] || [];
  return out;
}

async function staticRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;
  const parts = path.split("?")[0].split("/").filter(Boolean);
  const db = await ensureDb();

  // auth
  if (parts[0] === "login" && method === "POST") {
    const email = String((body && body.email) || "").toLowerCase();
    const user = db.users.find((u) => String(u.email).toLowerCase() === email);
    if (!user || user.password !== (body && body.password)) {
      throw new Error("invalid-credentials");
    }
    return { token: "sm-local:" + user.id, user: publicUser(user) };
  }
  if (parts[0] === "logout") return { ok: true };
  if (parts[0] === "me") {
    const user = userFromToken(db);
    if (!user) throw new Error("unauthorized");
    return publicUser(user);
  }
  if (parts[0] === "bootstrap") {
    if (!userFromToken(db)) throw new Error("unauthorized");
    return bootstrap(db);
  }

  // admin
  if (parts[0] === "admin" && method === "POST" && parts[1] === "reset") {
    localStorage.removeItem(DB_KEY);
    cache = null;
    const fresh = await ensureDb();
    return { ok: true, collections: COLLECTIONS.length, lessons: (fresh.lessons || []).length };
  }
  if (parts[0] === "admin" && parts[1] === "export") return db;
  if (parts[0] === "admin" && parts[1] === "import" && method === "POST") {
    writeDb(body);
    return { ok: true };
  }

  // collections
  const name = parts[0];
  if (!COLLECTIONS.includes(name)) throw new Error("unknown-collection");
  db[name] = db[name] || [];

  if (method === "GET" && parts.length === 1) return db[name];
  if (method === "GET") {
    const row = db[name].find((r) => String(r.id) === parts[1]);
    if (!row) throw new Error("not-found");
    return row;
  }
  if (method === "PUT" && parts.length === 1) {
    if (!Array.isArray(body)) throw new Error("array-expected");
    db[name] = body;
    db.counters = db.counters || {};
    const max = body.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
    db.counters[name] = Math.max(db.counters[name] || 0, max);
    writeDb(db);
    return db[name];
  }
  if (method === "POST") {
    const row = { ...body };
    if (row.id == null) row.id = nextId(db, name);
    else row.id = Number(row.id);
    db[name].push(row);
    writeDb(db);
    return row;
  }
  if (method === "PUT") {
    const idx = db[name].findIndex((r) => String(r.id) === parts[1]);
    if (idx < 0) throw new Error("not-found");
    db[name][idx] = { ...db[name][idx], ...body, id: db[name][idx].id };
    writeDb(db);
    return db[name][idx];
  }
  if (method === "DELETE") {
    db[name] = db[name].filter((r) => String(r.id) !== parts[1]);
    writeDb(db);
    return { ok: true };
  }
  throw new Error("bad-request");
}

// ---------- Netzwerk mit Rückfall ----------
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token && !token.startsWith("sm-local:")) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    return staticRequest(path, options);
  }

  // GitHub Pages antwortet mit HTML statt JSON -> statischer Betrieb
  const type = res.headers.get("content-type") || "";
  if (!type.includes("application/json")) return staticRequest(path, options);

  if (res.status === 401) {
    clearSession();
    throw new Error("unauthorized");
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.error) || `http-${res.status}`);
  return data;
}

export const api = {
  login: (email, password) =>
    request("/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/logout", { method: "POST" }).catch(() => {}),
  me: () => request("/me"),
  bootstrap: () => request("/bootstrap"),
  list: (collection) => request(`/${collection}`),
  create: (collection, row) =>
    request(`/${collection}`, { method: "POST", body: JSON.stringify(row) }),
  update: (collection, id, row) =>
    request(`/${collection}/${id}`, { method: "PUT", body: JSON.stringify(row) }),
  remove: (collection, id) => request(`/${collection}/${id}`, { method: "DELETE" }),
  importCollection: (collection, rows) =>
    request(`/${collection}`, { method: "PUT", body: JSON.stringify(rows) }),
  reset: () => request("/admin/reset", { method: "POST" }),
  exportAll: () => request("/admin/export"),
  importAll: (payload) =>
    request("/admin/import", { method: "POST", body: JSON.stringify(payload) }),
};
