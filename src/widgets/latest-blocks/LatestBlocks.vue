<template>
  <BaseContentBlock
    :title="$t('widgets.latestBlocks')"
    class="latest-blocks"
  >
    <template #header-action>
      <BaseButton line>
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
              {{ getTimeAgo(now.getTime(), block.created_at) }}
              <Tooltip :message="defaultFormat(block.created_at)" />
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
import { defaultFormat, getTimeAgo } from '@/shared/lib/time';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import type { Block } from '@/shared/api/schemas';
import { onMounted, ref, shallowRef } from 'vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';
import { useNow } from '@vueuse/core';
import Tooltip from '@/shared/ui/components/ContextTooltip.vue';

const now = useNow({ interval: 1000 });

const blocks = shallowRef<Block[]>([]);
const isLoading = ref(false);

const { handleUnknownError } = useErrorHandlers();

onMounted(async () => {
  try {
    isLoading.value = true;

    const { items } = await http.fetchBlocks();

    blocks.value = items;
  } catch (error) {
    handleUnknownError(error);
  } finally {
    isLoading.value = false;
  }
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
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: default;
    display: grid;
    width: size(24);
    grid-gap: size(1);
    grid-auto-flow: column;
    color: theme-color('content-primary');
    @include tpg-s3;
    position: relative;

    &-icon {
      path {
        fill: theme-color('content-quaternary');
      }
    }

    &:hover .context-tooltip {
      display: flex;
      left: size(24);
    }
  }

  &__number {
    color: theme-color('content-primary');
    @include tpg-s3;
  }
}
</style>
