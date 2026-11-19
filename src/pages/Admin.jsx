import React, { useMemo, useState } from "react";
import { useData } from "../data.jsx";
import { api } from "../api.js";
import { Tile, Modal, Field, Pill, formatDate } from "../components/ui.jsx";

// Schuljahr 2026/27: Montag der KW 47 ist der 16.11.2026
const SCHOOL_YEAR = 2026;
const FALLBACK_WEEK = 47;
const DAY_SHORT = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function isoWeekMonday(week) {
  const jan4 = new Date(Date.UTC(SCHOOL_YEAR, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (dow - 1) + (week - 1) * 7);
  return monday;
}

function lessonDayDate(row) {
  const week = Number(row?.isoWeek) || FALLBACK_WEEK;
  const day = Math.min(7, Math.max(1, Number(row?.day) || 1));
  const d = isoWeekMonday(week);
  d.setUTCDate(d.getUTCDate() + (day - 1));
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${DAY_SHORT[day]} ${dd}.${mm}.${d.getUTCFullYear()}`;
}

function lessonDayISO(row) {
  const week = Number(row?.isoWeek) || FALLBACK_WEEK;
  const day = Math.min(7, Math.max(1, Number(row?.day) || 1));
  const d = isoWeekMonday(week);
  d.setUTCDate(d.getUTCDate() + (day - 1));
  return d.toISOString().slice(0, 10);
}

function isoWeekOf(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

const SCHEMA = {
  users: {
    label: "Benutzer",
    fields: [
      ["name", "Name", "text"],
      ["email", "E-Mail", "text"],
      ["password", "Passwort", "text"],
      ["role", "Rolle", "select", ["admin", "teacher", "student", "parent"]],
      ["avatar", "Kürzel", "text"],
    ],
  },
  classes: {
    label: "Klassen",
    fields: [
      ["name", "Name", "text"],
      ["grade", "Jahrgang", "number"],
      ["room", "Raum", "text"],
      ["teacherId", "Klassenleitung", "ref", "teachers"],
    ],
  },
  subjects: {
    label: "Fächer",
    fields: [
      ["name", "Name", "text"],
      ["short", "Kürzel", "text"],
      ["color", "Farbe", "color"],
    ],
  },
  teachers: {
    label: "Lehrkräfte",
    fields: [
      ["name", "Name", "text"],
      ["short", "Kürzel", "text"],
      ["firstName", "Vorname", "text"],
      ["lastName", "Nachname", "text"],
    ],
  },
  students: {
    label: "Schüler",
    fields: [
      ["firstName", "Vorname", "text"],
      ["lastName", "Nachname", "text"],
      ["classId", "Klasse", "ref", "classes"],
      ["email", "E-Mail", "text"],
    ],
  },
  events: {
    label: "Termine",
    fields: [
      ["title", "Titel", "text"],
      ["date", "Datum", "date"],
      ["endDate", "Ende", "date"],
      ["time", "Uhrzeit", "text"],
      ["location", "Ort", "text"],
      ["classId", "Klasse", "ref", "classes"],
      ["type", "Typ", "select", ["event", "exam", "info"]],
    ],
  },
  exams: {
    label: "Klassenarbeiten",
    fields: [
      ["subjectId", "Fach", "ref", "subjects"],
      ["classId", "Klasse", "ref", "classes"],
      ["date", "Datum", "date"],
      ["slotFrom", "Von Stunde", "number"],
      ["slotTo", "Bis Stunde", "number"],
      ["room", "Raum", "text"],
      ["teacherId", "Lehrkraft", "ref", "teachers"],
      ["note", "Notiz", "text"],
    ],
  },
  threads: {
    label: "Nachrichten-Threads",
    fields: [
      ["subject", "Betreff", "text"],
      ["authorId", "Autor", "ref", "users"],
      ["participants", "Teilnehmer", "text"],
      ["unread", "Ungelesen", "number"],
      ["archived", "Archiviert", "bool"],
      ["createdAt", "Erstellt", "text"],
    ],
  },
  messages: {
    label: "Nachrichten",
    fields: [
      ["threadId", "Thread", "ref", "threads"],
      ["authorId", "Autor", "ref", "users"],
      ["body", "Text", "textarea"],
      ["createdAt", "Zeit", "text"],
    ],
  },
  homework: {
    label: "Hausaufgaben",
    fields: [
      ["subjectId", "Fach", "ref", "subjects"],
      ["classId", "Klasse", "ref", "classes"],
      ["dueDate", "Fällig", "date"],
      ["text", "Aufgabe", "textarea"],
      ["teacherId", "Lehrkraft", "ref", "teachers"],
    ],
  },
  detentions: {
    label: "Nacharbeit",
    fields: [
      ["studentId", "Schüler", "ref", "students"],
      ["subjectId", "Fach", "ref", "subjects"],
      ["date", "Datum", "date"],
      ["slot", "Stunde", "text"],
      ["room", "Raum", "text"],
      ["teacherId", "Lehrkraft", "ref", "teachers"],
      ["reason", "Grund", "text"],
      ["done", "Erledigt", "bool"],
    ],
  },
  invoices: {
    label: "Rechnungen",
    fields: [
      ["studentId", "Schüler", "ref", "students"],
      ["title", "Titel", "text"],
      ["amount", "Betrag", "number"],
      ["dueDate", "Fällig", "date"],
      ["paid", "Bezahlt", "bool"],
      ["paidAt", "Bezahlt am", "date"],
    ],
  },
  letters: {
    label: "Elternbriefe",
    fields: [
      ["title", "Titel", "text"],
      ["date", "Datum", "date"],
      ["audience", "Empfänger", "text"],
      ["body", "Text", "textarea"],
      ["requiresSignature", "Unterschrift", "bool"],
    ],
  },
  lessons: {
    label: "Stundenplan",
    fields: [
      ["day", "Datum", "number"],
      ["slot", "Stunde", "number"],
      ["week", "Woche", "select", ["A", "B"]],
      ["subjectId", "Fach", "ref", "subjects"],
      ["teacherId", "Lehrkraft", "ref", "teachers"],
      ["classId", "Klasse", "ref", "classes"],
      ["room", "Raum", "text"],
      ["status", "Status", "select", ["normal", "substitution", "cancelled"]],
      ["oldSubjectId", "Vorheriges Fach (rot)", "ref", "subjects"],
      ["oldTeacherId", "Vorherige Lehrkraft (rot)", "ref", "teachers"],
      ["note", "Notiz", "text"],
    ],
  },
  widgets: {
    label: "Dashboard-Widgets",
    fields: [
      ["key", "Schlüssel", "select", ["events", "exams", "cloud", "homework"]],
      ["title", "Titel", "text"],
      ["enabled", "Aktiv", "bool"],
      ["order", "Reihenfolge", "number"],
    ],
  },
};

const ORDER = [
  "users", "students", "classes", "teachers", "subjects",
  "events", "exams", "lessons", "homework", "detentions",
  "threads", "messages", "invoices", "letters", "widgets",
];

function emptyRow(col) {
  const row = {};
  for (const [key, , type] of SCHEMA[col].fields) {
    row[key] = type === "bool" ? false : type === "number" ? 0 : "";
  }
  return row;
}

export default function Admin() {
  const { data, reload } = useData();
  const [active, setActive] = useState("lessons");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [rawOpen, setRawOpen] = useState(false);
  const [raw, setRaw] = useState("");

  const rows = data?.[active] || [];
  const cols = SCHEMA[active].fields;

  function flash(msg) {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(""), 2200);
  }

  function startCreate() {
    setDraft(emptyRow(active));
    setEditing(null);
    setCreating(true);
  }

  function startEdit(row) {
    setDraft({ ...row });
    setEditing(row);
    setCreating(true);
  }

  function setValue(key, value, type) {
    let v = value;
    if (type === "number") v = value === "" ? 0 : Number(value);
    if (type === "ref") v = value === "" ? null : Number(value);
    setDraft((d) => ({ ...d, [key]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const payload = { ...draft };
      if (active === "lessons") {
        payload.changed =
          payload.status !== "normal" ||
          (payload.oldSubjectId != null && payload.oldSubjectId !== "") ||
          (payload.oldTeacherId != null && payload.oldTeacherId !== "");
      }
      if (editing) await api.update(active, editing.id, payload);
      else await api.create(active, payload);
      await reload();
      setCreating(false);
      flash("Gespeichert.");
    } catch (e) {
      flash("Fehler: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(row) {
    if (!window.confirm(`Eintrag #${row.id} wirklich löschen?`)) return;
    setBusy(true);
    try {
      await api.remove(active, row.id);
      await reload();
      flash("Gelöscht.");
    } finally {
      setBusy(false);
    }
  }

  async function resetAll() {
    if (!window.confirm("Alle Daten auf Demo-Stand zurücksetzen?")) return;
    setBusy(true);
    try {
      await api.reset();
      await reload();
      flash("Daten zurückgesetzt.");
    } finally {
      setBusy(false);
    }
  }

  async function exportAll() {
    const payload = await api.exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schulmanager-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function openRaw() {
    setRaw(JSON.stringify(data?.[active] || [], null, 2));
    setRawOpen(true);
  }

  async function saveRaw() {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Array erwartet");
      await api.importCollection(active, parsed).catch(async () => {
        const full = await api.exportAll();
        full[active] = parsed;
        await api.importAll(full);
      });
      await reload();
      setRawOpen(false);
      flash("JSON gespeichert.");
    } catch (e) {
      flash("JSON-Fehler: " + e.message);
    }
  }

  const refLabel = useMemo(() => {
    return (refCol, id) => {
      const row = (data?.[refCol] || []).find((r) => Number(r.id) === Number(id));
      if (!row) return "—";
      return (
        row.name ||
        [row.firstName, row.lastName].filter(Boolean).join(" ") ||
        row.title ||
        row.subject ||
        `#${id}`
      );
    };
  }, [data]);

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Admin-Panel</h1>
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 mb-3">
        <button className="btn btn-light btn-sm" onClick={exportAll}>Export</button>
        <button className="btn btn-light btn-sm" onClick={openRaw}>JSON bearbeiten</button>
        <button className="btn btn-danger btn-sm" onClick={resetAll}>Zurücksetzen</button>
      </div>

      <div className="admin-tabs">
        {ORDER.map((key) => (
          <button
            key={key}
            className={active === key ? "active" : ""}
            onClick={() => setActive(key)}
          >
            {SCHEMA[key].label} <span className="text-muted">({(data[key] || []).length})</span>
          </button>
        ))}
      </div>

      <Tile
        title={SCHEMA[active].label}
        actions={
          <button className="btn btn-primary btn-sm" onClick={startCreate}>
            + Neu
          </button>
        }
        tight
      >
        <div style={{ overflowX: "auto" }}>
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th style={{ width: 50 }}>ID</th>
                {cols.map(([key, label]) => (
                  <th key={key}>{label}</th>
                ))}
                <th style={{ width: 140 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="text-muted">{row.id}</td>
                  {cols.map(([key, , type, ref]) => (
                    <td key={key}>
                      {type === "bool" ? (
                        row[key] ? <Pill tone="ok">ja</Pill> : <Pill>nein</Pill>
                      ) : type === "ref" ? (
                        refLabel(ref, row[key])
                      ) : active === "lessons" && key === "day" ? (
                        <span>
                          {lessonDayDate(row)}
                          <span className="text-muted small ms-1">Tag {row[key]}</span>
                        </span>
                      ) : key === "password" ? (
                        "••••••"
                      ) : type === "date" ? (
                        formatDate(row[key])
                      ) : type === "textarea" ? (
                        <span className="small">{String(row[key] || "").slice(0, 60)}</span>
                      ) : (
                        String(row[key] ?? "")
                      )}
                    </td>
                  ))}
                  <td className="text-end">
                    <button className="btn btn-light btn-sm" onClick={() => startEdit(row)}>Bearbeiten</button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(row)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tile>

      {creating && (
        <Modal
          title={editing ? `Bearbeiten: #${editing.id}` : `Neu: ${SCHEMA[active].label}`}
          onClose={() => setCreating(false)}
          footer={
            <>
              <button className="btn btn-light" onClick={() => setCreating(false)}>Abbrechen</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>Speichern</button>
            </>
          }
        >
          <div className="row">
            {cols.map(([key, label, type, ref]) => (
              <div className={type === "textarea" ? "col-12" : "col-6"} key={key}>
                <Field label={label}>
                  {type === "textarea" ? (
                    <textarea
                      className="form-control"
                      value={draft[key] ?? ""}
                      onChange={(e) => setValue(key, e.target.value, type)}
                    />
                  ) : type === "bool" ? (
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={!!draft[key]}
                      onChange={(e) => setValue(key, e.target.checked, type)}
                    />
                  ) : type === "select" ? (
                    <select
                      className="form-select"
                      value={draft[key] ?? ""}
                      onChange={(e) => setValue(key, e.target.value, type)}
                    >
                      <option value="">—</option>
                      {(ref || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : type === "ref" ? (
                    <select
                      className="form-select"
                      value={draft[key] ?? ""}
                      onChange={(e) => setValue(key, e.target.value, type)}
                    >
                      <option value="">—</option>
                      {(data[ref] || []).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {refLabel(ref, opt.id)}
                        </option>
                      ))}
                    </select>
                  ) : active === "lessons" && key === "day" ? (
                    <input
                      className="form-control"
                      type="date"
                      value={lessonDayISO(draft)}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) return;
                        const d = new Date(v + "T00:00:00Z");
                        const day = ((d.getUTCDay() + 6) % 7) + 1;
                        setDraft((x) => ({ ...x, day, isoWeek: isoWeekOf(d) }));
                      }}
                    />
                  ) : (
                    <input
                      className="form-control"
                      type={type === "number" ? "number" : type === "date" ? "date" : "text"}
                      value={draft[key] ?? ""}
                      onChange={(e) => setValue(key, e.target.value, type)}
                    />
                  )}
                </Field>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {rawOpen && (
        <Modal
          title={`JSON: ${SCHEMA[active].label}`}
          onClose={() => setRawOpen(false)}
          footer={
            <>
              <button className="btn btn-light" onClick={() => setRawOpen(false)}>Abbrechen</button>
              <button className="btn btn-primary" onClick={saveRaw}>Speichern</button>
            </>
          }
        >
          <textarea
            className="form-control"
            style={{ minHeight: 360, fontFamily: "monospace", fontSize: 12 }}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
