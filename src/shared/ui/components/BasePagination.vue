<script setup lang="ts">
import ArrowIcon from '@/shared/ui/icons/arrow.svg';
import BaseDropdown from '@/shared/ui/components/BaseDropdown.vue';
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
import type { Pagination } from '@/shared/api/schemas';
import { usePagination } from '@/shared/ui/composables/usePagination';
import { useI18n } from 'vue-i18n';

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

const page = defineModel<number>('page', { default: 1 });
const pageSize = defineModel<number>('pageSize', { default: 10 });

const isMobile = computed(() => width.value < props.paginationBreakpoint);

const { t } = useI18n();

const { displayRange, numbers } = usePagination({
  items: computed(() => props.items),
  reversed: props.reversed,
  totalItems: computed(() => props.totalItems),
  totalPages,
  page,
  pageSize,
  activePage,
  isMobile,
});

const segmentInfo = computed(() => {
  return t('table.pageOf', [displayRange.value.start, displayRange.value.end, displayRange.value.total]);
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

const shouldShowDropdown = computed(
  () => (props.reversed && props.totalItems > 19) || (!props.reversed && props.totalItems > 10)
);
const shouldShowPrevArrow = computed(
  () => (props.reversed && activePage.value !== numbers.value.length) || (!props.reversed && page.value !== 1)
);
const shouldShowNextArrow = computed(
  () => (props.reversed && activePage.value !== 1) || (!props.reversed && page.value !== numbers.value.length)
);
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
        v-if="shouldShowDropdown"
        v-model="pageSize"
        :items="sizeOptions"
        :field-label="$t('table.rowsPerPage')"
        width="175px"
      />
    </div>

    <div
      v-if="numbers.length > 1"
      class="base-pagination__item"
    >
      <div class="base-pagination__item-numbers">
        <span
          v-for="(item, i) in numbers"
          :key="i"
          class="base-pagination__item-numbers-number"
          :data-active="isPageActive(item)"
          role="button"
          :aria-pressed="!!isPageActive(item)"
          tabindex="0"
          @click="Number.isInteger(item) && setPage(Number(item))"
          @keydown.enter.space="Number.isInteger(item) && setPage(Number(item))"
        >
          {{ item }}
        </span>
      </div>

      <div class="base-pagination__arrows">
        <ArrowIcon
          v-if="shouldShowPrevArrow"
          data-testid="prev"
          role="button"
          tabindex="0"
          @click="prevPage"
          @keydown.enter.space="prevPage"
        />
        <ArrowIcon
          v-if="shouldShowNextArrow"
          data-testid="next"
          role="button"
          tabindex="0"
          @click="nextPage"
          @keydown.enter.space="nextPage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/shared/ui/styles/main' as *;

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
          cursor: default;
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
    display: flex;

    & > svg {
      display: flex;
      align-items: center;
      justify-content: center;
      height: size(3);
      width: size(3);
      padding: 4px;
      color: theme-color('content-primary');
      cursor: pointer;

      &[data-testid='prev'] {
        transform: rotateY(180deg);
      }
    }
  }
}
</style>
