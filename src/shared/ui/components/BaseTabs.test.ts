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
  [640, 4],
  [480, 4],
  [365, 3],
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

  function checkTabs() {
    expect(wrapper.findAll('.base-tabs__tab').length).toBe(expectedTabs);
  }

  if (expectedTabs === 2) {
    const nextButton = wrapper.find(`[data-testid="next"]`);

    await nextButton.trigger('click');
    checkTabs();

    await nextButton.trigger('click');
    checkTabs();

    const prevButton = wrapper.find(`[data-testid="prev"]`);
    await prevButton.trigger('click');

    checkTabs();
  } else if (expectedTabs !== 6) {
    const nextButton = wrapper.find(`[data-testid="next"]`);

    await nextButton.trigger('click');
    checkTabs();

    const prevButton = wrapper.find(`[data-testid="prev"]`);

    await prevButton.trigger('click');
    checkTabs();
  } else {
    expect(wrapper.findAll('.base-tabs__arrow').length).toBe(0);
  }
});
