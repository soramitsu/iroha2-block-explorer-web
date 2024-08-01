import { expect, test } from 'vitest';
import { ref } from 'vue';
import { adaptiveTransactionTypeOptions } from '../src/pages/Accounts/consts';
import { mount } from '@vue/test-utils';
import BaseTabs from '../src/shared/ui/components/BaseTabs.vue';
import type { BlockTransactionTypeTabs } from '../src/features/filter-transactions/model';
import { blockTransactionTypeOptions } from '../src/features/filter-transactions/model';
import { i18n } from '../src/shared/lib/localization';

test.each([
  [1700, 6],
  [1440, 5],
  [1200, 3],
  [960, 6],
  [640, 3],
  [480, 5],
  [365, 2],
])('BaseTabs adaptive display correctness', async (windowWidth, expectedTabs) => {
  const model = ref<BlockTransactionTypeTabs>('transactions');

  window.innerWidth = windowWidth;

  const wrapper = mount(BaseTabs, {
    props: {
      items: blockTransactionTypeOptions,
      modelValue: model.value,
      adaptiveOptions: adaptiveTransactionTypeOptions,
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
  }
});
