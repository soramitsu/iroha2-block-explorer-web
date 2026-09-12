import { createHash } from 'node:crypto';
import { expect, test, type Page, type Route, type TestInfo } from '@playwright/test';
import tairaHistory from '../fixtures/taira-history.json' with { type: 'json' };
import nestedTransfer from '../fixtures/taira-nested-transfer.json' with { type: 'json' };
import { startHistoryRecoveryServer } from '../helpers/history-recovery-server';

// These tests serve unchanged production bytes from the admitted local preview.
// Only runtime configuration and read-only Torii responses are controlled here.
// No codec module, initialization export, or Wasm byte is replaced by a fixture.
const EXPLORER_ORIGIN = 'https://taira-explorer.sora.org';
const TORII_ORIGIN = 'https://taira.sora.org';
const PREVIEW_ORIGIN = 'http://127.0.0.1:4175';
const PROFILE = {
  toriiBaseUrl: TORII_ORIGIN,
  toriiForceBaseUrl: true,
  networkId: 'hash:97507E381726890C14F116C07577A26146286D6B2C2747F902FC08D8FBE4731D#DF02',
  networkPrefix: 369,
};
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  `connect-src 'self' ${TORII_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ');
const EXPECTED_ERROR = 'The deployment configuration or application could not be loaded. Retry, or contact the deployment operator.';
const EXPECTED_CONSOLE_ERROR = '[bootstrap] Explorer initialization failed. Check deployment configuration and connectivity.';
const expectedWasmSha256 = process.env.BPNG_EXPECTED_BROWSER_CODEC_WASM_SHA256;
if (typeof expectedWasmSha256 !== 'string' || !/^[0-9a-f]{64}$/u.test(expectedWasmSha256) || /^0+$/u.test(expectedWasmSha256)) {
  throw new Error('Online SDK tests require the independently authenticated owner Wasm SHA-256.');
}

function barrier() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

interface Observation {
  event: string
  url?: string
  method?: string
  sha256?: string
  sizeBytes?: number
}

interface Scenario {
  profile?: Record<string, unknown>
  configGate?: ReturnType<typeof barrier>
  wasmGate?: ReturnType<typeof barrier>
  failFirstWasm?: boolean
  nestedMultisig?: boolean
  recoveryServer?: Awaited<ReturnType<typeof startHistoryRecoveryServer>>
}

async function installScenario(page: Page, scenario: Scenario = {}) {
  const explorerOrigin = scenario.recoveryServer ? PREVIEW_ORIGIN : EXPLORER_ORIGIN;
  const toriiOrigin = scenario.recoveryServer?.origin ?? TORII_ORIGIN;
  const contentSecurityPolicy = scenario.recoveryServer ? CSP.replace(TORII_ORIGIN, toriiOrigin) : CSP;
  const observations: Observation[] = [];
  const apiRequests: { url: string, method: string }[] = [];
  const unexpectedRequests: string[] = [];
  const pageErrors: string[] = [];
  const bootstrapErrors: string[] = [];
  let configRequests = 0;
  let wasmRequests = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().startsWith('[bootstrap]')) bootstrapErrors.push(message.text());
  });
  await page.routeWebSocket('**/*', async (socket) => {
    unexpectedRequests.push(`Unexpected WebSocket blocked: ${socket.url()}`);
    await socket.close({ code: 1008, reason: 'No WebSocket is part of the startup gate.' });
  });
  async function fulfillToriiRead(route: Route, url: URL) {
    const request = route.request();
    const method = request.method();
    apiRequests.push({ url: url.href, method });
    observations.push({ event: 'api-request', url: url.href, method });
    const headers = {
      'access-control-allow-origin': EXPLORER_ORIGIN,
      'access-control-allow-methods': 'GET, HEAD, OPTIONS',
      'access-control-allow-headers': request.headers()['access-control-request-headers'] ?? '*',
    };
    if (method === 'OPTIONS') return await route.fulfill({ status: 204, headers });
    if (!['GET', 'HEAD'].includes(method)) {
      unexpectedRequests.push(`Ledger write blocked: ${method} ${url.href}`);
      return await route.abort('blockedbyclient');
    }
    if (scenario.nestedMultisig) {
      const transaction = tairaHistory.latestTransactions.items[0];
      // The envelope is a controlled read fixture. Only its nested instruction
      // has captured Norito bytes; no fabricated outer encoding is supplied.
      const instruction = {
        authority: transaction.authority,
        created_at: transaction.created_at,
        kind: 'Custom', index: 0,
        transaction_hash: transaction.hash,
        transaction_status: transaction.status,
        block: transaction.block,
        box: {
          framed_sha256: `0x${'1'.repeat(64)}`,
          json: {
            kind: 'Custom',
            payload: {
              variant: 'Custom',
              value: {
                Propose: {
                  account: transaction.authority,
                  instructions: [nestedTransfer.encodedInstruction],
                  transaction_ttl_ms: 120_000,
                },
              },
            },
          },
        },
      };
      if (url.pathname === `/v1/explorer/transactions/${transaction.hash}`) {
        return await route.fulfill({
          headers, json: {
            ...transaction, rejection_reason: null,
            executable_payload: { instruction_count: 1 },
            metadata: { purpose: 'Controlled nested codec browser regression' },
            nonce: 1, signature: '', time_to_live: null,
          },
        });
      }
      if (url.pathname === '/v1/explorer/instructions') {
        expect(url.searchParams.get('transaction_hash')).toBe(transaction.hash);
        return await route.fulfill({
          headers, json: {
            pagination: {
              ...tairaHistory.blocks.pagination,
              limit: Number(url.searchParams.get('limit') ?? 10), next_cursor: null, has_more: false,
            },
            items: [instruction],
          },
        });
      }
      if (url.pathname === `/v1/explorer/instructions/${transaction.hash}/0`) {
        return await route.fulfill({ headers, json: instruction });
      }
      if (url.pathname === `/v1/explorer/blocks/${transaction.block}`) {
        return await route.fulfill({ headers, json: tairaHistory.blocks.items[0] });
      }
      if (url.pathname === '/v1/explorer/instructions/stream') {
        return await route.fulfill({ status: 204, headers });
      }
      if ([
        `/v1/ledger/block/${transaction.block}/proof/${transaction.hash}`,
        `/v1/ledger/state/${transaction.block}`,
        `/v1/ledger/state-proof/${transaction.block}`,
      ].includes(url.pathname)) {
        return await route.fulfill({ status: 404, headers, json: { message: 'Evidence unavailable for controlled instruction fixture' } });
      }
    }
    if (url.pathname === '/v1/explorer/blocks') {
      return await route.fulfill({
        contentType: 'application/json', headers,
        body: JSON.stringify({
          ...tairaHistory.blocks,
          pagination: { ...tairaHistory.blocks.pagination, limit: Number(url.searchParams.get('limit') ?? 10) },
        }),
      });
    }
    if (url.pathname === '/v1/explorer/transactions/latest') {
      return await route.fulfill({
        contentType: 'application/json', headers,
        body: JSON.stringify({
          ...tairaHistory.latestTransactions,
          pagination: { ...tairaHistory.latestTransactions.pagination, limit: Number(url.searchParams.get('limit') ?? 10) },
        }),
      });
    }
    if (url.pathname === '/v1/telemetry/live' || url.pathname === '/v1/explorer/blocks/stream'
      || url.pathname === '/v1/explorer/transactions/stream') {
      // These startup checks do not claim live telemetry availability.
      return await route.fulfill({ status: 204, headers });
    }
    unexpectedRequests.push(`Unreviewed Torii read: ${method} ${url.href}`);
    return await route.fulfill({ status: 404, contentType: 'application/json', headers, body: '{}' });
  }
  // Browser routing disables its HTTP cache, and the project blocks service
  // workers. Every actual module/Wasm load must therefore cross this boundary.
  await page.route('**/*', async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    if (url.origin === toriiOrigin) {
      if (!scenario.recoveryServer) return await fulfillToriiRead(route, url);
      apiRequests.push({ url: url.href, method });
      observations.push({ event: 'api-request', url: url.href, method });
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        unexpectedRequests.push(`Ledger write blocked: ${method} ${url.href}`);
        return await route.abort('blockedbyclient');
      }
      // Preserve a real streaming response and the browser's own EventSource.
      // route.fulfill would buffer/close SSE and would not test OPEN recovery.
      return await route.continue();
    }
    if (url.origin !== explorerOrigin || method !== 'GET') {
      unexpectedRequests.push(`Unexpected request blocked: ${method} ${url.href}`);
      return await route.abort('blockedbyclient');
    }
    if (url.pathname === '/config.json') {
      configRequests += 1;
      observations.push({ event: 'config-request', url: url.href });
      await scenario.configGate?.promise;
      observations.push({ event: 'config-response', url: url.href });
      return await route.fulfill({
        contentType: 'application/json', headers: { 'cache-control': 'no-store' },
        body: JSON.stringify(scenario.profile ?? PROFILE),
      });
    }
    const isWasm = url.pathname.endsWith('.wasm');
    if (isWasm) {
      wasmRequests += 1;
      observations.push({ event: 'wasm-request', url: url.href });
      expect(url.pathname).toMatch(/^\/_assets\/[A-Za-z0-9._-]+\.wasm$/u);
      if (scenario.failFirstWasm && wasmRequests === 1) {
        observations.push({ event: 'wasm-request-failed', url: url.href });
        return await route.abort('failed');
      }
      await scenario.wasmGate?.promise;
    }
    // Fetch only from the fixed local Vite production preview. Disallow
    // redirects so a static response cannot cause an unobserved remote fetch.
    const response = await route.fetch({ url: `${PREVIEW_ORIGIN}${url.pathname}${url.search}`, maxRedirects: 0 });
    expect(response.status()).toBe(200);
    const body = await response.body();
    if (isWasm) {
      const sha256 = createHash('sha256').update(body).digest('hex');
      expect(response.headers()['content-type']).toContain('application/wasm');
      expect(body.subarray(0, 8)).toEqual(Buffer.from([0, 97, 115, 109, 1, 0, 0, 0]));
      expect(body.length).toBeGreaterThan(8);
      expect(sha256).toBe(expectedWasmSha256);
      observations.push({ event: 'owner-wasm-response', url: url.href, sha256, sizeBytes: body.length });
    }
    const headers: Record<string, string> = { ...response.headers(), 'cache-control': 'no-store' };
    if (request.isNavigationRequest()) headers['content-security-policy'] = contentSecurityPolicy;
    // The application/module/Wasm body is exactly the local production body;
    // the test adds only the deployment CSP and cache policy headers.
    await route.fulfill({ response, body, headers });
  });
  return {
    observations, apiRequests, unexpectedRequests, pageErrors, bootstrapErrors, contentSecurityPolicy,
    get configRequests() { return configRequests; },
    get wasmRequests() { return wasmRequests; },
  };
}

type InstalledScenario = Awaited<ReturnType<typeof installScenario>>;

async function expectNotMounted(page: Page, state: InstalledScenario) {
  await expect(page.locator('#app[data-v-app]')).toHaveCount(0);
  await expect(page.locator('.latest-transactions__row')).toHaveCount(0);
  expect(state.apiRequests).toEqual([]);
}

async function expectReady(page: Page, state: InstalledScenario) {
  await expect(page.getByTestId('browser-codec-loading')).toHaveCount(0);
  await expect(page.locator('#app[data-v-app]')).toHaveCount(1);
  await expect(page.locator(`a[href="/transactions/${tairaHistory.latestTransactions.items[0].hash}"]`)).toBeVisible();
  await expect(page.locator('.latest-blocks__row').first()).toContainText(String(tairaHistory.blocks.items[0].height));
  expect(state.apiRequests.some(request => new URL(request.url).pathname === '/v1/explorer/transactions/latest')).toBe(true);
  expect(state.unexpectedRequests).toEqual([]);
  expect(state.pageErrors).toEqual([]);
  const firstWasmResponse = state.observations.findIndex(item => item.event === 'owner-wasm-response');
  const firstApiRequest = state.observations.findIndex(item => item.event === 'api-request');
  expect(firstWasmResponse).toBeGreaterThan(-1);
  expect(firstApiRequest).toBeGreaterThan(firstWasmResponse);
}

async function attachObservations(testInfo: TestInfo, state: InstalledScenario) {
  await testInfo.attach('online-sdk-startup-observations', {
    contentType: 'application/json',
    body: Buffer.from(JSON.stringify({ expectedWasmSha256, ...state }, null, 2)),
  });
}

test('validates the Taira profile before real Wasm and waits for its readiness before mounting or Torii reads', async ({ page }, testInfo) => {
  const configGate = barrier();
  const wasmGate = barrier();
  const state = await installScenario(page, { configGate, wasmGate });
  try {
    const documentResponse = await page.goto(EXPLORER_ORIGIN, { waitUntil: 'domcontentloaded' });
    expect(documentResponse?.headers()['content-security-policy']).toBe(CSP);
    expect(CSP).toContain("'wasm-unsafe-eval'");
    expect(CSP).not.toContain("'unsafe-eval'");
    await expect(page.getByTestId('browser-codec-loading')).toBeVisible();
    await expect.poll(() => state.configRequests).toBe(1);
    await expectNotMounted(page, state);
    expect(state.wasmRequests).toBe(0);
    configGate.release();
    await expect.poll(() => state.wasmRequests).toBe(1);
    await expect(page.getByTestId('browser-codec-loading')).toBeVisible();
    await expectNotMounted(page, state);
    expect(state.observations.findIndex(item => item.event === 'wasm-request'))
      .toBeGreaterThan(state.observations.findIndex(item => item.event === 'config-response'));
    wasmGate.release();
    await expectReady(page, state);
    expect(state.wasmRequests).toBe(1);
    expect(state.bootstrapErrors).toEqual([]);
  } finally {
    configGate.release();
    wasmGate.release();
    await attachObservations(testInfo, state);
  }
});

test('one failed real Wasm fetch exposes only the safe error and explicit Retry loads the actual owner once', async ({ page }, testInfo) => {
  const wasmGate = barrier();
  const state = await installScenario(page, { wasmGate, failFirstWasm: true });
  try {
    await page.goto(EXPLORER_ORIGIN, { waitUntil: 'domcontentloaded' });
    const alert = page.getByRole('alert');
    await expect(alert.getByRole('heading', { name: 'Explorer could not start' })).toBeVisible();
    await expect(alert.locator('p')).toHaveText(EXPECTED_ERROR);
    await expectNotMounted(page, state);
    expect(state.wasmRequests).toBe(1);
    expect(state.bootstrapErrors).toEqual([EXPECTED_CONSOLE_ERROR]);
    await alert.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect.poll(() => state.wasmRequests).toBe(2);
    await expect(page.getByTestId('browser-codec-loading')).toBeVisible();
    await expectNotMounted(page, state);
    wasmGate.release();
    await expectReady(page, state);
    expect(state.wasmRequests).toBe(2);
    expect(state.configRequests).toBe(1);
    expect(state.observations.filter(item => item.event === 'owner-wasm-response')).toHaveLength(1);
    await expect(page.getByRole('alert')).toHaveCount(0);
  } finally {
    wasmGate.release();
    await attachObservations(testInfo, state);
  }
});

test('the real browser codec decodes nested multisig Transfer accounts with the explicit Taira prefix 369', async ({ page }, testInfo) => {
  expect(nestedTransfer.networkPrefix).toBe(PROFILE.networkPrefix);
  expect(createHash('sha256').update(Buffer.from(nestedTransfer.encodedInstruction, 'base64')).digest('hex'))
    .toBe(nestedTransfer.encodedInstructionSha256);
  const state = await installScenario(page, { nestedMultisig: true });
  const transaction = tairaHistory.latestTransactions.items[0];
  try {
    const documentResponse = await page.goto(`${EXPLORER_ORIGIN}/transactions/${transaction.hash}`, { waitUntil: 'domcontentloaded' });
    expect(documentResponse?.headers()['content-security-policy']).toBe(CSP);
    const row = page.locator('.instructions-table__row');
    await expect(row).toHaveCount(1);
    await expect(row.locator('[data-test="instruction-kind-label"]')).toHaveText('Multisig');
    await row.getByRole('button', { name: 'View details', exact: true }).click();
    await expect(page).toHaveURL(`${EXPLORER_ORIGIN}/transactions/${transaction.hash}?instruction=0`);
    const detail = page.locator('.instructions-detail');
    await expect(detail.locator('[data-test="instruction-detail-kind"]')).toContainText('Multisig');
    for (const container of [row, detail]) {
      const decoded = container.locator('[data-test="instruction-semantic-nested-0"]');
      await expect(decoded).toContainText('Asset transfer');
      await expect(decoded.getByRole('link', { name: nestedTransfer.expected.source, exact: true })).toBeVisible();
      await expect(decoded.getByRole('link', { name: nestedTransfer.expected.destination, exact: true })).toBeVisible();
      await expect(decoded.locator('dd').filter({ hasText: /^100000$/u })).toHaveText(nestedTransfer.expected.amount);
      await expect(decoded).not.toContainText('Encoded instruction');
      await expect(decoded).not.toContainText('sora');
    }
    await expect(page.locator('[data-test="block-proof-unavailable"]')).toBeVisible();
    await expect(page.locator('[data-test="state-proof-unavailable"]')).toBeVisible();
    expect(state.wasmRequests).toBe(1);
    expect(state.configRequests).toBe(1);
    expect(state.observations.filter(item => item.event === 'owner-wasm-response')).toHaveLength(1);
    const wasmResponse = state.observations.findIndex(item => item.event === 'owner-wasm-response');
    expect(state.observations.findIndex(item => item.event === 'api-request')).toBeGreaterThan(wasmResponse);
    expect(state.apiRequests.some(request => new URL(request.url).pathname === `/v1/explorer/instructions/${transaction.hash}/0`)).toBe(true);
    expect(state.apiRequests.every(request => ['GET', 'HEAD', 'OPTIONS'].includes(request.method))).toBe(true);
    expect(state.unexpectedRequests).toEqual([]);
    expect(state.pageErrors).toEqual([]);
    expect(state.bootstrapErrors).toEqual([]);
  } finally {
    await attachObservations(testInfo, state);
  }
});

test('recovers failed initial history while a real HTTP transaction stream stays open without events', async ({ page }, testInfo) => {
  const peer = await startHistoryRecoveryServer(PREVIEW_ORIGIN);
  const networkDiagnostics: string[] = [];
  page.on('requestfailed', request => networkDiagnostics.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
  page.on('console', message => {
    if (message.type() === 'error') networkDiagnostics.push(message.text());
  });
  const state = await installScenario(page, {
    recoveryServer: peer,
    // Explicit local test peer; the production-host profile remains covered
    // unchanged by the other six scenarios and the separate live Taira run.
    profile: { ...PROFILE, toriiBaseUrl: peer.origin },
  });
  try {
    // Chrome requires permission for an actual loopback peer. Grant it only to
    // this fresh test context and this local origin, with all request guards intact.
    await page.context().grantPermissions(['local-network-access'], { origin: PREVIEW_ORIGIN });
    const firstHistory = page.waitForResponse(response =>
      response.url().startsWith(`${peer.origin}/v1/explorer/transactions/latest`) && response.status() === 500,
    { timeout: 10_000 });
    const documentResponse = await page.goto(PREVIEW_ORIGIN, { waitUntil: 'domcontentloaded' });
    expect(documentResponse?.headers()['content-security-policy']).toBe(state.contentSecurityPolicy);
    await (await firstHistory).finished();
    await expect(page.locator('.latest-transactions_loading')).toHaveCount(0);
    await expect(page.locator('.latest-transactions__row')).toHaveCount(0);
    expect(peer.latestRequests).toBe(1);
    await expect.poll(() => peer.connectedStreams).toBe(1);
    const streamResponse = page.waitForResponse(response =>
      response.url() === `${peer.origin}/v1/explorer/transactions/stream` && response.status() === 200,
    { timeout: 10_000 });
    peer.openTransactionStream();
    expect((await streamResponse).headers()['content-type']).toBe('text/event-stream');
    await expect(page.locator('.latest-transactions__row')).toHaveCount(tairaHistory.latestTransactions.items.length, { timeout: 15_000 });
    await expect(page.locator(`.latest-transactions a[href="/transactions/${tairaHistory.latestTransactions.items[0].hash}"]`)).toBeVisible();
    expect(peer.latestRequests).toBeGreaterThanOrEqual(2);
    expect(peer.connectedStreams).toBe(1);
    expect(peer.openedStreams).toBe(1);
    expect(peer.transactionEventsSent).toBe(0);
    expect(peer.requests.filter(request => request.path.startsWith('/v1/explorer/transactions/latest')).map(request => request.status))
      .toEqual([500, 200]);
    expect(peer.unexpectedRequests).toEqual([]);
    expect(state.unexpectedRequests).toEqual([]);
    expect(state.pageErrors).toEqual([]);
    expect(state.bootstrapErrors).toEqual([]);
    expect(state.wasmRequests).toBe(1);
  } finally {
    await testInfo.attach('real-http-history-recovery', {
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify({
        requests: peer.requests, connectedStreams: peer.connectedStreams, openedStreams: peer.openedStreams,
        transactionEventsSent: peer.transactionEventsSent, unexpectedRequests: peer.unexpectedRequests,
        localNetworkPermissionOrigin: PREVIEW_ORIGIN, networkDiagnostics,
      }, null, 2)),
    });
    await attachObservations(testInfo, state);
    await page.close();
    await peer.close();
  }
});

for (const [name, profile] of [
  ['missing network prefix', { toriiBaseUrl: TORII_ORIGIN, toriiForceBaseUrl: true, networkId: PROFILE.networkId }],
  ['wrong network prefix', { ...PROFILE, networkPrefix: 0 }],
  ['extra failover setting', { ...PROFILE, toriiFailoverEnabled: true }],
] as const) {
  test(`invalid production profile (${name}) starts neither Wasm nor API consumers`, async ({ page }, testInfo) => {
    const state = await installScenario(page, { profile });
    try {
      await page.goto(EXPLORER_ORIGIN, { waitUntil: 'domcontentloaded' });
      const alert = page.getByRole('alert');
      await expect(alert.getByRole('heading', { name: 'Explorer could not start' })).toBeVisible();
      await expect(alert.locator('p')).toHaveText(EXPECTED_ERROR);
      await expectNotMounted(page, state);
      expect(state.configRequests).toBe(1);
      expect(state.wasmRequests).toBe(0);
      expect(state.bootstrapErrors).toEqual([EXPECTED_CONSOLE_ERROR]);
      expect(state.unexpectedRequests).toEqual([]);
      expect(state.pageErrors).toEqual([]);
    } finally {
      await attachObservations(testInfo, state);
    }
  });
}
