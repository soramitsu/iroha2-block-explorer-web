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
          <div
            class="latest-blocks__row"
            tabindex="0"
            role="link"
            @click="handleRowClick(block.height)"
            @keydown.enter.space="handleRowClick(block.height)"
          >
            <div class="latest-blocks__row-block-height row-text">
              {{ block.transactions_hash ? '◉' : 'O' }}
              <span class="row-text-monospace">{{ block.height }}</span>
            </div>

            <div class="latest-blocks__row-time">
              <TimeIcon class="latest-blocks__row-time-icon" />
              <TimeStamp :value="block.created_at" />
            </div>

            <span class="latest-blocks__row-number row-text-monospace">{{ block.transactions_total }} txns</span>
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
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import { computed } from 'vue';
import TimeStamp from '@/shared/ui/components/TimeStamp.vue';
import { setupAsyncData } from '@/shared/utils/setup-async-data';
import { useRouter } from 'vue-router';
import { SUCCESSFUL_FETCHING } from '@/shared/api/consts';

const router = useRouter();

const setup = setupAsyncData(() => http.fetchBlocks({ per_page: 10 }));

const isLoading = computed(() => setup.isLoading);
const blocks = computed(() => (setup.data?.status === SUCCESSFUL_FETCHING ? setup.data.data.items : []));

function handleRowClick(height: number) {
  router.push(`/blocks/${height}`);
}
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.latest-blocks {
  &_loading {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }

  &__row {
    cursor: pointer;
    padding: size(1) size(4);
    border-bottom: 1px solid theme-color('border-primary');
    justify-content: space-between;
    align-items: center;
    min-height: 64px;
    display: flex;

    &:hover {
      box-shadow: theme-shadow('row');
      border-color: transparent;
    }

    & > * {
      width: fit-content;
    }

    @include sm {
      padding: 0 size(4);
    }

    &-block-height {
      width: size(10);
    }

    &-time {
      user-select: none;
      cursor: default;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: size(18);
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

    &-number {
      width: size(11);
      text-align: right;
      color: theme-color('content-primary');
    }
  }
}
</style>
