import fs from "node:fs";
import path from "node:path";

const teacherSeed = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "server", "teachers.seed.json"), "utf8")
);

// Auf der Originalseite werden diese Kürzel mit Umlaut dargestellt.
const SHORT_FIX = { Luck: "Lück", LuckF: "LückF", Grun: "Grün", SchaM: "SchäM" };

const teachers = teacherSeed.map((t, i) => ({
  id: i + 1,
  name: t.name,
  short: SHORT_FIX[t.short] || t.short,
  firstName: t.firstname || "",
  lastName: t.lastname || "",
}));

function teacherId(short) {
  const found = teachers.find((t) => t.short === short);
  if (found) return found.id;
  return null;
}

const subjects = [
  { id: 1, name: "Deutsch", short: "Deu", color: "#428bca" },
  { id: 2, name: "Mathematik", short: "Mat", color: "#5cb85c" },
  { id: 3, name: "Englisch", short: "Eng", color: "#f0ad4e" },
  { id: 4, name: "Ethik", short: "Eth", color: "#d9534f" },
  { id: 5, name: "Geografie", short: "Ges", color: "#5bc0de" },
  { id: 6, name: "Sozialkunde", short: "Soz", color: "#9b59b6" },
  { id: 7, name: "Chemie", short: "Che", color: "#e67e22" },
  { id: 8, name: "Sport", short: "Spo", color: "#2ecc71" },
  { id: 9, name: "Französisch", short: "Frz", color: "#71639e" },
  { id: 10, name: "Physik", short: "Phy", color: "#337ab7" },
  { id: 11, name: "Hauswirtschaft", short: "HWi", color: "#8e6e53" },
  { id: 12, name: "Technik", short: "Tec", color: "#607d8b" },
  { id: 13, name: "Lernzeit", short: "LZE", color: "#7f8c8d" },
  { id: 14, name: "Lernzeit", short: "LZM", color: "#7f8c8d" },
  { id: 15, name: "Methodentraining", short: "MT", color: "#95a5a6" },
  { id: 16, name: "Betrieb", short: "Betr", color: "#c0392b" },
  { id: 17, name: "Arbeitslehre", short: "AL", color: "#b8860b" },
  { id: 18, name: "Musik", short: "Mus", color: "#7e57c2" },
  { id: 19, name: "Biologie", short: "Bio", color: "#43a047" },
  { id: 20, name: "Kunst", short: "Kun", color: "#d81b60" },
  { id: 21, name: "Wirtschaft", short: "Wir", color: "#00897b" },
  { id: 22, name: "Lernzeit Deutsch", short: "LZD", color: "#7f8c8d" },
];

function subjectId(short) {
  const found = subjects.find((s) => s.short === short);
  return found ? found.id : null;
}

// Stundenplan 1:1 aus der Originalseite übernommen (KW 47, B-Woche).
// [day, slot, subjectShort, teacherShort, room, oldSubject?, oldTeacher?, cancelled?]
const GRID_B = [
  [1, 1, "Deu", "Ham", "222"],
  [1, 2, "Deu", "Ham", "222"],
  [1, 3, "Che", "Teich", "303", null, "Lieb"],
  [1, 4, "Che", "Teich", "303", null, "Lieb"],
  [1, 5, "LZE", "SchäM", "222"],

  [2, 1, "Eth", "Sieb", "222"],
  [2, 2, "Eth", "Sieb", "222"],
  [2, 3, "Mat", "Klim", "222", null, "Lieb"],
  [2, 4, "Mat", "Klim", "222", null, "Lieb"],
  [2, 5, "Betr", "Heine", "103", "Phy", "Trun"],
  [2, 6, "Betr", "Heine", "103", "Phy", "Trun"],
  [2, 7, "Eng", "Schil", "222"],
  [2, 8, "Eng", "Schil", "222"],

  [3, 1, "Betr", "Heine", "222", "Frz", "Leib"],
  [3, 2, "Betr", "Heine", "222", "Frz", "Leib"],
  [3, 3, "Deu", "Ham", "222"],
  [3, 4, "Deu", "Ham", "222"],
  [3, 5, "Spo", "Lück", "GTH"],
  [3, 6, "Spo", "Lück", "GTH"],

  [4, 1, "Soz", "Bern", "222"],
  [4, 2, "Soz", "Bern", "222"],
  [4, 3, "HWi", "Sam", "010"],
  [4, 3, "Tec", "Lück", "121"],
  [4, 4, "HWi", "Sam", "010"],
  [4, 4, "Tec", "Lück", "121"],
  [4, 5, "LZM", "Schmi", "222"],
  [4, 6, "MT", "Lück", "222"],
  [4, 7, "Mat", "Lieb", "222", null, null, true],
  [4, 8, "Mat", "Lieb", "222", null, null, true],

  [5, 1, "Ges", "Leib", "222", null, null, true],
  [5, 2, "Ges", "Leib", "222", null, null, true],
  [5, 3, "Eng", "Bel", "219", "Frz", "Leib"],
  [5, 4, "Eng", "Bel", "219", "Frz", "Leib"],
  [5, 5, "Mat", "Grün", "222", "Eng", "Schil"],
  [5, 6, "Mat", "Grün", "222", "Eng", "Schil"],
];

// A-Woche (KW 46) ebenfalls aus dem Original.
const GRID_A = [
  [4, 1, "Mus", "HeiD", "309", null, null, true],
  [4, 1, "Eth", "Sieb", "222"],
  [5, 1, "Ges", "Leib", "222"],
  [4, 2, "Mus", "HeiD", "309", null, null, true],
  [4, 2, "Eth", "Sieb", "222"],
  [5, 2, "Ges", "Leib", "222"],
  [4, 3, "Bio", "Wagn", "204"],
  [5, 3, "Kun", "Haase", "234"],
  [4, 4, "Bio", "Wagn", "204"],
  [5, 4, "Kun", "Haase", "234"],
  [4, 5, "LZM", "Diet", "222", "LZD", "Eis"],
  [5, 5, "Wir", "LückF", "222"],
  [4, 6, "MT", "Lück", "222"],
  [5, 6, "Wir", "LückF", "222"],
  [4, 7, "Mat", "Lieb", "222", null, null, true],
  [4, 8, "Mat", "Lieb", "222", null, null, true],
];

function makeLessons(grid, week, baseId) {
  return grid.map((row, index) => {
    const [day, slot, subj, teach, room, oldSubj, oldTeach, cancelled] = row;
    const changed = !!(oldSubj || oldTeach || cancelled);
    return {
      id: baseId + index,
      day,
      slot,
      week,
      subjectId: subjectId(subj),
      teacherId: teacherId(teach),
      classId: 1,
      room,
      status: cancelled ? "cancelled" : oldSubj || oldTeach ? "substitution" : "normal",
      oldSubjectId: oldSubj ? subjectId(oldSubj) : null,
      oldTeacherId: oldTeach ? teacherId(oldTeach) : null,
      substituteSubjectId: null,
      substituteTeacherId: null,
      changed,
      note: "",
    };
  });
}

const lessons = [...makeLessons(GRID_B, "B", 1), ...makeLessons(GRID_A, "A", 101)];

export function buildSeed() {
  const counters = {
    users: 4,
    classes: 5,
    subjects: subjects.length,
    teachers: teachers.length,
    students: 6,
    events: 5,
    exams: 4,
    threads: 5,
    messages: 9,
    homework: 4,
    detentions: 3,
    invoices: 4,
    letters: 3,
    lessons: lessons.length,
    widgets: 4,
  };

  return {
    counters,
    users: [
      { id: 1, name: "Administrator", email: "admin@schule.de", password: "admin123", role: "admin", avatar: "A" },
      { id: 2, name: "Katrin Zimmer", email: "zimmer@schule.de", password: "lehrer123", role: "teacher", avatar: "KZ" },
      { id: 3, name: "Max Mustermann", email: "max@schule.de", password: "schueler123", role: "student", avatar: "MM" },
      { id: 4, name: "Erika Mustermann", email: "erika@schule.de", password: "eltern123", role: "parent", avatar: "EM" },
    ],
    classes: [
      { id: 1, name: "8-2", grade: 8, room: "222", teacherId: 2 },
      { id: 2, name: "7-1", grade: 7, room: "121", teacherId: 2 },
      { id: 3, name: "9-3", grade: 9, room: "303", teacherId: 2 },
      { id: 4, name: "10-1", grade: 10, room: "010", teacherId: 2 },
      { id: 5, name: "8-1", grade: 8, room: "219", teacherId: 2 },
    ],
    subjects,
    teachers,
    students: [
      { id: 1, firstName: "Max", lastName: "Mustermann", classId: 1, email: "max@schule.de" },
      { id: 2, firstName: "Antonia", lastName: "Wiskemann", classId: 1, email: "antonia@schule.de" },
      { id: 3, firstName: "Alexander", lastName: "Lück", classId: 1, email: "alex@schule.de" },
      { id: 4, firstName: "Lena", lastName: "Berger", classId: 2, email: "lena@schule.de" },
      { id: 5, firstName: "Jonas", lastName: "Keller", classId: 3, email: "jonas@schule.de" },
      { id: 6, firstName: "Mia", lastName: "Schulz", classId: 4, email: "mia@schule.de" },
    ],
    events: [
      { id: 1, title: "Nachschreiben", date: "2026-11-21", time: "11:00", location: "Raum 222", classId: 1, type: "exam" },
      { id: 2, title: "Schulfotoaktionswoche", date: "2026-11-23", endDate: "2026-11-26", time: "", location: "Aula", classId: null, type: "event" },
      { id: 3, title: "Nachschreiben", date: "2026-12-05", time: "11:00", location: "Raum 222", classId: 1, type: "exam" },
      { id: 4, title: "Schul-Weihnachtsmarkt", date: "2026-12-17", time: "17:00", location: "Schulhof", classId: null, type: "event" },
      { id: 5, title: "Ausgabe der Notenkarten", date: "2026-12-18", time: "", location: "Klassenzimmer", classId: 1, type: "event" },
    ],
    exams: [
      { id: 1, subjectId: 4, classId: 1, date: "2026-11-24", slotFrom: 1, slotTo: 2, room: "222", teacherId: 1, note: "Ethikunterricht" },
      { id: 2, subjectId: 5, classId: 1, date: "2026-11-30", slotFrom: 5, slotTo: 5, room: "222", teacherId: 1, note: "Geografie" },
      { id: 3, subjectId: 3, classId: 1, date: "2026-12-02", slotFrom: 1, slotTo: 2, room: "219", teacherId: 1, note: "Französisch" },
      { id: 4, subjectId: 2, classId: 1, date: "2026-12-09", slotFrom: 3, slotTo: 4, room: "222", teacherId: 1, note: "Mathematik" },
    ],
    threads: [
      { id: 1, subject: "Klassenarbeit Geographie", classId: 1, authorId: 2, createdAt: "2026-11-19T08:58:00", unread: 1, archived: false, participants: "Schüler der Klasse 8-2" },
      { id: 2, subject: "Sozialkunde 8-2", classId: 1, authorId: 2, createdAt: "2026-11-19T07:05:00", unread: 3, archived: false, participants: "Schüler der Klasse 8-2, Antonia Wiskemann, Alexander Lück" },
      { id: 3, subject: "Waffeln am Mittwoch (18.11)", classId: null, authorId: 2, createdAt: "2026-11-17T09:00:00", unread: 0, archived: false, participants: "Alle Schüler" },
      { id: 4, subject: "Bitte um Kenntnisnahme des Schulleiterbriefes", classId: null, authorId: 2, createdAt: "2026-11-10T09:00:00", unread: 0, archived: false, participants: "Alle Schüler, Alle Lehrkräfte, Alle Eltern" },
      { id: 5, subject: "Test morgen", classId: 1, authorId: 2, createdAt: "2026-10-14T14:00:00", unread: 1, archived: false, participants: "Schüler der Klasse 8-2" },
    ],
    messages: [
      { id: 1, threadId: 1, authorId: 2, body: "Die Klassenarbeit Geographie findet am Montag statt. Bitte Kapitel 3 und 4 wiederholen.", createdAt: "2026-11-19T08:58:00" },
      { id: 2, threadId: 2, authorId: 2, body: "Bitte bringt das Arbeitsheft mit.", createdAt: "2026-11-19T07:05:00" },
      { id: 3, threadId: 2, authorId: 3, body: "Ist die Aufgabe auf Seite 42 gemeint?", createdAt: "2026-11-19T07:20:00" },
      { id: 4, threadId: 2, authorId: 2, body: "Ja, genau die.", createdAt: "2026-11-19T07:28:00" },
      { id: 5, threadId: 3, authorId: 2, body: "Am Mittwoch verkauft die Klasse 8-2 Waffeln in der ersten großen Pause.", createdAt: "2026-11-17T09:00:00" },
      { id: 6, threadId: 4, authorId: 2, body: "Der Brief des Schulleiters liegt im Anhang. Bitte um Kenntnisnahme.", createdAt: "2026-11-10T09:00:00" },
      { id: 7, threadId: 5, authorId: 2, body: "Kurzer Test über die Vokabeln der Lektion 5.", createdAt: "2026-10-14T14:00:00" },
      { id: 8, threadId: 1, authorId: 3, body: "Danke für die Info!", createdAt: "2026-11-19T09:10:00" },
      { id: 9, threadId: 3, authorId: 2, body: "Wer mithelfen möchte, meldet sich bei mir.", createdAt: "2026-11-17T09:20:00" },
    ],
    homework: [
      { id: 1, subjectId: 2, classId: 1, dueDate: "2026-11-20", text: "Buch S. 42, Aufgabe 3 und 4", teacherId: teacherId("Klim") },
      { id: 2, subjectId: 1, classId: 1, dueDate: "2026-11-20", text: "Erörterung: Entwurf fertigstellen", teacherId: teacherId("Ham") },
      { id: 3, subjectId: 3, classId: 1, dueDate: "2026-11-23", text: "Vokabeln Lektion 5 wiederholen", teacherId: teacherId("Schil") },
      { id: 4, subjectId: 7, classId: 1, dueDate: "2026-11-24", text: "Arbeitsblatt Periodensystem", teacherId: teacherId("Teich") },
    ],
    detentions: [
      { id: 1, studentId: 1, subjectId: 2, date: "2026-11-20", slot: "7", room: "222", teacherId: teacherId("Klim"), reason: "Hausaufgaben nicht erledigt", done: false },
      { id: 2, studentId: 2, subjectId: 1, date: "2026-11-18", slot: "8", room: "222", teacherId: teacherId("Ham"), reason: "Verspätung", done: true },
      { id: 3, studentId: 3, subjectId: 5, date: "2026-11-25", slot: "6", room: "222", teacherId: teacherId("Leib"), reason: "Material vergessen", done: false },
    ],
    invoices: [
      { id: 1, studentId: 1, title: "Klassenfahrt 2027", amount: 180.0, dueDate: "2027-01-15", paid: false, paidAt: null },
      { id: 2, studentId: 1, title: "Schulbuchausleihe", amount: 32.5, dueDate: "2026-10-01", paid: true, paidAt: "2026-09-28" },
      { id: 3, studentId: 2, title: "Klassenfahrt 2027", amount: 180.0, dueDate: "2027-01-15", paid: true, paidAt: "2026-11-02" },
      { id: 4, studentId: 3, title: "Kopiergeld Halbjahr", amount: 6.0, dueDate: "2026-11-30", paid: false, paidAt: null },
    ],
    letters: [
      { id: 1, title: "Schulleiterbrief November", date: "2026-11-10", audience: "Alle Eltern", body: "Sehr geehrte Eltern, anbei finden Sie den aktuellen Schulleiterbrief mit den wichtigsten Terminen des Halbjahres.", requiresSignature: true },
      { id: 2, title: "Information Schulfotoaktionswoche", date: "2026-11-14", audience: "Alle Eltern", body: "In der Woche vom 23. bis 26. November finden die Schulfotos statt.", requiresSignature: false },
      { id: 3, title: "Einverständnis Klassenfahrt", date: "2026-10-20", audience: "Eltern der Klasse 8-2", body: "Bitte geben Sie das Einverständnis zur Klassenfahrt bis zum 15.12. zurück.", requiresSignature: true },
    ],
    lessons,
    widgets: [
      { id: 1, key: "events", title: "Kommende Termine", enabled: true, order: 1 },
      { id: 2, key: "exams", title: "Klassenarbeiten", enabled: true, order: 2 },
      { id: 3, key: "cloud", title: "Nextcloud im Browser", enabled: true, order: 3 },
      { id: 4, key: "homework", title: "Hausaufgaben", enabled: true, order: 4 },
    ],
  };
}
