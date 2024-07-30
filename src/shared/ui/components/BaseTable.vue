<template>
  <div class="base-table">
    <div
      v-if="$slots.header && width >= props.breakpoint"
      class="content-row"
    >
      <slot name="header" />
    </div>

    <div :class="containerClass">
      <template
        v-for="(item, i) in items"
        :key="i"
      >
        <div
          v-if="item && (width >= props.breakpoint || !$slots['mobile-card'])"
          class="content-row content-row--with-hover"
        >
          <slot
            name="row"
            :item="item"
          />
        </div>

        <div
          v-else-if="$slots['mobile-card'] && item && width < props.breakpoint"
          class="base-table__mobile-card"
        >
          <slot
            name="mobile-card"
            :item="item"
          />
        </div>

        <BaseLoading v-else-if="i === Math.floor(items.length / 2)" />
      </template>
    </div>

    <div
      v-if="props.pagination"
      class="base-table__pagination"
    >
      <div class="base-table__pagination-item">
        <div class="base-table__segment-info">
          {{ segmentInfo }}
        </div>

        <BaseDropdown
          v-model="pageSizeModel"
          :items="sizeOptions"
          :field-label="$t('rowsPerPage')"
          width="175px"
        />
      </div>

      <div class="base-table__pagination-item">
        <div class="base-table__numbers">
          <span
            v-for="(item, i) in numbers"
            :key="i"
            class="base-table__number"
            :data-active="item === props.pagination.page || null"
            @click="Number.isInteger(item) ? emit('setPage', Number(item)) : null"
          >
            {{ item }}
          </span>
        </div>

        <div class="base-table__arrows">
          <ArrowIcon
            class="base-table"
            @click="emit('prevPage')"
          />
          <ArrowIcon
            class="base-table"
            @click="emit('nextPage')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
import ArrowIcon from '@/shared/ui/icons/arrow.svg';
import BaseLoading from './BaseLoading.vue';
import type { TablePagination } from '@/shared/lib/table';
import BaseDropdown from '@/shared/ui/components/BaseDropdown.vue';

interface Props {
  loading: boolean
  pagination?: TablePagination | null
  items: any[]
  containerClass: string
  breakpoint?: string | number
}

interface Emits {
  (e: 'nextPage'): void
  (e: 'prevPage'): void
  (e: 'setPage', value: number): void
  (e: 'setSize', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  breakpoint: 1200,
  pagination: null,
});
const emit = defineEmits<Emits>();

const { width } = useWindowSize();

const PAGINATION_BREAKPOINT = 960;

const items = computed(() => {
  if (props.loading && props.pagination) {
    return Array.from({ length: props.pagination.page_size }, () => null);
  }

  return props.items;
});

const segmentInfo = computed(() => {
  if (!props.pagination) return '';

  const p = props.pagination;
  const start = (p.page - 1) * p.page_size + 1;
  const end = p.page * p.page_size;
  return `${start}—${end > p.total ? p.total : end} of ${p.total}`;
});

const numbers = computed(() => {
  if (!props.pagination) return [];

  const isMobile = width.value < PAGINATION_BREAKPOINT;
  const max = isMobile ? 6 : 10;
  const side = isMobile ? 4 : 7;
  const offset = isMobile ? 1 : 3;

  const p = props.pagination;
  if (p.pages < max) {
    return new Array(p.pages).fill(0).map((_, i) => i + 1);
  }

  let start = p.page - offset;
  let end = p.page + offset;

  if (p.page < side) {
    return Array(side)
      .fill(0)
      .map<string | number>((_, i) => i + 1)
      .concat(['. . .', p.pages]);
  }

  if (p.page > p.pages - side + 1) {
    return [1, '. . .'].concat(
      Array(side)
        .fill(0)
        .map((_, i) => p.pages - i)
        .reverse()
    );
  }

  start = start < 1 ? 1 : start;
  end = end > p.pages ? p.pages : end;

  return [1, '. . .', ...new Array(end - start + 1).fill(0).map((_, i) => i + start), '. . .', p.pages];
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

const pageSizeModel = computed({
  get: () => props.pagination?.page_size ?? 0,
  set: (v) => emit('setSize', v),
});
</script>

<style lang="scss" scoped>
@import '@/shared/ui/styles/main';

.base-table {
  display: grid;
  grid-auto-rows: auto;

  &__mobile-card {
    border-top: 1px solid theme-color('border-primary');

    @include sm {
      &:nth-child(2n - 1) {
        border-right: 1px solid theme-color('border-primary');
      }
    }

    @include lg {
      border-right: none;
    }
  }

  &__pagination {
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
  }

  &__pagination-item {
    display: flex;
    align-items: center;
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

  &__numbers {
    display: flex;
    align-items: center;
    margin-left: auto;
    user-select: none;
  }

  &__number {
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
</style>
