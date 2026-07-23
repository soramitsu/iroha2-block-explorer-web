import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import BaseTable from './BaseTable.vue';

const BaseLoadingStub = {
  name: 'BaseLoading',
  template: '<div data-test="loading">loading</div>',
};

describe('BaseTable', () => {
  it('keeps rendering existing rows while background refresh is pending', () => {
    const wrapper = mount(BaseTable, {
      props: {
        loading: true,
        disablePagination: true,
        items: [{ id: 'a' }, { id: 'b' }],
        containerClass: 'base-table__container',
      },
      slots: {
        row: ({ item }: any) => h('div', { class: 'row' }, item.id),
      },
      global: {
        stubs: {
          BaseLoading: BaseLoadingStub,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.findAll('.content-row--with-hover')).toHaveLength(2);
    expect(wrapper.text()).toContain('a');
    expect(wrapper.text()).toContain('b');
  });

  it('shows a loader when loading and no items are available yet', () => {
    const wrapper = mount(BaseTable, {
      props: {
        loading: true,
        disablePagination: true,
        items: [],
        containerClass: 'base-table__container',
      },
      slots: {
        row: ({ item }: any) => h('div', { class: 'row' }, item.id),
      },
      global: {
        stubs: {
          BaseLoading: BaseLoadingStub,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('noData');
  });

  it('shows empty state when not loading and items list is empty', () => {
    const wrapper = mount(BaseTable, {
      props: {
        loading: false,
        disablePagination: true,
        items: [],
        containerClass: 'base-table__container',
      },
      slots: {
        row: ({ item }: any) => h('div', { class: 'row' }, item.id),
      },
      global: {
        stubs: {
          BaseLoading: BaseLoadingStub,
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('noData');
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(false);
  });

  it('exposes every consumer-provided desktop column as its own header and cell', () => {
    const wrapper = mount(BaseTable, {
      props: {
        loading: false,
        disablePagination: true,
        items: [{ id: 'a' }],
        containerClass: 'base-table__container',
      },
      slots: {
        header: () =>
          h('div', { role: 'presentation' }, [
            h('span', { role: 'columnheader' }, 'Identifier'),
            h('span', { role: 'columnheader' }, 'Value'),
          ]),
        row: ({ item }: any) =>
          h('div', { class: 'row', role: 'presentation' }, [
            h('span', { role: 'cell' }, item.id),
            h('span', { role: 'cell' }, '42'),
          ]),
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.get('[role="table"]').attributes('aria-busy')).toBe('false');
    expect(wrapper.findAll('[role="rowgroup"]')).toHaveLength(2);
    expect(wrapper.findAll('[role="row"]')).toHaveLength(2);
    expect(wrapper.findAll('[role="columnheader"]').map((header) => header.text())).toEqual(['Identifier', 'Value']);
    expect(wrapper.findAll('[role="cell"]').map((cell) => cell.text())).toEqual(['a', '42']);
    expect(wrapper.find('.base-table__semantic-cell').exists()).toBe(false);
  });

  it('uses list semantics and omits the desktop header on mobile', () => {
    const wrapper = mount(BaseTable, {
      props: {
        loading: false,
        disablePagination: true,
        items: [{ id: 'a' }, { id: 'b' }],
        containerClass: 'base-table__container',
        breakpoint: Number.MAX_SAFE_INTEGER,
      },
      slots: {
        header: () => h('span', { role: 'columnheader' }, 'Identifier'),
        row: ({ item }: any) => h('span', { role: 'cell' }, item.id),
        'mobile-card': ({ item }: any) => h('div', { class: 'card' }, item.id),
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.classes()).toContain('base-table');
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.find('[role="table"]').exists()).toBe(false);
    expect(wrapper.find('[role="row"]').exists()).toBe(false);
    expect(wrapper.find('[role="columnheader"]').exists()).toBe(false);
    expect(wrapper.get('[role="list"]').attributes('role')).toBe('list');
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(2);
  });

  it('makes pointer rows keyboard reachable and activates them with Enter or Space', async () => {
    const item = { id: 'a' };
    const wrapper = mount(BaseTable, {
      props: {
        loading: false,
        disablePagination: true,
        items: [item],
        containerClass: 'base-table__container',
        rowPointer: true,
      },
      slots: {
        row: ({ item: rowItem }: any) => h('div', { role: 'cell' }, rowItem.id),
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    const row = wrapper.get('[role="row"]');
    expect(row.attributes('tabindex')).toBe('0');
    await row.trigger('keydown', { key: 'Enter' });
    await row.trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('click:row')).toEqual([[item], [item]]);
  });
});
