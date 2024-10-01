import { expect, test } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import type { TabAccountInstructions } from '@/features/filter-transactions/model';
import { ACCOUNT_INSTRUCTIONS_OPTIONS } from '@/features/filter-transactions/model';
import { i18n } from '@/shared/lib/localization';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import { defaultAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';

test.each([
  [1700, 5],
  [1440, 5],
  [1200, 3],
  [960, 5],
  [640, 3],
  [480, 5],
  [365, 3],
])('BaseTabs adaptive display correctness', async (windowWidth, expectedTabs) => {
  const model = ref<TabAccountInstructions>('Transfer');

  window.innerWidth = windowWidth;

  const wrapper = mount(BaseTabs, {
    props: {
      items: ACCOUNT_INSTRUCTIONS_OPTIONS,
      modelValue: model.value,
      adaptiveOptions: defaultAdaptiveOptions,
    },
    global: {
      plugins: [i18n],
    },
  });

  expect(wrapper.findAll('.base-tabs__tab').length).toBe(expectedTabs);
});
