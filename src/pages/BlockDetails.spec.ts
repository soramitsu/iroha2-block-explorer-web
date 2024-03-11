import { mount, config } from '@vue/test-utils';
import { describe, it, vi, expect } from 'vitest';
import BlockDetails from '../pages/BlockDetails.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '../../src/app/router';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

config.global.mocks = {
  $t: (msg:string) => msg,
};

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (msg:string) => msg,
  }),
}));

// Test conditional rendering:
// Verify that elements like the block-details-card and transactions-list-page are only rendered when block has a value.
describe('BlockDetails.vue', async () => {
  it('renders the block-details-card and block-transactions-list correctly', async () => {
    router.push('/blocks/606600');
    await router.isReady();
    const wrapper = mount(BlockDetails, {
      global: {
        plugins: [router],
      },
    });
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));
    const blockCardComponent = wrapper.find('.block-details-card__body');
    const blockTransactionsListComponent = wrapper.find('.transactions-list-page');
    expect(blockCardComponent.exists()).toBe(true);
    expect(blockTransactionsListComponent.exists()).toBe(true);
  });

});

describe('BlockDetailsCard.vue', () => {
  it('renders things fine', () => {

  })
})

// test2
// write a test that matches the backend data to mocked data types and if there types matches it passses

// test 3: Test pagination:
// Verify that the pagination controls work as expected, adjusting the displayed transactions based on the selected page.
