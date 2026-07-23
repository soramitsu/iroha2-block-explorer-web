import { expect, test } from '@playwright/test';

const GRAPH_STORAGE_KEY = 'kotodama_studio_graph_document_v2';
const LEGACY_STORAGE_KEY = 'kotodama_studio_document_v1';

function dataTest(name: string): string {
  return `[data-test="${name}"]`;
}

function createLegacyStudioDocument() {
  return {
    version: 1,
    updatedAt: '2026-03-29T00:00:00.000Z',
    metadata: {
      title: 'RewardGarden',
      dataspace: 'party',
      authority: 'host@party.main',
      chainId: 'wonderland',
      description: 'Celebrate good actions with gifts and bright details.',
    },
    workspaceState: null,
    workflow: {
      nodes: [
        {
          id: 'trigger-1',
          type: 'studio',
          position: { x: 80, y: 80 },
          data: {
            title: 'Friend joins',
            caption: 'Start the flow when a new friend appears.',
            category: 'trigger',
            binding: null,
            config: {},
          },
        },
        {
          id: 'contract-1',
          type: 'studio',
          position: { x: 400, y: 80 },
          data: {
            title: 'Deploy reward contract',
            caption: 'Prepare the contract for the party lane.',
            category: 'contract',
            binding: 'celebrate',
            config: {},
          },
        },
      ],
      edges: [
        { id: 'edge-trigger-contract', source: 'trigger-1', target: 'contract-1', label: '' },
        { id: 'edge-invalid', source: 'contract-1', target: 'missing-node', label: '' },
      ],
    },
  };
}

test('builds and diagnoses a graph-first contract while deployment stays unavailable', async ({ page }) => {
  await page.goto('/studio');

  await expect(page.locator('.contract-graph-canvas')).toBeVisible();
  await expect(page.locator('.kotodama-graph-node--entrypoint').first()).toBeVisible();
  await expect(page.locator('.kotodama-graph-node--guard').first()).toBeVisible();
  await expect(page.locator('.kotodama-graph-node--effect').first()).toBeVisible();
  await expect(page.locator(dataTest('studio-source'))).toContainText('seiyaku StablecoinSimple');

  await page.getByRole('button', { name: 'State', exact: true }).click();
  await page.getByRole('button', { name: 'State', exact: true }).click();
  await expect(page.locator(dataTest('studio-semantic-diagnostics'))).toContainText('State "counter" is defined more than once.');
  await expect(page.locator(dataTest('studio-compile'))).toBeDisabled();

  await page.locator(dataTest('studio-semantic-diagnostics')).getByRole('button').first().click();
  await expect(page.locator(dataTest('studio-node-title'))).toHaveValue('State field');

  await page.getByLabel('State name').fill('counter_two');
  await expect(page.locator(dataTest('studio-semantic-diagnostics'))).toHaveCount(0);
  await expect(page.locator(dataTest('studio-source'))).toContainText('state int counter_two;');

  await expect(page.locator(dataTest('studio-deploy'))).toBeDisabled();
  await expect(page.locator(dataTest('studio-deployment-unavailable')))
    .toContainText('does not provide an approved browser signing and submission API');
  await expect(page.locator('input[type="password"]')).toHaveCount(0);

  const stored = await page.evaluate((key) => window.localStorage.getItem(key), GRAPH_STORAGE_KEY);
  expect(stored).toContain('"version": 2');
});

test('imports legacy v1 Studio storage into the graph document model', async ({ page }) => {
  await page.addInitScript(({ storageKey, documentJson }) => {
    window.localStorage.setItem(storageKey, documentJson);
  }, {
    storageKey: LEGACY_STORAGE_KEY,
    documentJson: JSON.stringify(createLegacyStudioDocument()),
  });

  await page.goto('/studio');

  await expect(page.locator('.contract-graph-canvas')).toBeVisible();
  await expect(page.locator(dataTest('studio-source'))).toContainText('seiyaku RewardGarden');
  await expect(page.locator(dataTest('studio-source'))).toContainText('kotoage fn celebrate()');
  await expect(page.locator('.kotodama-graph-node--trigger')).toBeVisible();
  await expect(page.locator('.app-notifications__item')).toHaveCount(0);

  const stored = await page.evaluate((key) => window.localStorage.getItem(key), GRAPH_STORAGE_KEY);
  expect(stored).toContain('"version": 2');
  expect(stored).toContain('"title": "RewardGarden"');
});
