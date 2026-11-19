// dump readable tables of the portal into ./dump/*.json
const fs = require('fs');
const path = require('path');
const B = 'https://login.schulmanager-online.de';
const OUT = path.join(__dirname, 'dump');
const EMAIL = 'frislop21@gmail.com';
const PASS = 'Neodeo34!!';
const BUNDLE = '0d024d5311';
const PAGE = 500;

const kebab = s => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

async function login() {
  const r = await fetch(B + '/api/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: EMAIL, password: PASS, hash: null, mobileApp: false, userId: null, twoFactorCode: null, institutionId: null })
  });
  if (r.status !== 200) throw new Error('login ' + r.status);
  return (await r.json()).jwt;
}

function mk(jwt) {
  return async (reqs) => {
    const r = await fetch(B + '/api/calls', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + jwt },
      body: JSON.stringify({ bundleVersion: BUNDLE, requests: reqs })
    });
    if (r.status !== 200) throw new Error('calls ' + r.status);
    return await r.json();
  };
}

async function models(jwt) {
  const r = await fetch(B + '/api/models', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  return await r.json();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const jwt = await login();
  const call = mk(jwt);
  const spec = await models(jwt);

  const list = [];
  for (const k of Object.keys(spec.main || {})) list.push('main/' + kebab(k));
  for (const [mod, ms] of Object.entries(spec.modules || {}))
    for (const k of Object.keys(ms || {})) list.push('modules/' + mod + '/' + kebab(k));

  const index = { generatedAt: new Date().toISOString(), tables: {} };

  for (const model of list) {
    const rows = [];
    let offset = 0, denied = false, total = 0;
    try {
      for (;;) {
        const j = await call([{
          moduleName: null, endpointName: 'poqa',
          parameters: { action: { model, action: 'findAll', parameters: [{ limit: PAGE, offset }] }, uiState: 'main.dashboard' }
        }]);
        const res = j.results[0];
        if (res.status !== 200) { denied = true; index.tables[model] = { status: res.status, rows: 0 }; break; }
        const data = res.data || [];
        // drain the internal look-ahead of a batched response
        for (const r of data) rows.push(r);
        total += data.length;
        if (data.length < PAGE) { index.tables[model] = { status: 200, rows: total }; break; }
        offset += PAGE;
        if (offset > 200000) { index.tables[model] = { status: 200, rows: total, capped: true }; break; }
      }
      if (!denied) {
        const name = model.replace(/\//g, '__') + '.json';
        fs.writeFileSync(path.join(OUT, name), JSON.stringify(rows, null, 1));
      }
    } catch (e) {
      index.tables[model] = { status: 'err', error: String(e.message).slice(0, 80) };
    }
    process.stdout.write(model.padEnd(52) + ' ' + JSON.stringify(index.tables[model]) + '\n');
  }

  fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(index, null, 1));
  console.log('done ->', OUT);
})();
