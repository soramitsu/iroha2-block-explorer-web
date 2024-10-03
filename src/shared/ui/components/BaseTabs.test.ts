import { expect, test } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import type { TabInstructions } from '@/features/filter-transactions/model';
import { INSTRUCTION_OPTIONS } from '@/features/filter-transactions/model';
import { i18n } from '@/shared/lib/localization';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import { accountInstructionsAdaptiveOptions } from '@/features/filter-transactions/adaptive-options';

test.each([
  [1700, 4],
  [1440, 3],
  [1200, 2],
  [960, 5],
  [640, 2],
  [480, 3],
  [365, 2],
])('BaseTabs adaptive display correctness', async (windowWidth, expectedTabs) => {
  const model = ref<TabInstructions>('');

  window.innerWidth = windowWidth;

  const wrapper = mount(BaseTabs, {
    props: {
      items: INSTRUCTION_OPTIONS,
      modelValue: model.value,
      adaptiveOptions: accountInstructionsAdaptiveOptions,
    },
    global: {
      plugins: [i18n],
    },
  });

  expect(wrapper.findAll('.base-tabs__tab').length).toBe(expectedTabs);
});
