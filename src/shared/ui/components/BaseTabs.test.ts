import { expect, test } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import type { TabBlocksScreen } from '@/features/filter-transactions/model';
import { blockOptions } from '@/features/filter-transactions/model';
import { i18n } from '@/shared/lib/localization';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import { defaultAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';

test.each([
  [1700, 6],
  [1440, 6],
  [1200, 6],
  [960, 6],
  [640, 3],
  [480, 4],
  [365, 2],
])('BaseTabs adaptive display correctness', async (windowWidth, expectedTabs) => {
  const model = ref<TabBlocksScreen>('Transactions');

  window.innerWidth = windowWidth;

  const wrapper = mount(BaseTabs, {
    props: {
      items: blockOptions,
      modelValue: model.value,
      adaptiveOptions: defaultAdaptiveOptions,
    },
    global: {
      plugins: [i18n],
    },
  });

  expect(wrapper.findAll('.base-tabs__tab').length).toBe(expectedTabs);
});
