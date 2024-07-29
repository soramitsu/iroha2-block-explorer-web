import { test, expect } from 'vitest';
import { render } from '@testing-library/vue';
import BaseTabs from '../src/shared/ui/components/BaseTabs.vue';
import type { BlockTransactionTypeTabs } from '../src/features/filter-transactions/model';
import { blockTransactionTypeOptions } from '../src/features/filter-transactions/model';
import { ref } from 'vue';
import { adaptiveTransactionTypeOptions } from '../src/pages/Accounts/consts';
import { applyAdaptiveOptions } from '../src/shared/ui/utils/adaptive-options';
import { i18n } from '../src/shared/lib/localization';

test('BaseTabs adaptive display correctness', async () => {
  const model = ref<BlockTransactionTypeTabs>('transactions');

  // Since rerender method doesn't work as expected due to changing window width
  // we will render & unmount our component every time
  function renderBaseTabs(width: number) {
    window.innerWidth = width;

    const { unmount } = render(BaseTabs, {
      global: {
        plugins: [i18n],
      },
      props: {
        items: blockTransactionTypeOptions,
        modelValue: model.value,
        adaptiveOptions: adaptiveTransactionTypeOptions,
      },
    });

    const tabs = document.getElementsByClassName('base-tabs__tab').length;
    expect(tabs).toBe(applyAdaptiveOptions(width, adaptiveTransactionTypeOptions));

    unmount();
  }

  renderBaseTabs(365);
  renderBaseTabs(480);
  renderBaseTabs(960);
  renderBaseTabs(1200);
  renderBaseTabs(1440);
  renderBaseTabs(1700);
});
