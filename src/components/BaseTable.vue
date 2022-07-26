<template>
  <div class="base-table">
    <div v-if="width >= 1200" class="content-row">
      <slot name="header" />
    </div>

    <div class="base-table__content">
      <template v-for="(item, i) in items" :key="i">
        <div v-if="item && width >= 1200" class="content-row content-row--with-hover">
          <slot name="row" :item="item" />
        </div>

        <div v-else-if="item && width < 1200" class="base-table__mobile-card">
          <slot name="mobile-card" :item="item" />
        </div>

        <BaseLoading v-else-if="i === Math.floor(items.length / 2)" />
      </template>
    </div>

    <hr>

    <div class="base-table__pagination">
      <div class="base-table__pagination-item">
        <div class="base-table__segment-info">
          {{ segmentInfo }}
        </div>

        <BaseDropdown
          :items="sizeOptions"
          :model-value="props.pagination.page_size"
          :field-label="$t('rowsPerPage')"
          width="175px"
          @update:model-value="emit('setSize', $event as number)"
        />
      </div>

      <div class="base-table__pagination-item">
        <div class="base-table__numbers">
          <span
            v-for="(item, i) in numbers"
            :key="i"
            class="base-table__number"
            :data-active="item === props.pagination.page || null"
            @click="Number.isInteger(item) ? emit('setPage', item as number) : null"
          >
            {{ item }}
          </span>
        </div>

        <div class="base-table__arrows">
          <ArrowIcon class="base-table" @click="emit('prevPage')" />
          <ArrowIcon class="base-table" @click="emit('nextPage')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseDropdown from '@/components/BaseDropdown.vue';
import ArrowIcon from '@/icons/arrow.svg';
import BaseLoading from './BaseLoading.vue';
import { useWindowSize } from '@vueuse/core';
import type { TablePagination } from '@/composables/table';

type Props = {
  loading: boolean;
  pagination: TablePagination;
  items: any[];
};

type Emits = {
  (e: 'nextPage'): void,
  (e: 'prevPage'): void,
  (e: 'setPage', value: number): void,
  (e: 'setSize', value: number): void,
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { width } = useWindowSize();

const items = computed(() => {
  if (props.loading) {
    return Array.from({ length: props.pagination.page_size }, () => null);
  }

  return props.items;
});

const segmentInfo = computed(() => {
  const p = props.pagination;
  const start = (p.page - 1) * p.page_size + 1;
  const end = p.page * p.page_size;
  return `${start}—${end > p.total ? p.total : end} of ${p.total}`;
});

const numbers = computed(() => {
  const p = props.pagination;
  if (p.pages < 10) {
    return new Array(p.pages).fill(0).map((_, i) => i + 1);
  }

  let start = (p.page - 3);
  let end = (p.page + 3);

  if (start < 3) {
    return Array(8).fill(0).map<string|number>((_, i) => i + 1).concat(['. . .', p.pages]);
  }

  if ((p.pages - end) < 3) {
    return [1, '. . .'].concat(Array(8).fill(0).map((_, i) => p.pages - i).reverse());
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
</script>

<style lang="scss">
@import 'styles';

.base-table {
  &__content {
    display: grid;
    grid-template-columns: 1fr;

    @include sm {
      grid-template-columns: 1fr 1fr;
    }

    @include lg {
      grid-template-columns: 1fr;
    }
  }

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
    padding: size(3) size(4) 0 size(4);
    display: grid;
    grid-template-columns: auto;
    align-items: center;
    justify-items: center;
    grid-gap: size(2);

    @include sm {
      grid-template-columns: auto auto;
      justify-content: space-between;
    }
  }

  &__pagination-item {
    display: flex;
    align-items: center;
  }

  &__segment-info {
    @include tpg-s4;
    color: theme-color('content-quaternary');
    margin-right: size(3);
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
      fill: theme-color('content-primary');
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
    padding: 0 size(1);
    margin-right: size(0.5);
    cursor: pointer;

    &[data-active] {
      color: theme-color('primary');
    }
  }
}
</style>
