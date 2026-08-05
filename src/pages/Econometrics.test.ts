import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import BigNumber from 'bignumber.js';
import Econometrics from './Econometrics.vue';
import { i18n } from '@/shared/lib/localization';
import { NOT_FOUND, SUCCESSFUL_FETCHING, UNKNOWN_ERROR } from '@/shared/api/consts';

const SAMPLE_ACCOUNT_ID =
  'sorauﾛ1NﾗhBUd2BﾂｦﾄiﾔﾆﾂﾇKSﾃaﾘﾒﾓQﾗrﾒoﾘﾅnｳﾘbQｳQJﾆLJ5HSE';
const SAMPLE_ASSET_DEFINITION_ID = '66owaQmAQMuHxPzxUN3bqZ6FJfDa';
const SAMPLE_ASSET_ALIAS = 'usd#issuer.main';

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  currentRoute: { value: { name: 'econometrics', query: {}, params: {} } as any },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    currentRoute: routerMocks.currentRoute,
    replace: routerMocks.replace,
    push: routerMocks.push,
  }),
}));

const apiMocks = vi.hoisted(() => ({
  fetchAssetDefinition: vi.fn(),
  fetchAssetDefinitionEconometrics: vi.fn(),
  fetchAssetDefinitionSnapshot: vi.fn(),
  fetchAssets: vi.fn(),
  fetchInstructions: vi.fn(),
  fetchAssetDefinitions: vi.fn(),
  getToriiBaseUrl: vi.fn(() => 'http://localhost'),
}));

vi.mock('@/shared/api', () => apiMocks);

const runtimeConfigState = vi.hoisted(() => ({
  value: { toriiEconometricsEndpointsEnabled: false },
}));

vi.mock('@/shared/runtime-config', () => ({
  getRuntimeConfig: () => runtimeConfigState.value,
}));

const setupState = {
  isLoading: false,
  data: {
    status: SUCCESSFUL_FETCHING,
    data: {
      pagination: { limit: 50, next_cursor: null as string | null, has_more: false },
      items: [] as any[],
    },
  },
  refetch: vi.fn(),
};

vi.mock('@/shared/utils/setup-async-data', () => ({
  setupAsyncData: vi.fn(() => setupState),
}));

const BaseContentBlockStub = {
  template: '<div><slot name="header-action" /><slot /><slot name="default" /></div>',
};

const BaseInnerBlockStub = {
  props: ['title'],
  template: '<div><div class="inner-title">{{ title }}</div><slot /></div>',
};

const DataFieldStub = {
  props: ['title', 'value', 'hash'],
  template: `
    <div
      class="data-field-stub"
      :data-title="title"
    >
      <span class="data-field-title">{{ title }}</span>
      <span class="data-field-value">{{
        typeof hash === 'string' && hash.length > 0 ? hash : value === null || value === undefined ? 'none' : String(value)
      }}</span>
    </div>
  `,
};

const BaseTableStub = {
  name: 'BaseTable',
  props: ['items'],
  emits: ['click:row', 'update:page', 'update:pageSize'],
  template: `
    <div>
      <div
        v-for="item in items"
        class="row"
        @click="$emit('click:row', item)"
      >
        <slot
          name="row"
          :item="item"
        />
      </div>
    </div>
  `,
};

describe('Econometrics', () => {
  beforeEach(() => {
    routerMocks.replace.mockReset();
    routerMocks.push.mockReset();
    apiMocks.fetchAssetDefinition.mockReset();
    apiMocks.fetchAssetDefinitionEconometrics.mockReset();
    apiMocks.fetchAssetDefinitionSnapshot.mockReset();
    apiMocks.fetchAssets.mockReset();
    apiMocks.fetchInstructions.mockReset();
    setupState.data.data.items = [];
    routerMocks.currentRoute.value = { name: 'econometrics', query: {}, params: {} } as any;
    runtimeConfigState.value = { toriiEconometricsEndpointsEnabled: false };

    apiMocks.fetchAssetDefinition.mockResolvedValue({
      status: SUCCESSFUL_FETCHING,
      data: {
        id: SAMPLE_ASSET_DEFINITION_ID,
        alias: null,
        total_quantity: new BigNumber(0),
        locked_quantity: null,
        circulating_quantity: null,
      },
    });

    apiMocks.fetchAssetDefinitionSnapshot.mockResolvedValue({ status: NOT_FOUND });
    apiMocks.fetchAssetDefinitionEconometrics.mockResolvedValue({ status: NOT_FOUND });

    apiMocks.fetchAssets.mockResolvedValue({
      status: SUCCESSFUL_FETCHING,
      data: {
        pagination: { limit: 100, next_cursor: null, has_more: false },
        items: [],
      },
    });

    apiMocks.fetchInstructions.mockResolvedValue({
      status: SUCCESSFUL_FETCHING,
      data: {
        pagination: { page: 1, per_page: 200, total_pages: 1, total_items: 0 },
        items: [],
      },
    });
  });

  it('computes when an asset is clicked in the asset list (no Compute button required)', async () => {
    setupState.data.data.items = [
      {
        id: SAMPLE_ASSET_DEFINITION_ID,
        alias: SAMPLE_ASSET_ALIAS,
        name: 'usd',
        logo: null,
        assets: 0,
        total_quantity: new BigNumber(0),
        locked_quantity: null,
        circulating_quantity: null,
        metadata: {},
        mintable: 'Infinitely',
        owned_by: SAMPLE_ACCOUNT_ID,
      },
    ];

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await flushPromises();

    const row = wrapper.get('.row');
    await row.trigger('click');
    await flushPromises();

    expect(routerMocks.replace).toHaveBeenCalledWith({ query: { asset: SAMPLE_ASSET_DEFINITION_ID } });
    expect(apiMocks.fetchAssetDefinition).toHaveBeenCalledTimes(1);
  });

  it('advances authoritative cursors in the explicitly configured client-scan mode', async () => {
    routerMocks.currentRoute.value = {
      name: 'econometrics',
      query: { asset: SAMPLE_ASSET_DEFINITION_ID },
      params: {},
    } as any;

    apiMocks.fetchAssets
      .mockResolvedValueOnce({
        status: SUCCESSFUL_FETCHING,
        data: {
          pagination: { limit: 100, next_cursor: 'cursor-1', has_more: true },
          items: [
            {
              id: `${SAMPLE_ASSET_DEFINITION_ID}#${SAMPLE_ACCOUNT_ID}`,
              definition_id: SAMPLE_ASSET_DEFINITION_ID,
              account_id: SAMPLE_ACCOUNT_ID,
              value: new BigNumber(1),
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        status: SUCCESSFUL_FETCHING,
        data: {
          pagination: { limit: 100, next_cursor: null, has_more: false },
          items: [],
        },
      });

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await flushPromises();

    expect(apiMocks.fetchAssetDefinitionSnapshot).not.toHaveBeenCalled();
    expect(apiMocks.fetchAssets).toHaveBeenNthCalledWith(1, {
      cursor: null,
      limit: 100,
      definition: SAMPLE_ASSET_DEFINITION_ID,
    });
    expect(apiMocks.fetchAssets).toHaveBeenNthCalledWith(2, {
      cursor: 'cursor-1',
      limit: 100,
      definition: SAMPLE_ASSET_DEFINITION_ID,
    });
    expect(wrapper.text()).not.toContain('Failed to fetch');
  });

  it('fails closed when a holder scan repeats a previously visited cursor', async () => {
    routerMocks.currentRoute.value = {
      name: 'econometrics',
      query: { asset: SAMPLE_ASSET_DEFINITION_ID },
      params: {},
    } as any;
    apiMocks.fetchAssets
      .mockResolvedValueOnce({
        status: SUCCESSFUL_FETCHING,
        data: {
          pagination: { limit: 100, next_cursor: 'cursor-1', has_more: true },
          items: [],
        },
      })
      .mockResolvedValueOnce({
        status: SUCCESSFUL_FETCHING,
        data: {
          pagination: { limit: 100, next_cursor: 'cursor-1', has_more: true },
          items: [],
        },
      });

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });
    await flushPromises();

    expect(apiMocks.fetchAssets).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain(i18n.global.t('econometrics.fetchError'));
  });

  it('labels a truncated holder fallback as sampled with no authoritative total', async () => {
    setupState.data.data.items = [
      {
        id: SAMPLE_ASSET_DEFINITION_ID,
        alias: SAMPLE_ASSET_ALIAS,
        name: 'usd',
        logo: null,
        assets: 100,
        total_quantity: new BigNumber(100),
        locked_quantity: null,
        circulating_quantity: null,
        metadata: {},
        mintable: 'Infinitely',
        owned_by: SAMPLE_ACCOUNT_ID,
      },
    ];
    apiMocks.fetchAssets.mockResolvedValueOnce({
      status: SUCCESSFUL_FETCHING,
      data: {
        pagination: { limit: 100, next_cursor: 'cursor-2', has_more: true },
        items: Array.from({ length: 100 }, (_, index) => ({
          id: `${SAMPLE_ASSET_DEFINITION_ID}#holder-${index}`,
          definition_id: SAMPLE_ASSET_DEFINITION_ID,
          account_id: `holder-${index}`,
          value: new BigNumber(1),
        })),
      },
    });

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await wrapper.findAll('input[type="number"]')[0]?.setValue(100);
    await wrapper.get('.row').trigger('click');
    await vi.waitFor(() => {
      expect(wrapper.find('[data-testid="holder-sample-notice"]').exists()).toBe(true);
    });

    const sampled = i18n.global.t('econometrics.coverageSampled');
    expect(wrapper.get('[data-testid="holder-sample-notice"]').text()).toContain('exact total unavailable');
    expect(wrapper.get(`[data-title="${i18n.global.t('econometrics.holders')} (${sampled})"]`).text()).toContain('100');
    expect(wrapper.get(`[data-title="${i18n.global.t('econometrics.totalSupply')} (${sampled})"]`).text()).toContain('100');
    expect(wrapper.get(`[data-title="${i18n.global.t('econometrics.coverage')}"]`).text()).toContain(sampled);
    expect(wrapper.text()).toContain(`${i18n.global.t('econometrics.snapshotTitle')} (${sampled})`);
    expect(wrapper.text()).toContain(`${i18n.global.t('econometrics.topHoldersTitle')} (${sampled})`);
  });

  it('keeps a fully exhausted holder fallback exact', async () => {
    routerMocks.currentRoute.value = {
      name: 'econometrics',
      query: { asset: SAMPLE_ASSET_DEFINITION_ID },
      params: {},
    } as any;
    apiMocks.fetchAssets.mockResolvedValueOnce({
      status: SUCCESSFUL_FETCHING,
      data: {
        pagination: { limit: 100, next_cursor: null, has_more: false },
        items: [
          {
            id: `${SAMPLE_ASSET_DEFINITION_ID}#${SAMPLE_ACCOUNT_ID}`,
            definition_id: SAMPLE_ASSET_DEFINITION_ID,
            account_id: SAMPLE_ACCOUNT_ID,
            value: new BigNumber(7),
          },
        ],
      },
    });

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await vi.waitFor(() => {
      expect(wrapper.find(`[data-title="${i18n.global.t('econometrics.holders')}"]`).exists()).toBe(true);
    });

    expect(wrapper.get(`[data-title="${i18n.global.t('econometrics.holders')}"]`).text()).toContain('1');
    expect(wrapper.get(`[data-title="${i18n.global.t('econometrics.totalSupply')}"]`).text()).toContain('7');
    expect(wrapper.get(`[data-title="${i18n.global.t('econometrics.coverage')}"]`).text()).toContain('1/1');
    expect(wrapper.get(`[data-title="${i18n.global.t('econometrics.coverage')}"]`).text()).toContain(
      i18n.global.t('econometrics.coverageComplete')
    );
    expect(wrapper.find('[data-testid="holder-sample-notice"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain(
      `${i18n.global.t('econometrics.snapshotTitle')} (${i18n.global.t('econometrics.coverageSampled')})`
    );
  });

  it('renders the fetched asset alias in the computed snapshot for canonical asset ids', async () => {
    routerMocks.currentRoute.value = {
      name: 'econometrics',
      query: { asset: SAMPLE_ASSET_DEFINITION_ID },
      params: {},
    } as any;

    apiMocks.fetchAssetDefinition.mockResolvedValueOnce({
      status: SUCCESSFUL_FETCHING,
      data: {
        id: SAMPLE_ASSET_DEFINITION_ID,
        alias: SAMPLE_ASSET_ALIAS,
        total_quantity: new BigNumber(0),
        locked_quantity: null,
        circulating_quantity: null,
      },
    });

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.get('[data-title="Alias"]').text()).toContain(SAMPLE_ASSET_ALIAS);
    expect(wrapper.get('[data-title="Asset definition"]').text()).toContain(SAMPLE_ASSET_DEFINITION_ID);
  });

  it('renders asset aliases in the asset-definition picker list when available', async () => {
    setupState.data.data.items = [
      {
        id: SAMPLE_ASSET_DEFINITION_ID,
        alias: SAMPLE_ASSET_ALIAS,
        name: 'usd',
        logo: null,
        assets: 0,
        total_quantity: new BigNumber(0),
        locked_quantity: null,
        circulating_quantity: null,
        metadata: {},
        mintable: 'Infinitely',
        owned_by: SAMPLE_ACCOUNT_ID,
      },
    ];

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain(SAMPLE_ASSET_ALIAS);
    expect(wrapper.text()).toContain(SAMPLE_ASSET_DEFINITION_ID);
  });

  it('removes unfiltered picker rows while the owner filter is invalid', async () => {
    setupState.data.data.items = [
      {
        id: SAMPLE_ASSET_DEFINITION_ID,
        alias: null,
        name: null,
        logo: null,
        assets: 1,
        total_quantity: new BigNumber(1),
        locked_quantity: null,
        circulating_quantity: null,
        metadata: {},
        mintable: 'Infinitely',
        owned_by: SAMPLE_ACCOUNT_ID,
      },
    ];
    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });
    const ownerFilter = wrapper.get(`input[placeholder="${i18n.global.t('assets.filters.ownerPlaceholder')}"]`);
    expect(wrapper.text()).toContain(SAMPLE_ASSET_DEFINITION_ID);

    await ownerFilter.setValue('not-a-valid-owner');
    await flushPromises();

    expect(wrapper.text()).toContain(i18n.global.t('searchUnsupported'));
    expect(wrapper.text()).not.toContain(SAMPLE_ASSET_DEFINITION_ID);
  });

  it.each([
    {
      name: 'returned server error',
      configure: () => apiMocks.fetchAssetDefinitionSnapshot.mockResolvedValueOnce({
        status: UNKNOWN_ERROR,
        error: new Error('snapshot service unavailable'),
      }),
      message: 'snapshot service unavailable',
    },
    {
      name: 'thrown schema error',
      configure: () => apiMocks.fetchAssetDefinitionSnapshot.mockRejectedValueOnce(
        new Error('snapshot schema mismatch')
      ),
      message: 'snapshot schema mismatch',
    },
  ])('surfaces a $name without falling back to a holder scan', async ({ configure, message }) => {
    runtimeConfigState.value = { toriiEconometricsEndpointsEnabled: true };
    routerMocks.currentRoute.value = {
      name: 'econometrics',
      query: { asset: SAMPLE_ASSET_DEFINITION_ID },
      params: {},
    } as any;
    configure();

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain(message));
    expect(apiMocks.fetchAssets).not.toHaveBeenCalled();
    expect(apiMocks.fetchInstructions).not.toHaveBeenCalled();
  });

  it('surfaces an econometrics endpoint failure without switching to instruction scans', async () => {
    runtimeConfigState.value = { toriiEconometricsEndpointsEnabled: true };
    routerMocks.currentRoute.value = {
      name: 'econometrics',
      query: { asset: SAMPLE_ASSET_DEFINITION_ID },
      params: {},
    } as any;
    apiMocks.fetchAssetDefinitionSnapshot.mockResolvedValueOnce({
      status: SUCCESSFUL_FETCHING,
      data: {
        definition_id: SAMPLE_ASSET_DEFINITION_ID,
        computed_at_ms: 1_700_000_000_000,
        holders_total: 0,
        total_supply: new BigNumber(0),
        top_holders: [],
        distribution: {
          gini: 0,
          hhi: 0,
          theil: 0,
          entropy: 0,
          entropy_normalized: 0,
          nakamoto_33: 0,
          nakamoto_51: 0,
          nakamoto_67: 0,
          top1: 0,
          top5: 0,
          top10: 0,
          median: null,
          p90: null,
          p99: null,
          lorenz: [{ population: 0, share: 0 }, { population: 1, share: 1 }],
        },
      },
    });
    apiMocks.fetchAssetDefinitionEconometrics.mockRejectedValueOnce(
      new Error('econometrics schema mismatch')
    );

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await vi.waitFor(() => expect(wrapper.text()).toContain('econometrics schema mismatch'));
    expect(apiMocks.fetchAssets).not.toHaveBeenCalled();
    expect(apiMocks.fetchInstructions).not.toHaveBeenCalled();
  });

  it('ignores a stale endpoint failure after a newer asset finishes successfully', async () => {
    runtimeConfigState.value = { toriiEconometricsEndpointsEnabled: true };
    setupState.data.data.items = [
      {
        id: 'first#main',
        alias: null,
        name: null,
        logo: null,
        assets: 0,
        total_quantity: new BigNumber(0),
        locked_quantity: null,
        circulating_quantity: null,
        metadata: {},
        mintable: 'Infinitely',
        owned_by: SAMPLE_ACCOUNT_ID,
      },
      {
        id: 'second#main',
        alias: null,
        name: null,
        logo: null,
        assets: 0,
        total_quantity: new BigNumber(0),
        locked_quantity: null,
        circulating_quantity: null,
        metadata: {},
        mintable: 'Infinitely',
        owned_by: SAMPLE_ACCOUNT_ID,
      },
    ];
    apiMocks.fetchAssetDefinition.mockImplementation(async (definition: string) => ({
      status: SUCCESSFUL_FETCHING,
      data: {
        id: SAMPLE_ASSET_DEFINITION_ID,
        alias: definition,
        total_quantity: new BigNumber(0),
        locked_quantity: null,
        circulating_quantity: null,
      },
    }));

    let rejectFirstSnapshot!: (reason: Error) => void;
    const firstSnapshot = new Promise((_, reject) => {
      rejectFirstSnapshot = reject;
    });
    apiMocks.fetchAssetDefinitionSnapshot
      .mockImplementationOnce(() => firstSnapshot)
      .mockResolvedValueOnce({
        status: SUCCESSFUL_FETCHING,
        data: {
          definition_id: SAMPLE_ASSET_DEFINITION_ID,
          computed_at_ms: 1_700_000_000_000,
          holders_total: 0,
          total_supply: new BigNumber(0),
          top_holders: [],
          distribution: {
            gini: 0,
            hhi: 0,
            theil: 0,
            entropy: 0,
            entropy_normalized: 0,
            nakamoto_33: 0,
            nakamoto_51: 0,
            nakamoto_67: 0,
            top1: 0,
            top5: 0,
            top10: 0,
            median: null,
            p90: null,
            p99: null,
            lorenz: [{ population: 0, share: 0 }, { population: 1, share: 1 }],
          },
        },
      });
    apiMocks.fetchAssetDefinitionEconometrics.mockResolvedValueOnce({
      status: SUCCESSFUL_FETCHING,
      data: {
        computed_at_ms: 1_700_000_000_000,
        velocity_windows: [],
        issuance_windows: [],
        issuance_series: [],
      },
    });

    const wrapper = mount(Econometrics, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseInnerBlock: BaseInnerBlockStub,
          BaseTable: BaseTableStub,
          BaseButton: true,
          BaseHash: true,
          BaseLoading: true,
          DataField: DataFieldStub,
        },
      },
    });

    await wrapper.findAll('.row')[0]!.trigger('click');
    await vi.waitFor(() => expect(apiMocks.fetchAssetDefinitionSnapshot).toHaveBeenCalledTimes(1));
    await wrapper.findAll('.row')[1]!.trigger('click');
    await vi.waitFor(() => expect(wrapper.text()).toContain('second#main'));

    rejectFirstSnapshot(new Error('stale snapshot failure'));
    await flushPromises();

    expect(wrapper.text()).toContain('second#main');
    expect(wrapper.text()).not.toContain('stale snapshot failure');
  });
});
