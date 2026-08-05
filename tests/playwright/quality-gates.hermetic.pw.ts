import { expect, test, type Page, type Route } from '@playwright/test';

const HASH = '0301b76be6d3dead32484180986523173082d770bc4fd954760d0a74a434624f';
const PARTIAL_HASH = 'a'.repeat(64);
const FAILURE_HASH = 'b'.repeat(64);
const ACCOUNT = 'sorauﾛ1NﾗhBUd2BﾂｦﾄiﾔﾆﾂﾇKSﾃaﾘﾒﾓQﾗrﾒoﾘﾅnｳﾘbQｳQJﾆLJ5HSE';
const DESTINATION = 'sorauﾛ1PﾉｳﾇmEｴWｵebHﾑ6ﾔﾙｲヰiwuCWErJ7uｽoPGｱﾔnjﾑKﾋTCW2PV';
const ASSET_DEFINITION = '66owaQmAQMuHxPzxUN3bqZ6FJfDa';
const CREATED_AT = '2026-07-21T12:00:00.000Z';

interface MockResponse {
  status?: number
  body?: unknown
  contentType?: string
}

type MockResolver = (url: URL) => MockResponse | null;

const emptyPagination = (url: URL) => {
  const page = Number(url.searchParams.get('page') ?? 1);
  const perPage = Number(url.searchParams.get('per_page') ?? 10);
  return {
    pagination: { page, per_page: perPage, total_pages: 1, total_items: 0 },
    items: [],
  };
};

function block(hash: string) {
  return {
    hash,
    height: 42,
    created_at: CREATED_AT,
    prev_block_hash: null,
    transactions_hash: null,
    transactions_rejected: 0,
    transactions_total: 1,
  };
}

function transaction(hash = HASH) {
  return {
    authority: ACCOUNT,
    hash,
    block: 42,
    created_at: CREATED_AT,
    executable: 'Instructions',
    status: 'Committed',
    rejection_reason: null,
    metadata: { purpose: 'hermetic quality gate' },
    nonce: 7,
    signature: 'ed0120-hermetic-signature',
    time_to_live: null,
  };
}

function transferInstruction() {
  return {
    authority: ACCOUNT,
    created_at: CREATED_AT,
    kind: 'Transfer',
    index: 0,
    box: {
      encoded: 'TlJUM-hermetic-transfer-payload',
      json: {
        kind: 'Transfer',
        payload: {
          variant: 'Asset',
          value: {
            source: `${ASSET_DEFINITION}#${ACCOUNT}`,
            object: '100000',
            destination: DESTINATION,
          },
        },
      },
    },
    transaction_hash: HASH,
    transaction_status: 'Committed',
    block: 42,
  };
}

async function installHermeticApi(page: Page, resolver: MockResolver, requests: URL[] = []) {
  await page.route('**/v1/**', async (route: Route) => {
    const url = new URL(route.request().url());
    requests.push(url);
    const response = resolver(url) ?? { status: 404, body: { message: `No fixture for ${url.pathname}` } };
    await route.fulfill({
      status: response.status ?? 200,
      contentType: response.contentType ?? 'application/json',
      body: JSON.stringify(response.body ?? {}),
    });
  });
}

function exactSearchResolver(url: URL): MockResponse | null {
  const blockHash = decodeURIComponent(url.pathname.replace('/v1/explorer/blocks/', ''));
  const transactionHash = decodeURIComponent(url.pathname.replace('/v1/explorer/transactions/', ''));

  if (url.pathname === `/v1/explorer/blocks/${HASH}`) return { body: block(HASH) };
  if (url.pathname === `/v1/explorer/transactions/${HASH}`) return { body: transaction(HASH) };
  if (url.pathname === `/v1/explorer/blocks/${PARTIAL_HASH}`) return { body: block(PARTIAL_HASH) };
  if (url.pathname === `/v1/explorer/transactions/${PARTIAL_HASH}`) {
    return { status: 500, body: { message: 'transaction index unavailable' } };
  }
  if (blockHash === FAILURE_HASH || transactionHash === FAILURE_HASH) {
    return { status: 500, body: { message: 'exact index unavailable' } };
  }
  if (url.pathname === '/v1/explorer/blocks') return { body: emptyPagination(url) };
  if (url.pathname === '/v1/explorer/transactions/latest') {
    return { body: { sampled_at: CREATED_AT, items: [] } };
  }
  return null;
}

function countTransactionRequests(requests: URL[], hash: string): number {
  return requests.filter((url) => (
    url.pathname.endsWith(hash) && url.pathname.includes('/transactions/')
  )).length;
}

function requestedInstructionKind(requests: URL[], kind: string): boolean {
  return requests.some((url) => (
    url.pathname === '/v1/explorer/instructions' && url.searchParams.get('kind') === kind
  ));
}

function requestedAccountsCursor(
  requests: URL[],
  expected: { domain: string, cursor: string | null, limit: string }
): boolean {
  return requests.some((url) => (
    url.searchParams.get('domain') === expected.domain
    && url.searchParams.get('cursor') === expected.cursor
    && url.searchParams.get('limit') === expected.limit
  ));
}

test.describe('hermetic Explorer quality gates', () => {
  test('normalizes an exact hash search and renders both exact matches', async ({ page }) => {
    await installHermeticApi(page, exactSearchResolver);
    await page.goto('/');

    const search = page.locator('.home-page__search input[type="search"]');
    await search.fill(`0x${HASH.toUpperCase()}`);
    await search.press('Enter');

    await expect(page).toHaveURL(new RegExp(`/search\\?q=${HASH}$`, 'u'));
    await expect(page.locator('[data-test="search-results-query"]')).toHaveText(HASH);
    await expect(page.locator('[data-test="search-result-block"]')).toContainText('Block');
    await expect(page.locator('[data-test="search-result-transaction"]')).toContainText('Transaction');
  });

  test('keeps a successful probe visible on partial failure and exposes a full failure retry', async ({ page }) => {
    const requests: URL[] = [];
    await installHermeticApi(page, exactSearchResolver, requests);

    await page.goto(`/search?q=${PARTIAL_HASH}`);
    await expect(page.locator('[data-test="search-result-block"]')).toBeVisible();
    await expect(page.locator('[data-test="search-result-transaction-notice"]')).toHaveAttribute('role', 'alert');
    await expect(page.locator('[data-test="search-result-transaction-notice"]'))
      .toContainText('Transaction lookup failed: {"message":"transaction index unavailable"}');
    expect(countTransactionRequests(requests, PARTIAL_HASH)).toBe(1);

    await page.locator('[data-test="search-results-partial-retry"]').click();
    await expect.poll(() => countTransactionRequests(requests, PARTIAL_HASH)).toBe(2);

    await page.goto(`/search?q=${FAILURE_HASH}`);
    await expect(page.locator('[data-test="search-results-error"]'))
      .toContainText('The exact lookup could not be completed: {"message":"exact index unavailable"}');
    await expect(page.locator('[data-test="resource-retry"]')).toHaveText('Retry exact lookup');
  });

  test('shows semantic, raw, and unavailable evidence states and supports keyboard tabs', async ({ page }) => {
    const instruction = transferInstruction();
    const requests: URL[] = [];
    await installHermeticApi(page, (url) => {
      if (url.pathname === `/v1/explorer/transactions/${HASH}`) return { body: transaction() };
      if (url.pathname === '/v1/explorer/instructions') {
        const pageNumber = Number(url.searchParams.get('page') ?? 1);
        const perPage = Number(url.searchParams.get('per_page') ?? 10);
        return {
          body: {
            pagination: { page: pageNumber, per_page: perPage, total_pages: 1, total_items: 1 },
            items: [instruction],
          },
        };
      }
      if (url.pathname === `/v1/explorer/instructions/${HASH}/0`) return { body: instruction };
      if (
        url.pathname === `/v1/ledger/block/42/proof/${HASH}`
        || url.pathname === '/v1/ledger/state/42'
        || url.pathname === '/v1/ledger/state-proof/42'
      ) return { status: 404, body: { message: 'evidence unavailable in fixture node' } };
      return null;
    }, requests);

    await page.goto(`/transactions/${HASH}?instruction=0`);

    await expect(page.locator('[data-test="instruction-semantic-card"]').first()).toContainText('Asset transfer');
    await expect(page.locator('[data-test="instruction-semantic-field-amount"] dd').first()).toHaveText('100000');
    await expect(page.locator('[data-test="instruction-encoded-payload"]'))
      .toHaveText('TlJUM-hermetic-transfer-payload');
    await expect(page.locator('.instructions-detail__json')).toContainText('Raw instruction JSON');
    await expect(page.locator('[data-test="block-proof-unavailable"]')).toBeVisible();
    await expect(page.locator('[data-test="state-proof-unavailable"]')).toBeVisible();
    await expect(page.getByText("This node has no state root at the transaction's block height.")).toBeVisible();
    await expect(page.getByText('Node-provided · BLS not verified here')).toBeVisible();

    const allTab = page.getByRole('tab', { name: 'All', exact: true });
    await allTab.focus();
    await allTab.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Register', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect.poll(() => requestedInstructionKind(requests, 'Register')).toBe(true);
  });

  test('restores URL filters and activates cursor pagination from the keyboard', async ({ page }) => {
    const accountRequests: URL[] = [];
    await installHermeticApi(page, (url) => {
      if (url.pathname !== '/v1/explorer/accounts') return null;
      const cursor = url.searchParams.get('cursor');
      const limit = Number(url.searchParams.get('limit') ?? 10);
      accountRequests.push(url);
      return {
        body: {
          pagination: {
            limit,
            next_cursor: cursor === null ? 'cursor-1' : null,
            has_more: cursor === null,
          },
          items: [{
            id: ACCOUNT,
            compressed_address: null,
            network_prefix: 0,
            metadata: {},
            owned_assets: 2,
            owned_nfts: 1,
            owned_domains: 1,
          }],
        },
      };
    });

    await page.goto('/accounts?domain=wonderland.universal&limit=20');
    const domainFilter = page.getByLabel('Domain filter');
    await expect(domainFilter).toHaveValue('wonderland.universal');
    await expect.poll(() => requestedAccountsCursor(
      accountRequests,
      { domain: 'wonderland.universal', cursor: null, limit: '20' }
    )).toBe(true);

    await domainFilter.fill('treasury.universal');
    await expect(page).toHaveURL(/\/accounts\?[^#]*domain=treasury\.universal/u);
    await expect(page).not.toHaveURL(/[?&]cursor=/u);
    await page.reload();
    await expect(page.getByLabel('Domain filter')).toHaveValue('treasury.universal');

    const nextPage = page.getByRole('button', { name: 'Next cursor page' });
    await nextPage.focus();
    await nextPage.press('Enter');
    await expect(page).toHaveURL(/[?&]cursor=cursor-1(?:&|$)/u);
    await expect.poll(() => requestedAccountsCursor(
      accountRequests,
      { domain: 'treasury.universal', cursor: 'cursor-1', limit: '20' }
    )).toBe(true);
  });

  test('uses a multi-column table on desktop and a card list on mobile', async ({ page }, testInfo) => {
    await installHermeticApi(page, (url) => {
      if (url.pathname !== '/v1/explorer/accounts') return null;
      const limit = Number(url.searchParams.get('limit') ?? 10);
      return {
        body: {
          pagination: { limit, next_cursor: null, has_more: false },
          items: [{
            id: ACCOUNT,
            compressed_address: null,
            network_prefix: 0,
            metadata: {},
            owned_assets: 2,
            owned_nfts: 1,
            owned_domains: 1,
          }],
        },
      };
    });

    await page.goto('/accounts');

    const explorerTable = page.locator('.accounts-list-page .base-table');
    if (testInfo.project.name === 'mobile-chromium') {
      await expect(explorerTable).not.toHaveAttribute('role', 'table');
      await expect(explorerTable.getByRole('list')).toHaveCount(1);
      await expect(explorerTable.getByRole('listitem')).toHaveCount(1);
      await expect(explorerTable.getByRole('columnheader')).toHaveCount(0);
      await expect(explorerTable.getByRole('cell')).toHaveCount(0);
      return;
    }

    await expect(explorerTable).toHaveAttribute('role', 'table');
    await expect(explorerTable.getByRole('columnheader')).toHaveCount(3);
    const dataRow = explorerTable.locator('.content-row--with-hover');
    await expect(dataRow.getByRole('cell')).toHaveCount(3);
    await expect(dataRow.getByRole('link')).toHaveCount(1);
  });
});
