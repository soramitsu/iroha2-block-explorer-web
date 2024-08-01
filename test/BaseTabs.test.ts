import { expect, test } from 'vitest';
import { ref } from 'vue';
import { adaptiveTransactionTypeOptions } from '../src/pages/Accounts/consts';
import { mount } from '@vue/test-utils';
import BaseTabs from '../src/shared/ui/components/BaseTabs.vue';
import type { BlockTransactionTypeTabs } from '../src/features/filter-transactions/model';
import { getBlockTransactionTypeOptions } from '../src/features/filter-transactions/model';

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
      items: getBlockTransactionTypeOptions(),
      modelValue: model.value,
      adaptiveOptions: adaptiveTransactionTypeOptions,
    },
  });

  function checkTabs() {
    expect(wrapper.findAll('.base-tabs__tab').length).toBe(expectedTabs);
  }

  if (expectedTabs === 2) {
    const nextButton = wrapper.find('.base-tabs__arrow');

    await nextButton.trigger('click');
    checkTabs();

    await nextButton.trigger('click');
    checkTabs();

    const prevButton = wrapper.find('.base-tabs__arrow');
    await prevButton.trigger('click');

    checkTabs();
  } else if (expectedTabs !== wrapper.vm.items.length) {
    const nextButton = wrapper.find('.base-tabs__arrow');

    await nextButton.trigger('click');
    checkTabs();

    const prevButton = wrapper.find('.base-tabs__arrow');

    await prevButton.trigger('click');
    checkTabs();
  }

  wrapper.unmount();
});
