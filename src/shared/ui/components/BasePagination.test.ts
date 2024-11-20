import { expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import { i18n } from '@/shared/lib/localization';
import BasePagination from '@/shared/ui/components/BasePagination.vue';

test.each([
  [
    {
      items: 15,
      page: 0,
      pageSize: 10,
      payloadPagination: { page: 4, per_page: 10, total_pages: 4, total_items: 35 },
      reversed: true,
      totalItems: 35,
    },
    {
      segmentInfo: '35-21 of 35',
      numbers: ['3', '2', '1'],
      activePage: '3',
    },
  ],
  [
    {
      items: 10,
      page: 0,
      pageSize: 10,
      payloadPagination: { page: 3, per_page: 10, total_pages: 3, total_items: 30 },
      reversed: true,
      totalItems: 30,
    },
    {
      segmentInfo: '30-21 of 30',
      numbers: ['3', '2', '1'],
      activePage: '3',
    },
  ],
  [
    {
      items: 15,
      page: 0,
      pageSize: 10,
      payloadPagination: { page: 11, per_page: 10, total_pages: 11, total_items: 105 },
      reversed: true,
      totalItems: 105,
    },
    {
      segmentInfo: '105-91 of 105',
      numbers: ['10', '9', '8', '7', '6', '5', '4', '. . .', '1'],
      activePage: '10',
    },
  ],
  [
    {
      items: 10,
      page: 8,
      pageSize: 10,
      payloadPagination: { page: 8, per_page: 10, total_pages: 13, total_items: 125 },
      reversed: true,
      totalItems: 125,
    },
    {
      segmentInfo: '80-71 of 125',
      numbers: ['12', '11', '10', '9', '8', '7', '6', '. . .', '1'],
      activePage: '8',
    },
  ],
  [
    {
      items: 10,
      page: 3,
      pageSize: 10,
      payloadPagination: { page: 3, per_page: 10, total_pages: 13, total_items: 125 },
      reversed: true,
      totalItems: 125,
    },
    {
      segmentInfo: '30-21 of 125',
      numbers: ['12', '. . .', '7', '6', '5', '4', '3', '2', '1'],
      activePage: '3',
    },
  ],
  [
    {
      items: 10,
      page: 8,
      pageSize: 10,
      payloadPagination: { page: 8, per_page: 10, total_pages: 20, total_items: 195 },
      reversed: true,
      totalItems: 195,
    },
    {
      segmentInfo: '80-71 of 195',
      numbers: ['19', '. . .', '11', '10', '9', '8', '7', '6', '5', '. . .', '1'],
      activePage: '8',
    },
  ],
  [
    {
      items: 10,
      page: 2,
      pageSize: 10,
      payloadPagination: { page: 2, per_page: 10, total_pages: 4, total_items: 35 },
      reversed: true,
      totalItems: 35,
    },
    {
      segmentInfo: '20-11 of 35',
      numbers: ['3', '2', '1'],
      activePage: '2',
    },
  ],
  [
    {
      items: 27,
      page: 0,
      pageSize: 20,
      payloadPagination: { page: 2, per_page: 20, total_pages: 2, total_items: 27 },
      reversed: true,
      totalItems: 27,
    },
    {
      segmentInfo: '27-1 of 27',
      numbers: ['1'],
      activePage: '1',
    },
  ],
  [
    {
      items: 5,
      page: 1,
      pageSize: 10,
      payloadPagination: undefined,
      reversed: false,
      totalItems: 35,
    },
    {
      segmentInfo: '1-10 of 35',
      numbers: ['1', '2', '3', '4'],
      activePage: '1',
    },
  ],
  [
    {
      items: 5,
      page: 4,
      pageSize: 10,
      payloadPagination: undefined,
      reversed: false,
      totalItems: 35,
    },
    {
      segmentInfo: '31-35 of 35',
      numbers: ['1', '2', '3', '4'],
      activePage: '4',
    },
  ],
  [
    {
      items: 7,
      page: 2,
      pageSize: 20,
      payloadPagination: undefined,
      reversed: false,
      totalItems: 27,
    },
    {
      segmentInfo: '21-27 of 27',
      numbers: ['1', '2'],
      activePage: '2',
    },
  ],
])(
  'BasePagination reversed and usual display correctness',
  async ({ items, page, pageSize, payloadPagination, reversed, totalItems }, expected) => {
    const wrapper = mount(BasePagination, {
      props: {
        items,
        page,
        pageSize,
        payloadPagination,
        reversed,
        totalItems,
      },
      global: {
        plugins: [i18n],
      },
    });

    function getSegmentInfo() {
      return wrapper.find('.base-pagination__segment-info').text();
    }

    function getActivePage() {
      return wrapper.find('[data-active]').text();
    }

    function getPagesList() {
      return wrapper.findAll('.base-pagination__item-numbers-number').map((i) => i.text());
    }

    expect(getSegmentInfo()).toBe(expected.segmentInfo);
    expect(getActivePage()).toBe(expected.activePage);
    expect(getPagesList()).toStrictEqual(expected.numbers);
  }
);
