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
            <BaseLink :to="`/blocks/${block.header.height}`">
              {{ block.header.height }}
            </BaseLink>

            <div class="latest-blocks__time">
              <TimeIcon class="latest-blocks__time-icon" />
              {{ $t('time.min', [elapsed.allMinutes(block.header.created_at)]) }}
              {{ $t('time.sec', [elapsed.seconds(block.header.created_at)]) }}
              {{ $t('time.ago') }}
            </div>

            <span class="latest-blocks__number">{{ block.transactions.length }} txns</span>
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
import { http } from '@/shared/api';
import { elapsed } from '@/shared/lib/time';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import type { Block } from '@/shared/api/dto';
import { blockSchema } from '@/shared/api/dto';
import { onMounted, ref, shallowRef } from 'vue';
import { useErrorHandlers } from '@/shared/ui/composables/useErrorHandlers';

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
    display: grid;
    width: size(24);
    grid-gap: size(1);
    grid-auto-flow: column;
    color: theme-color('content-primary');
    @include tpg-s3;

    &-icon {
      path {
        fill: theme-color('content-quaternary');
      }
    }
  }

  &__number {
    color: theme-color('content-primary');
    @include tpg-s3;
  }
}
</style>
