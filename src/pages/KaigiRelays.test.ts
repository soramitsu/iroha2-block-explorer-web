import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import KaigiRelays from './KaigiRelays.vue';
import { i18n } from '@/shared/lib/localization';

vi.mock('@/shared/api', () => ({
  buildToriiUrl: (path: string) => `https://torii.example/v1${path.startsWith('/') ? path : `/${path}`}`,
  fetchKaigiRelays: vi.fn(),
  fetchKaigiRelayHealthSnapshot: vi.fn(),
  fetchKaigiRelayDetail: vi.fn(),
}));

vi.mock('@/shared/utils/setup-async-data', () => ({
  setupAsyncData: vi.fn(() => ({
    isLoading: false,
    data: undefined,
    refetch: vi.fn(),
  })),
}));

const BaseContentBlockStub = {
  props: ['title'],
  template: '<section><slot /></section>',
};

const BaseLoadingStub = {
  template: '<div />',
};

const BaseTableStub = {
  props: ['items', 'rowKey'],
  template: '<div><slot name="header" /><slot name="row" v-for="item in items" :item="item" /></div>',
};

const TimeStampStub = {
  props: ['value'],
  template: '<time />',
};

const DataFieldStub = {
  props: ['title', 'value'],
  template: '<span />',
};

const KaigiRelayEventsStub = {
  props: ['streamUrl'],
  template: '<div data-test="kaigi-relay-events" :data-stream-url="streamUrl" />',
};

describe('KaigiRelays', () => {
  it('does not mount the authenticated Kaigi relay event stream in the public Explorer', () => {
    const wrapper = mount(KaigiRelays, {
      global: {
        plugins: [i18n],
        stubs: {
          BaseContentBlock: BaseContentBlockStub,
          BaseLoading: BaseLoadingStub,
          BaseTable: BaseTableStub,
          TimeStamp: TimeStampStub,
          DataField: DataFieldStub,
          KaigiRelayEvents: KaigiRelayEventsStub,
        },
      },
    });

    expect(wrapper.find('[data-test="kaigi-relay-events"]').exists()).toBe(false);
  });
});
