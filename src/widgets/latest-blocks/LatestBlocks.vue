<template>
  <BaseContentBlock
    :title="$t('widgets.latestBlocks')"
    class="latest-blocks"
  >
    <template #header-action>
      <BaseButton
        line
        to="/blocks"
      >
        {{ $t('viewAll') }}
      </BaseButton>
    </template>

    <template #default>
      <div v-if="!isLoading">
        <template
          v-for="block in blocks"
          :key="block.height"
        >
          <div class="latest-blocks__row">
            <BaseLink :to="`/blocks/${block.height}`">
              {{ block.height }}
            </BaseLink>

            <div class="latest-blocks__time">
              <TimeIcon class="latest-blocks__time-icon" />
              <TimeStamp :value="block.created_at" />
            </div>

            <span class="latest-blocks__number">{{ block.transactions_total }} txns</span>
          </div>
        </template>
      </div>
      <BaseLoading
        v-else
        class="latest-blocks_loading"
      />
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import TimeIcon from '@/shared/ui/icons/clock.svg';
import * as http from '@/shared/api';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { computed, watch } from 'vue';
import TimeStamp from '@/shared/ui/components/TimeStamp.vue';
import { useParamScope } from '@vue-kakuyaku/core';
import { handleParamScope } from '@/shared/api/handle-param-scope';

const emit = defineEmits<{
  loaded: [number]
}>();

const scope = useParamScope(
  () => {
    return {
      key: 'latest-blocks',
      payload: {
        per_page: 10,
      },
    };
  },
  ({ payload }) => handleParamScope(payload, http.fetchBlocks)
);

const isLoading = computed(() => scope.value?.expose.isLoading);
const blocks = computed(() => scope.value?.expose.data?.items ?? []);
const total = computed(() => scope.value?.expose.data?.pagination?.total_items ?? 0);

watch(total, () => {
  emit('loaded', total.value);
});
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.latest-blocks {
  &_loading {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }

  &__row {
    padding: size(1) size(4);
    border-bottom: 1px solid theme-color('border-primary');
    display: grid;
    grid-gap: size(1);
    grid-template-columns: 70px auto;
    justify-content: start;
    align-items: center;
    min-height: 64px;

    &:hover {
      box-shadow: theme-shadow('row');
      border-color: transparent;
    }

    & > * {
      width: fit-content;
    }

    @include xs {
      grid-template-columns: 70px auto 70px;
      justify-content: space-between;
    }

    @include sm {
      padding: 0 size(4);
    }
  }

  &__time {
    user-select: none;
    cursor: default;
    display: flex;
    justify-content: center;
    width: size(24);
    gap: size(2);
    position: relative;

    &-icon {
      path {
        fill: theme-color('content-quaternary');
      }
    }

    &:hover .context-tooltip {
      display: flex;
      left: size(20);
    }
  }

  &__number {
    color: theme-color('content-primary');
    @include tpg-s3;
  }
}
</style>
