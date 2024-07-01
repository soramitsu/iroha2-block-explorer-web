<template>
  <BaseContentBlock
    :title="$t('latestBlocks')"
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
      <div v-if="!blocksStore.isLoading">
        <template
          v-for="block in blocksStore.blocks"
          :key="block.height"
        >
          <div class="latest-blocks__row">
            <BaseLink :to="`/blocks/${block.height}`">
              {{ block.height }}
            </BaseLink>

            <div class="latest-blocks__time">
              <TimeIcon />
              {{ $t('time.min', [elapsed.allMinutes(block.timestamp)]) }}
              {{ $t('time.sec', [elapsed.seconds(block.timestamp)]) }}
              {{ $t('time.ago') }}
            </div>

            <span class="latest-blocks__number">{{ block.transactions }} txns</span>
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
import { onMounted } from 'vue';
import TimeIcon from '@/core/assets/clock.svg';
import { elapsed } from '@/core/utils/time';
import BaseLink from '@/core/components/BaseLink.vue';
import BaseButton from '@/core/components/BaseButton.vue';
import BaseContentBlock from '@/core/components/BaseContentBlock.vue';
import { useBlocksStore } from '@/stores/blocks';
import BaseLoading from '@/core/components/BaseLoading.vue';

const blocksStore = useBlocksStore();

const params = {
  page: 1,
  page_size: 10,
};

onMounted(async () => {
  try {
    await blocksStore.fetchBlocks(params);
  } catch (e) {
    console.log(e);
  }
});
</script>

<style lang="scss">
@import '@/styles/main';

.latest-blocks {
  &_loading {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }

  &__row {
    padding: size(1) size(2);
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
    grid-gap: size(1);
    grid-auto-flow: column;
    color: theme-color('content-primary');
    @include tpg-s3;
  }

  path {
    fill: theme-color('content-quaternary');
  }

  &__number {
    color: theme-color('content-primary');
    @include tpg-s3;
  }
}
</style>
