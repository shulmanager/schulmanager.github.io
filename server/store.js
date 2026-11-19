import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "db.json");

const EMPTY = {
  counters: {},
  users: [],
  classes: [],
  subjects: [],
  teachers: [],
  students: [],
  events: [],
  exams: [],
  threads: [],
  messages: [],
  homework: [],
  detentions: [],
  invoices: [],
  letters: [],
  lessons: [],
  widgets: [],
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDb() {
  ensureDir();
  if (!fs.existsSync(FILE)) return structuredClone(EMPTY);
  try {
    return { ...structuredClone(EMPTY), ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return structuredClone(EMPTY);
  }
}

let db = readDb();

export function getDb() {
  return db;
}

let saveTimer = null;
export function save() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => flush(), 80);
}

export function flush() {
  ensureDir();
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2), "utf8");
}

export function nextId(collection) {
  db.counters[collection] = (db.counters[collection] || 0) + 1;
  return db.counters[collection];
}

export function resetDb(seed) {
  db = { ...structuredClone(EMPTY), ...seed };
  flush();
}

export { EMPTY, FILE };
