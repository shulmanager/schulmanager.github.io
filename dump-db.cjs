// dump readable tables -> C:\Users\Admin\Desktop\DB
const fs = require('fs');
const path = require('path');
const B = 'https://login.schulmanager-online.de';
const OUT = 'C:/Users/Admin/Desktop/Schulmanager/DB';
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

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (!fs.existsSync(OUT)) throw new Error('mkdir failed: ' + OUT);
  console.log('OUT ready:', OUT);

  const jwt = await login();
  const call = async (reqs) => {
    const r = await fetch(B + '/api/calls', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + jwt },
      body: JSON.stringify({ bundleVersion: BUNDLE, requests: reqs })
    });
    if (r.status !== 200) throw new Error('calls ' + r.status);
    return await r.json();
  };

  const spec = await (await fetch(B + '/api/models', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).json();
  const list = [];
  for (const k of Object.keys(spec.main || {})) list.push('main/' + kebab(k));
  for (const [mod, ms] of Object.entries(spec.modules || {}))
    for (const k of Object.keys(ms || {})) list.push('modules/' + mod + '/' + kebab(k));

  const index = { generatedAt: new Date().toISOString(), tables: {} };
  let ok = 0, denied = 0, errs = 0;

  for (const model of list) {
    const rows = [];
    let offset = 0, state = null;
    try {
      for (;;) {
        const j = await call([{
          moduleName: null, endpointName: 'poqa',
          parameters: { action: { model, action: 'findAll', parameters: [{ limit: PAGE, offset }] }, uiState: 'main.dashboard' }
        }]);
        const res = j.results[0];
        if (res.status !== 200) { state = res.status; break; }
        const data = res.data || [];
        rows.push(...data);
        if (data.length < PAGE) { state = 200; break; }
        offset += PAGE;
        if (offset > 200000) { state = 200; break; }
      }
      if (state === 200) {
        fs.writeFileSync(path.join(OUT, model.replace(/\//g, '__') + '.json'), JSON.stringify(rows, null, 1));
        index.tables[model] = { status: 200, rows: rows.length };
        ok++;
      } else {
        index.tables[model] = { status: state, rows: 0 };
        denied++;
      }
    } catch (e) {
      index.tables[model] = { status: 'err', error: String(e.message).slice(0, 60) };
      errs++;
    }
  }

  fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(index, null, 1));
  console.log('tables ok=' + ok + ' denied=' + denied + ' err=' + errs + ' -> ' + OUT);
})();

