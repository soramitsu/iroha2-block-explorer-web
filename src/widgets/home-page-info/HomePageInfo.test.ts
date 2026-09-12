import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import type { NetworkMetrics } from '@/shared/api/schemas';
import HomePageInfo from './HomePageInfo.vue';

const telemetry = {
  metrics: ref<NetworkMetrics | null>(null),
  isLoading: ref(false),
  isUnavailable: ref(true),
  isStale: ref(false),
};

vi.mock('@/shared/ui/composables/useTelemetryMetrics', () => ({
  useTelemetryMetrics: () => telemetry,
}));

const sampleMetrics: NetworkMetrics = {
  accounts: 13,
  assets: 13,
  domains: 6,
  block: 835,
  transactions_accepted: 1005,
  transactions_rejected: 2,
  peers: 4,
  block_created_at: new Date('2026-09-12T03:30:05.553Z'),
  finalized_block: 834,
  avg_commit_time: null,
  avg_block_time: null,
};

function mountInfo() {
  return mount(HomePageInfo, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { SearchField: true, BaseLoading: true },
    },
  });
}

describe('home network metrics', () => {
  beforeEach(() => {
    telemetry.metrics.value = null;
    telemetry.isLoading.value = false;
    telemetry.isUnavailable.value = true;
    telemetry.isStale.value = false;
  });

  it('shows unavailable telemetry without inventing zero counters or one node', () => {
    const wrapper = mountInfo();
    expect(wrapper.get('[role="status"]').text()).toBe('telemetry.telemetryUnavailable');
    expect(wrapper.findAll('.home-page-info__item-value')).toHaveLength(0);
  });

  it('shows loading while waiting for the first public snapshot', () => {
    telemetry.isLoading.value = true;
    telemetry.isUnavailable.value = false;
    const wrapper = mountInfo();
    expect(wrapper.find('base-loading-stub').exists()).toBe(true);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
    expect(wrapper.findAll('.home-page-info__item-value')).toHaveLength(0);
  });

  it('renders all six authoritative counters after a snapshot', () => {
    telemetry.metrics.value = sampleMetrics;
    telemetry.isUnavailable.value = false;
    const wrapper = mountInfo();
    expect(wrapper.findAll('.home-page-info__item-value').map((item) => item.text())).toEqual([
      '13', '13', '6', '835', '1007', '4',
    ]);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it('labels retained metrics stale when the stream is disconnected', () => {
    telemetry.metrics.value = sampleMetrics;
    telemetry.isUnavailable.value = false;
    telemetry.isStale.value = true;
    const wrapper = mountInfo();
    expect(wrapper.get('[role="status"]').text()).toBe('telemetry.dataStale');
    expect(wrapper.findAll('.home-page-info__item-value')).toHaveLength(6);
  });
});
