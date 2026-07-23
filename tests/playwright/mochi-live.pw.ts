import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

import {
  EXPLORER_WORKSPACE_ROOT,
  loadMochiProfile,
} from '../../scripts/mochi-explorer.mjs';
import {
  localToriiBaseUrl,
  mochiSessionPath,
} from '../../scripts/verify-mochi-seed.mjs';

const enabled = process.env.PLAYWRIGHT_LIVE_MOCHI === '1';

test.skip(!enabled, 'Set PLAYWRIGHT_LIVE_MOCHI=1 and start the pinned Explorer Mochi profile');

test('loads the deterministic seed domain through generated Mochi session config', async ({ page }) => {
  const profile = loadMochiProfile();
  const sessionPath = mochiSessionPath(EXPLORER_WORKSPACE_ROOT, profile.profile_slug);
  const session = JSON.parse(readFileSync(sessionPath, 'utf8')) as {
    ready?: boolean
    mcp_ready?: boolean
    chain_id?: string
    torii_url?: string
  };

  expect(session.ready).toBe(true);
  expect(session.mcp_ready).toBe(true);
  expect(session.chain_id).toBe(profile.chain_id);
  const toriiBaseUrl = localToriiBaseUrl(String(session.torii_url)).toString().replace(/\/$/u, '');

  await page.addInitScript((baseUrl) => {
    window.localStorage.setItem('torii_base_url', baseUrl);
  }, toriiBaseUrl);

  const domainResponse = page.waitForResponse((response) =>
    response.url().startsWith(
      `${toriiBaseUrl}/v1/explorer/domains/${encodeURIComponent(profile.seed.domain_id)}`
    )
  );
  await page.goto(`/domains/${encodeURIComponent(profile.seed.domain_id)}`);

  expect((await domainResponse).ok()).toBe(true);
  await expect(page.getByText(profile.seed.domain_id, { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-test="resource-retry"]')).toHaveCount(0);
});
