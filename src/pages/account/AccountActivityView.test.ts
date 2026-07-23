import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { defineComponent } from 'vue';
import AccountActivityView from './AccountActivityView.vue';

const apiMocks = vi.hoisted(() => ({
  fetchAccountHistory: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  fetchAccountHistory: apiMocks.fetchAccountHistory,
}));

const ACCOUNT = 'account:alice';
const COUNTERPARTY = 'account:bob';
const EXACT_AMOUNT = '90071992547409931234567890.000000000000000001';

const BaseContentBlockStub = defineComponent({
  name: 'BaseContentBlock',
  props: { title: { type: String, default: '' } },
  template: '<section><h2>{{ title }}</h2><slot /></section>',
});

const BaseTableStub = defineComponent({
  name: 'BaseTable',
  props: {
    items: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
  },
  emits: ['update:page', 'update:page-size'],
  template: `
    <div class="base-table-stub" :data-total="total">
      <slot name="header" />
      <div v-for="item in items" :key="item.id" class="base-table-row">
        <slot name="row" :item="item" />
      </div>
    </div>
  `,
});

const BaseLinkStub = defineComponent({
  name: 'BaseLink',
  props: { to: { type: String, required: true } },
  template: '<a :href="to"><slot /></a>',
});

const BaseButtonStub = defineComponent({
  name: 'BaseButton',
  emits: ['click'],
  template: '<button @click="$emit(\'click\')"><slot /></button>',
});

function historyResponse(items: Record<string, unknown>[]) {
  return {
    status: 'ok',
    data: {
      items,
      total: items.length,
      has_more: false,
      count_mode: 'exact',
      indexed_height: 42,
      indexed_block_hash: 'f'.repeat(64),
      query_source: 'account_history_index',
    },
  };
}

async function factory(query: Record<string, string> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/account', component: { template: '<div />' } }],
  });
  await router.push({ path: '/account', query });
  await router.isReady();

  const wrapper = mount(AccountActivityView, {
    props: { accountId: ACCOUNT },
    global: {
      plugins: [router],
      stubs: {
        BaseButton: BaseButtonStub,
        BaseContentBlock: BaseContentBlockStub,
        BaseLink: BaseLinkStub,
        BaseLoading: { template: '<span>spinner</span>' },
        BaseTable: BaseTableStub,
      },
    },
  });

  await flushPromises();
  return { router, wrapper };
}

describe('AccountActivityView', () => {
  beforeEach(() => {
    apiMocks.fetchAccountHistory.mockReset();
  });

  it('uses URL pagination/filter state and renders exact indexed values with semantic links', async () => {
    apiMocks.fetchAccountHistory.mockResolvedValue(
      historyResponse([
        {
          id: 'history-1',
          source: 'asset_transfer',
          type: 'TRANSFER',
          timestamp_ms: 1_725_000_000_123,
          status: 'COMMITTED',
          result_ok: true,
          direction: 'OUTGOING',
          account_id: ACCOUNT,
          counterparty_account_id: COUNTERPARTY,
          asset_id: 'rose#wonderland#account:alice',
          asset_definition_id: 'rose#wonderland',
          amount: EXACT_AMOUNT,
          tx_hash: 'a'.repeat(64),
          operation_id: 'operation-7',
        },
      ])
    );

    const { router, wrapper } = await factory({
      activity_page: '2',
      activity_per_page: '20',
      activity_asset: 'rose#wonderland',
    });

    expect(apiMocks.fetchAccountHistory).toHaveBeenCalledWith(ACCOUNT, {
      page: 2,
      per_page: 20,
      asset_id: 'rose#wonderland',
    });
    expect(wrapper.get('[data-test="activity-index-evidence"]').text()).toContain('account_history_index');
    expect(wrapper.text()).toContain(EXACT_AMOUNT);
    expect(wrapper.text()).toContain('1725000000123 ms');
    expect(wrapper.find(`a[href="/accounts/${encodeURIComponent(COUNTERPARTY)}"]`).exists()).toBe(true);
    expect(wrapper.find('a[href="/assets/rose%23wonderland"]').exists()).toBe(true);
    expect(wrapper.find(`a[href="/transactions/${'a'.repeat(64)}"]`).exists()).toBe(true);
    expect(wrapper.get('.base-table-stub').attributes('data-total')).toBe('1');

    await wrapper.get('[data-test="activity-asset-filter"]').setValue('  tea#wonderland  ');
    await flushPromises();

    expect(router.currentRoute.value.query).toMatchObject({
      activity_asset: 'tea#wonderland',
      activity_per_page: '20',
    });
    expect(router.currentRoute.value.query.activity_page).toBeUndefined();
  });

  it.each([
    [
      'permission-denied',
      { status: 'permission-denied', error: new Error('private dataspace') },
      '[data-test="activity-permission-denied"]',
      'Torii denied access',
    ],
    [
      'error',
      { status: 'unknown-error', error: new Error('bad payload') },
      '[data-test="activity-error"]',
      'bad payload',
    ],
  ])('renders the %s state without presenting it as an empty result', async (_name, result, selector, message) => {
    apiMocks.fetchAccountHistory.mockResolvedValue(result);

    const { wrapper } = await factory();

    expect(wrapper.get(selector).text()).toContain(message);
    expect(wrapper.find('[data-test="activity-empty"]').exists()).toBe(false);
  });

  it('renders an explicit empty state for a successful zero-row response', async () => {
    apiMocks.fetchAccountHistory.mockResolvedValue(historyResponse([]));

    const { wrapper } = await factory();

    expect(wrapper.get('[data-test="activity-empty"]').text()).toContain('No account activity');
    expect(wrapper.get('[data-test="activity-visibility-notice"]').text()).toContain('private dataspaces');
  });
});
