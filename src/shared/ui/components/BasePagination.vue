<script setup lang="ts">
import ArrowIcon from '@/shared/ui/icons/arrow.svg';
import BaseDropdown from '@/shared/ui/components/BaseDropdown.vue';
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import type { Pagination } from '@/shared/api/schemas';

const { t } = useI18n();
const { width } = useWindowSize();

const props = withDefaults(
  defineProps<{
    totalItems?: number
    reversed?: boolean
    payloadPagination?: Pagination | null
    paginationBreakpoint?: number
    items: number
  }>(),
  {
    reversed: false,
    paginationBreakpoint: 960,
    payloadPagination: null,
    totalItems: 0,
  }
);

const isLengthBiggerThanPerPage = computed(() => props.totalItems % pageSize.value > 0);

const totalPages = computed(() => {
  if (!props.reversed) return Math.ceil(props.totalItems / pageSize.value);

  if (!props.payloadPagination) return 0;

  if (isLengthBiggerThanPerPage.value) {
    if (props.items < pageSize.value) return props.payloadPagination.total_pages;

    return props.payloadPagination.total_pages - 1;
  }

  return props.payloadPagination.total_pages;
});

const activePage = computed(() => {
  if (!props.payloadPagination) return 0;

  if (isLengthBiggerThanPerPage.value && props.items > pageSize.value) {
    return props.payloadPagination.page - 1;
  }

  return props.payloadPagination.page;
});

const segmentInfo = computed(() => {
  if (!props.totalItems) return t('table.pageOf', [0, 0, 0]);

  const start = (page.value - 1) * pageSize.value + 1;
  const end = page.value * pageSize.value;

  if (props.reversed && activePage.value) {
    if (pageSize.value > props.totalItems) return t('table.pageOf', [props.totalItems, 1, props.totalItems]);

    const start = (activePage.value - 1) * pageSize.value + props.items;

    const end = start - props.items + 1;

    return t('table.pageOf', [start, end, props.totalItems]);
  }

  return t('table.pageOf', [start, end > props.totalItems ? props.totalItems : end, props.totalItems]);
});

// FIXME: write unit tests
const numbers = computed(() => {
  if (!props.totalItems) return [];

  const isMobile = width.value < props.paginationBreakpoint;
  const max = isMobile ? 6 : 10;
  const side = isMobile ? 4 : 7;
  const offset = isMobile ? 1 : 3;

  if (totalPages.value < max) {
    const numbersArray = new Array(totalPages.value).fill(0).map((_, i) => i + 1);
    return props.reversed ? numbersArray.reverse() : numbersArray;
  }

  if ((props.reversed && activePage.value < side) || (!props.reversed && page.value < side)) {
    const numbersArray = Array(side)
      .fill(0)
      .map<string | number>((_, i) => i + 1);

    return props.reversed
      ? [totalPages.value, '. . .'].concat(numbersArray.reverse())
      : numbersArray.concat(['. . .', totalPages.value]);
  }

  if (
    (props.reversed && activePage.value > totalPages.value - side + 1) ||
    (!props.reversed && page.value > totalPages.value - side + 1)
  ) {
    if (props.reversed) {
      return Array(side)
        .fill(totalPages.value)
        .map<string | number>((_, i) => _ - i)
        .concat(['. . .', 1]);
    }
    return [1, '. . .'].concat(
      Array(side)
        .fill(0)
        .map((_, i) => totalPages.value - i)
        .reverse()
    );
  }

  const start = Math.max(page.value - offset, 1);
  const end = Math.min(page.value + offset, totalPages.value);

  const middleNumbers = new Array(end - start + 1).fill(0).map((_, i) => i + start);

  return props.reversed
    ? [totalPages.value, '. . .', ...middleNumbers.reverse(), '. . .', 1]
    : [1, '. . .', ...middleNumbers, '. . .', totalPages.value];
});

const sizeOptions = [
  {
    label: '10',
    value: 10,
  },
  {
    label: '20',
    value: 20,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];

const page = defineModel<number>('page', { default: 1 });
const pageSize = defineModel<number>('pageSize', { default: 10 });

function nextPage() {
  if (props.reversed && activePage.value > 1) page.value = activePage.value - 1;
  else if (!props.reversed && page.value < totalPages.value) page.value++;
}

function prevPage() {
  if (props.reversed) {
    if (totalPages.value === activePage.value + 1) page.value = 0;
    else if (activePage.value < totalPages.value) page.value = activePage.value + 1;
  } else if (page.value > 1) page.value--;
}

function setPage(i: number) {
  if (props.reversed && totalPages.value === i) page.value = 0;
  else if (i !== page.value) page.value = i;
}

function isPageActive(item: string | number) {
  if (activePage.value === Number(item) || item === page.value) return true;

  return null;
}
</script>

<template>
  <div class="base-pagination">
    <div
      v-if="props.totalItems"
      class="base-pagination__item"
    >
      <div class="base-pagination__segment-info">
        {{ segmentInfo }}
      </div>

      <BaseDropdown
        v-model="pageSize"
        :items="sizeOptions"
        :field-label="$t('table.rowsPerPage')"
        width="175px"
      />
    </div>

    <div class="base-pagination__item">
      <div class="base-pagination__item-numbers">
        <span
          v-for="(item, i) in numbers"
          :key="i"
          class="base-pagination__item-numbers-number"
          :data-active="isPageActive(item)"
          @click="Number.isInteger(item) && setPage(Number(item))"
        >
          {{ item }}
        </span>
      </div>

      <div
        v-if="props.totalItems"
        class="base-pagination__arrows"
      >
        <ArrowIcon
          class="base-table"
          @click="prevPage"
        />
        <ArrowIcon
          class="base-table"
          @click="nextPage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/shared/ui/styles/main';

.base-pagination {
  z-index: 0;
  padding: size(2) size(2) 0 size(2);
  display: grid;
  grid-template-columns: auto;
  align-items: center;
  justify-items: center;
  grid-gap: size(2);
  align-self: end;
  border-top: 1px solid theme-color('border-primary');

  @include sm {
    grid-template-columns: auto auto;
    justify-content: space-between;
    padding: size(3) size(4) 0 size(4);
  }

  &__item {
    display: flex;
    align-items: center;

    &-numbers {
      display: flex;
      align-items: center;
      margin-left: auto;
      user-select: none;

      &-number {
        @include tpg-s5-bold;
        color: theme-color('content-primary');
        padding: 0 size(0.75);
        margin-right: size(0.25);
        cursor: pointer;

        @include xs {
          padding: 0 size(1);
        }

        &[data-active] {
          color: theme-color('primary');
        }
      }
    }
  }

  &__segment-info {
    @include tpg-s4;
    color: theme-color('content-quaternary');
    margin-right: size(1);
    user-select: none;

    @include sm {
      margin-right: size(3);
    }
  }

  &__arrows {
    display: grid;
    grid-template-columns: size(3) size(3);
    grid-gap: size(1);

    & > svg {
      display: flex;
      align-items: center;
      justify-content: center;
      height: size(3);
      width: size(3);
      padding: 4px;
      color: theme-color('content-primary');
      cursor: pointer;

      &:first-child {
        transform: rotateY(180deg);
      }
    }
  }
}
</style>
