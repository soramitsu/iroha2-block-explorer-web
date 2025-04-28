<template>
  <div class="base-table">
    <div
      v-if="$slots.header && width >= props.breakpoint && !isEmpty"
      class="content-row"
    >
      <slot name="header" />
    </div>
    <div
      v-else-if="props.loading"
      class="content-row content-row_empty"
    >
      <BaseLoading />
    </div>
    <div
      v-else-if="isEmpty"
      class="content-row content-row_empty row-text"
    >
      {{ $t('noData') }}
    </div>

    <div :class="containerClass">
      <template
        v-for="(item, i) in items"
        :key="i"
      >
        <div
          v-if="item && (width >= props.breakpoint || !$slots['mobile-card'])"
          class="content-row content-row--with-hover"
          :style="{ cursor: props.rowPointer ? 'pointer' : 'default' }"
          @click="emit('click:row', item)"
        >
          <slot
            name="row"
            :item
          />
        </div>

        <div
          v-else-if="$slots['mobile-card'] && item && width < props.breakpoint"
          class="base-table__mobile-card"
        >
          <slot
            name="mobile-card"
            :item
          />
        </div>

        <div
          v-else
          class="content-row content-row_empty"
        />
      </template>
    </div>

    <BasePagination
      v-if="!props.disablePagination"
      v-model:page="page"
      v-model:page-size="pageSize"
      :total-items="props.total"
      :reversed="props.reversed"
      :items="props.items.length"
      :payload-pagination
    />
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
import BaseLoading from './BaseLoading.vue';
import BasePagination from '@/shared/ui/components/BasePagination.vue';
import type { Pagination } from '@/shared/api/schemas';

interface Props {
  loading: boolean
  total?: number
  payloadPagination?: Pagination
  disablePagination?: boolean
  items: T[]
  containerClass: string
  breakpoint?: number
  reversed?: boolean
  rowPointer?: boolean
}

const emit = defineEmits<{
  'click:row': [data: T]
}>();

const props = withDefaults(defineProps<Props>(), {
  breakpoint: 1200,
  disablePagination: false,
  rowPointer: false,
});

const page = defineModel<number>('page', { default: 1 });
const pageSize = defineModel<number>('pageSize', { default: 10 });

const { width } = useWindowSize();

const items = computed(() => {
  if (!props.loading) return props.items;

  if (!props.items.length) return [];

  return Array.from({ length: pageSize.value }, () => null);
});

const isEmpty = computed(() => !items.value.some((i) => i));
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

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
}
</style>
