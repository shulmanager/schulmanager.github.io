const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || 'dump';
const hits = {};
let files = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json') || f === '_index.json') continue;
  files++;
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  const emails = [...new Set(raw.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [])];
  const fields = [...new Set(raw.match(/"(password[A-Za-z]*|passwordHash|hash|pin|token|accessCode|secret)"/gi) || [])];
  if (emails.length || fields.length) hits[f] = { emails: emails.slice(0, 6), fields };
}
console.log('files scanned:', files);
console.log(JSON.stringify(hits, null, 1));
