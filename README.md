# Schulmanager Clone + Admin-Panel

Nachbau des Schulmanager-Online-Portals (Dashboard, Nachrichten, Kalender,
Klassenarbeiten, Klassenbuch, Nacharbeit, Stundenplan, Zahlungen, Elternbriefe)
mit vollständigem Admin-Panel zum Bearbeiten aller Daten.

## Stack

- Frontend: React 18 + Vite + React Router (Hash-Routing)
- Backend: Express + JSON-Datei-Datenbank (`data/db.json`)
- Auth: Token-Session, Rollen `admin` / `teacher` / `student` / `parent`

## Starten

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Produktionslauf

```bash
npm run build
npm start
```

Alles läuft dann auf http://localhost:3001 (API + gebautes Frontend).

## Demo-Zugänge

| Rolle     | E-Mail             | Passwort     |
| --------- | ------------------ | ------------ |
| Admin     | admin@schule.de    | admin123     |
| Lehrkraft | zimmer@schule.de   | lehrer123    |
| Schüler   | max@schule.de      | schueler123  |
| Eltern    | erika@schule.de    | eltern123    |

## Admin-Panel

Erreichbar über Avatar-Menü → **Admin-Panel** (`#/admin`), nur für
`admin` und `teacher`.

- Tabs für alle 15 Datenbereiche: Benutzer, Schüler, Klassen, Lehrkräfte,
  Fächer, Termine, Klassenarbeiten, Stundenplan, Hausaufgaben, Nacharbeit,
  Threads, Nachrichten, Rechnungen, Elternbriefe, Dashboard-Widgets
- Anlegen, Bearbeiten, Löschen über Formulare (Referenzfelder als Dropdown)
- Direktes JSON-Bearbeiten pro Bereich
- Export als Backup-Datei, Import, Reset auf Demo-Daten

## Daten

Alle Inhalte liegen in `data/db.json` und sind über das Admin-Panel
änderbar. Die Datei wird beim ersten Start automatisch mit Demo-Daten
befüllt (`server/seed.js`).

## Struktur

```
server/       Express-API, JSON-Store, Seed
src/          React-App
src/pages/    Login, Dashboard, Module, Admin
src/components/ Layout, UI-Bausteine
data/db.json  Datenbank (wird erzeugt)
```
