import { expect, test } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import type { BlockTransactionTypeTabs } from '@/features/filter-transactions/model';
import { blockTransactionTypeOptions } from '@/features/filter-transactions/model';
import { adaptiveTransactionTypeOptions } from '@/pages/Accounts/consts';
import { i18n } from '@/shared/lib/localization';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';

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
